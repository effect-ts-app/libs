import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { NonEmptyString255, struct } from "@effect-app/schema"
import { Tracer } from "effect"
import { Effect, Fiber, flow, S } from "effect-app"
import { RequestId } from "effect-app/ids"
import { pretty } from "effect-app/utils"
import { setupRequestContext } from "../../api/setupRequest.js"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure } from "./errors.js"
import { type QueueBase, QueueMeta } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeMem
 */
export function makeMemQueue<
  Evt extends { id: S.StringId; _tag: string },
  DrainEvt extends { id: S.StringId; _tag: string },
  EvtE,
  DrainEvtE
>(
  queueName: string,
  queueDrainName: string,
  schema: S.Schema<Evt, EvtE>,
  drainSchema: S.Schema<DrainEvt, DrainEvtE>
) {
  return Effect.gen(function*($) {
    const mem = yield* $(MemQueue)
    const q = yield* $(mem.getOrCreateQueue(queueName))
    const qDrain = yield* $(mem.getOrCreateQueue(queueDrainName))
    const rcc = yield* $(RequestContextContainer)

    const wireSchema = struct({ body: schema, meta: QueueMeta })
    const drainW = struct({ body: drainSchema, meta: QueueMeta })
    const parseDrain = flow(S.decodeUnknown(drainW), Effect.orDie)

    return {
      publish: (...messages) =>
        Effect
          .gen(function*($) {
            const requestContext = yield* $(rcc.requestContext)
            const currentSpan = yield* $(Effect.currentSpan.pipe(Effect.orDie))
            const span = Tracer.externalSpan(currentSpan)
            return yield* $(
              Effect
                .forEach(messages, (m) =>
                  // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
                  S.encode(wireSchema)({ body: m, meta: { requestContext, span } }).pipe(
                    Effect.orDie,
                    Effect
                      .andThen(JSON.stringify),
                    // .tap((msg) => info("Publishing Mem Message: " + utils.inspect(msg)))
                    Effect.flatMap((_) => q.offer(_))
                  ), { discard: true })
            )
          }),
      makeDrain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>
      ) =>
        Effect.gen(function*($) {
          const silenceAndReportError = reportNonInterruptedFailure({ name: "MemQueue.drain." + queueDrainName })
          const processMessage = (msg: string) =>
            // we JSON parse, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
            Effect
              .sync(() => JSON.parse(msg))
              .pipe(
                Effect.flatMap(parseDrain),
                Effect
                  .orDie,
                Effect
                  .flatMap(({ body, meta }) =>
                    Effect
                      .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                      .pipe(
                        Effect.annotateLogs({ body: pretty(body), meta: pretty(meta) }),
                        Effect.zipRight(handleEvent(body)),
                        silenceAndReportError,
                        (_) =>
                          setupRequestContext(
                            _,
                            RequestContext.inherit(meta.requestContext, {
                              id: RequestId(body.id),
                              locale: "en" as const,
                              name: NonEmptyString255(body._tag)
                            })
                          ),
                        Effect
                          .withSpan("queue.drain", {
                            attributes: { "queue.name": queueDrainName },
                            parent: meta.span
                              ? Tracer.externalSpan(meta.span)
                              : undefined
                          })
                      )
                  )
              )
          return yield* $(
            qDrain
              .take
              .pipe(
                Effect.flatMap((x) =>
                  processMessage(x).pipe(Effect.uninterruptible, Effect.fork, Effect.flatMap(Fiber.join))
                ),
                // TODO: normally a failed item would be returned to the queue and retried up to X times.
                // .flatMap(_ => _._tag === "Failure" && !isInterrupted ? qDrain.offer(x) : Effect.unit) // TODO: retry count tracking and max retries.
                silenceAndReportError,
                Effect.forever
              )
          )
        })
    } satisfies QueueBase<Evt, DrainEvt>
  })
}
