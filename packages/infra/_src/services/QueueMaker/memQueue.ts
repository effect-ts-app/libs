import { pretty } from "@effect-app/core/utils"
import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { RequestId } from "@effect-app/prelude/ids"
import { Tracer } from "effect"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure } from "./errors.js"
import { type QueueBase, QueueMeta } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeMem
 */
export function makeMemQueue<
  DrainR,
  Evt,
  DrainEvt extends { id: StringId; _tag: string },
  EvtE,
  DrainE
>(
  queueName: string,
  queueDrainName: string,
  schema: Schema.Schema<unknown, Evt, any, EvtE, any>,
  drainSchema: Schema.Schema<unknown, DrainEvt, any, any, any>,
  makeHandleEvent: Effect<DrainR, never, (ks: DrainEvt) => Effect<never, DrainE, void>>
) {
  return Effect.gen(function*($) {
    const mem = yield* $(MemQueue)
    const q = yield* $(mem.getOrCreateQueue(queueName))
    const qDrain = yield* $(mem.getOrCreateQueue(queueDrainName))
    const rcc = yield* $(RequestContextContainer)

    const wireSchema = props({ body: schema, meta: QueueMeta })
    const encoder = wireSchema.Encoder
    const drainW = props({ body: drainSchema, meta: QueueMeta })
    const parseDrain = drainW.parseCondemnDie

    return {
      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(rcc.requestContext)
          const currentSpan = yield* $(Effect.currentSpan)
          const span = currentSpan.map(Tracer.externalSpan).value
          return yield* $(
            messages
              .forEachEffect((m) =>
                // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
                Effect(
                  JSON.stringify(
                    encoder({ body: m, meta: { requestContext, span } })
                  )
                )
                  // .tap((msg) => info("Publishing Mem Message: " + utils.inspect(msg)))
                  .flatMap((_) => q.offer(_))
                  .asUnit
              )
              .forkDaemonReportQueue
          )
        }),
      drain: Effect.gen(function*($) {
        const handleEvent = yield* $(makeHandleEvent)
        const silenceAndReportError = reportNonInterruptedFailure({ name: "MemQueue.drain." + queueDrainName })
        const processMessage = (msg: string) =>
          // we JSON parse, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
          Effect(JSON.parse(msg))
            .flatMap(parseDrain)
            .orDie
            .flatMap(({ body, meta }) =>
              Effect
                .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                .apply(Effect.annotateLogs({ body: body.$$.pretty, meta: pretty(meta) }))
                .zipRight(handleEvent(body))
                .apply(silenceAndReportError)
                .setupRequestContext(RequestContext.inherit(meta.requestContext, {
                  id: RequestId(body.id),
                  locale: "en" as const,
                  name: ReasonableString(body._tag)
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
            .apply(silenceAndReportError)
            .forever
            .forkScoped
        )
      })
    } satisfies QueueBase<DrainR, Evt>
  })
}
