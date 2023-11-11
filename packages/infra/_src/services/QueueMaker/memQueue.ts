import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { RequestId } from "@effect-app/prelude/ids"
import type { CustomSchemaException } from "@effect-app/prelude/schema"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure } from "./errors.js"
import type { QueueBase } from "./service.js"

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
  encoder: (e: { body: Evt; meta: RequestContext }) => EvtE,
  makeHandleEvent: Effect<DrainR, never, (ks: DrainEvt) => Effect<never, DrainE, void>>,
  parseDrain: (
    a: unknown,
    env?: Parser.ParserEnv | undefined
  ) => Effect<never, CustomSchemaException, { body: DrainEvt; meta: RequestContext }>
) {
  return Effect.gen(function*($) {
    const mem = yield* $(MemQueue)
    const q = yield* $(mem.getOrCreateQueue(queueName))
    const qDrain = yield* $(mem.getOrCreateQueue(queueDrainName))
    const rcc = yield* $(RequestContextContainer)

    return {
      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(rcc.requestContext)
          return yield* $(
            messages
              .forEachEffect((m) =>
                // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
                Effect(
                  JSON.stringify(
                    encoder({ body: m, meta: requestContext })
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
                .apply(Effect.annotateLogs({ body: body.$$.pretty, meta: meta.$$.pretty }))
                .zipRight(handleEvent(body))
                .apply(silenceAndReportError)
                .setupRequestContext(RequestContext.inherit(meta, {
                  id: RequestId(body.id),
                  locale: "en" as const,
                  name: ReasonableString(body._tag)
                }))
            )
        return yield* $(
          qDrain
            .take()
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
