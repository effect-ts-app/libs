import { MemQueue } from "@effect-app/infra-adapters/memQueue"
import { RequestContext } from "@effect-app/infra/RequestContext"
import type { CustomSchemaException } from "@effect-app/prelude/schema"
import { restoreFromRequestContext } from "../Store/Memory.js"
import { reportFailure, reportQueueError } from "./errors.js"
import type { QueueBase } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeMem
 */
export function makeMemQueue<DrainR, Evt, DrainEvt extends { id: StringId; _tag: string }, RContext, EvtE, DrainE>(
  queueName: string,
  queueDrainName: string,
  encoder: (e: { body: Evt; meta: RequestContext }) => EvtE,
  makeHandleEvent: Effect<DrainR, never, (ks: DrainEvt) => Effect<RContext, DrainE, void>>,
  provideContext: (context: RequestContext) => <R, E, A>(
    eff: Effect<RContext | R, E, A>
  ) => Effect<Exclude<R, RContext>, E, A>,
  parseDrain: (
    a: unknown,
    env?: Parser.ParserEnv | undefined
  ) => Effect<never, CustomSchemaException, { body: DrainEvt; meta: RequestContext }>
) {
  return Effect.gen(function*($) {
    const mem = yield* $(MemQueue.access)
    const q = yield* $(mem.getOrCreateQueue(queueName))
    const qReply = yield* $(mem.getOrCreateQueue(queueDrainName))

    return {
      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(RequestContext.Tag.access)
          return yield* $(
            messages.forEachEffect(m =>
              // we JSON encode, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
              Effect(
                JSON.stringify(
                  encoder({ body: m, meta: requestContext })
                )
              )
                // .tap((msg) => info("Publishing Mem Message: " + utils.inspect(msg)))
                .flatMap(_ => q.offer(_))
                .asUnit
            )
              .forkDaemonReportQueue
          )
        }),
      drain: Effect.gen(function*($) {
        const handleEvent = yield* $(makeHandleEvent)
        const processMessage = (msg: string) =>
          // we JSON parse, because that is what the wire also does, and it reveals holes in e.g unknown encoders (Date->String)
          Effect(JSON.parse(msg))
            .flatMap(parseDrain)
            .orDie
            .flatMap(({ body, meta }) =>
              Effect
                .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                .apply(Effect.logAnnotates({ body: body.$$.pretty, meta: meta.$$.pretty }))
                .tap(() => restoreFromRequestContext)
                .zipRight(silence(handleEvent(body)))
                .apply(
                  provideContext(
                    RequestContext.inherit(meta, {
                      id: body.id,
                      locale: "en" as const,
                      name: ReasonableString(body._tag)
                    })
                  )
                )
            )
        return yield* $(
          qReply.take()
            .flatMap(x => processMessage(x).uninterruptible.fork.flatMap(_ => _.join))
            .forever
            .apply(reportFailure("drain"))
            .setupRequestFromWith("Queue.ReceiveMessage")
            .forkScoped
        )
      })
    } satisfies QueueBase<DrainR, Evt>
  })
}

// We want the Queue to continue processing even on errors per messages
// must make sure that the errors are processed/handled beforehand.
export function silence<R, E, A>(inp: Effect<R, E, A>) {
  return inp.exit.flatMap(result =>
    Effect.gen(function*($) {
      const requestContext = yield* $(RequestContext.Tag.access)
      return yield* $(
        result.match(
          cause => {
            if (cause.isInterrupted()) {
              return (cause as Cause<never>).failCause
            }
            reportQueueError(cause, { requestContext })
            return Effect.unit
          },
          () => Effect.unit
        )
      )
    })
  )
}
