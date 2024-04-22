import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { NonEmptyString255 } from "@effect-app/schema"
import { Tracer } from "effect"
import { Effect, Fiber, flow, Option, S } from "effect-app"
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

    const wireSchema = S.Struct({ body: schema, meta: QueueMeta })
    const drainW = S.Struct({ body: drainSchema, meta: QueueMeta })
    const parseDrain = flow(S.decodeUnknown(drainW), Effect.orDie)

    return {
      publish: (...messages) =>
        Effect
          .gen(function*($) {
            const requestContext = yield* $(rcc.requestContext)
            const span = yield* $(Effect.serviceOption(Tracer.ParentSpan))
            return yield* $(
              Effect
                .forEach(messages, (m) =>
                  // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
                  S.encode(wireSchema)({ body: m, meta: { requestContext, span: Option.getOrUndefined(span) } }).pipe(
                    Effect.orDie,
                    Effect
                      .andThen(JSON.stringify),
                    // .tap((msg) => info("Publishing Mem Message: " + utils.inspect(msg)))
                    Effect.flatMap((_) => q.offer(_))
                  ), { discard: true })
            )
          })
          .pipe(Effect.withSpan("queue.publish: " + queueName, { kind: "producer" })),
      drain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>,
        sessionId?: string
      ) =>
        Effect.gen(function*($) {
          const silenceAndReportError = reportNonInterruptedFailure({ name: "MemQueue.drain." + queueDrainName })
          const processMessage = (msg: string) =>
            // we JSON parse, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
            Effect
              .sync(() => JSON.parse(msg))
              .pipe(
                Effect.flatMap(parseDrain),
                Effect.orDie,
                Effect
                  .flatMap(({ body, meta }) => {
                    let effect = Effect
                      .logDebug(`[${queueDrainName}] Processing incoming message`)
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
                              name: NonEmptyString255(`${queueDrainName}.${body._tag}`)
                            })
                          ),
                        Effect
                          .withSpan(`queue.drain: ${queueDrainName}.${body._tag}`, {
                            kind: "consumer",
                            attributes: {
                              "queue.name": queueDrainName,
                              "queue.sessionId": sessionId,
                              "queue.input": Object.entries(body).reduce((prev, [key, value]: [string, unknown]) => {
                                prev[key] = key === "password"
                                  ? "<redacted>"
                                  : typeof value === "string"
                                      || typeof value === "number"
                                      || typeof value === "boolean"
                                  ? typeof value === "string" && value.length > 256
                                    ? (value.substring(0, 253) + "...")
                                    : value
                                  : Array.isArray(value)
                                  ? `Array[${value.length}]`
                                  : value === null || value === undefined
                                  ? `${value}`
                                  : typeof value === "object" && value
                                  ? `Object[${Object.keys(value).length}]`
                                  : typeof value
                                return prev
                              }, {} as Record<string, string | number | boolean>)
                            }
                          })
                      )
                    if (meta.span) {
                      effect = Effect.withParentSpan(effect, Tracer.externalSpan(meta.span))
                    }
                    return effect
                  })
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
