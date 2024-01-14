import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import type { S } from "@effect-app/prelude"
import { RequestId } from "@effect-app/prelude/ids"
import { Tracer } from "effect"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure } from "./errors.js"
import { type QueueBase, QueueMeta } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeMem
 */
export function makeMemQueue<
  Evt extends { id: StringId; _tag: string },
  DrainEvt extends { id: StringId; _tag: string },
  EvtE,
  DrainEvtE
>(
  queueName: string,
  queueDrainName: string,
  schema: S.Schema<EvtE, Evt>,
  drainSchema: S.Schema<DrainEvtE, DrainEvt>
) {
  return Effect.gen(function*($) {
    const mem = yield* $(MemQueue)
    const q = yield* $(mem.getOrCreateQueue(queueName))
    const qDrain = yield* $(mem.getOrCreateQueue(queueDrainName))
    const rcc = yield* $(RequestContextContainer)

    const wireSchema = struct({ body: schema, meta: QueueMeta })
    const drainW = struct({ body: drainSchema, meta: QueueMeta })
    const parseDrain = flow(drainW.parse, (_) => _.orDie)

    return {
      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(rcc.requestContext)
          const currentSpan = yield* $(Effect.currentSpan.orDie)
          const span = Tracer.externalSpan(currentSpan)
          return yield* $(
            messages
              .forEachEffect((m) =>
                // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
                Effect(
                  JSON.stringify(
                    wireSchema.encodeSync({ body: m, meta: { requestContext, span } })
                  )
                )
                  // .tap((msg) => info("Publishing Mem Message: " + utils.inspect(msg)))
                  .flatMap((_) => q.offer(_))
                  .asUnit
              )
              .forkDaemonReportQueue
          )
        }),
      makeDrain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<DrainR, DrainE, void>
      ) =>
        Effect.gen(function*($) {
          const silenceAndReportError = reportNonInterruptedFailure({ name: "MemQueue.drain." + queueDrainName })
          const processMessage = (msg: string) =>
            // we JSON parse, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
            Effect(JSON.parse(msg))
              .flatMap(parseDrain)
              .orDie
              .flatMap(({ body, meta }) =>
                Effect
                  .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                  .pipe(Effect.annotateLogs({ body: body.$$.pretty, meta: meta.$$.pretty }))
                  .zipRight(handleEvent(body))
                  .pipe(silenceAndReportError)
                  .setupRequestContext(RequestContext.inherit(meta.requestContext, {
                    id: RequestId(body.id),
                    locale: "en" as const,
                    name: NonEmptyString255(body._tag)
                  }))
                  .withSpan("queue.drain", {
                    attributes: { "queue.name": queueDrainName },
                    parent: meta.span
                      ? Tracer.externalSpan(meta.span)
                      : undefined
                  })
              )
          return yield* $(
            qDrain
              .take
              .flatMap((x) => processMessage(x).uninterruptible.fork.flatMap((_) => _.join))
              // TODO: normally a failed item would be returned to the queue and retried up to X times.
              // .flatMap(_ => _._tag === "Failure" && !isInterrupted ? qDrain.offer(x) : Effect.unit) // TODO: retry count tracking and max retries.
              .pipe(silenceAndReportError)
              .forever
              .forkScoped
          )
        })
    } satisfies QueueBase<Evt, DrainEvt>
  })
}
