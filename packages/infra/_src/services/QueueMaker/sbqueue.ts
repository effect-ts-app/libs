import {
  LiveReceiver,
  LiveSender,
  LiveServiceBusClient,
  Receiver,
  Sender,
  subscribe
} from "@effect-app/infra-adapters/ServiceBus"
import type {} from "@azure/service-bus"
import { captureException } from "@effect-app/infra/errorReporter"
import { RequestContext } from "@effect-app/infra/RequestContext"
import type { CustomSchemaException } from "@effect-app/prelude/schema"
import { reportQueueError } from "./errors.js"
import type { QueueBase } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeServiceBus
 */
export function makeServiceBusQueue<
  DrainR,
  Evt extends { id: StringId; _tag: string },
  DrainEvt extends { id: StringId; _tag: string },
  RContext,
  EvtE,
  DrainE
>(
  _queueName: string,
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
    const s = yield* $(Sender.access)
    const receiver = yield* $(Receiver.access)
    const receiverLayer = Receiver.makeLayer(receiver)

    return {
      drain: Effect.gen(function*($) {
        const handleEvent = yield* $(makeHandleEvent)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function processMessage(messageBody: any) {
          return Effect.sync(() => JSON.parse(messageBody))
            .flatMap(x => parseDrain(x))
            .orDie
            .tapErrorCause(report)
            .flatMap(({ body, meta }) =>
              Effect
                .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                .apply(Effect.logAnnotates({ body: body.$$.pretty, meta: meta.$$.pretty }))
                .zipRight(handleEvent(body))
                .tapErrorCause(report)
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
            .setupRequestFromWith("Queue.ReceiveMessage")
            .orDie
            .asUnit
        }

        return yield* $(
          subscribe({
            processMessage: x => processMessage(x.body).uninterruptible,
            processError: err => Effect(captureException(err.error))
          })
            .provideSomeLayer(receiverLayer)
        )
      }),

      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(RequestContext.Tag.access)
          return yield* $(
            Effect.promise(() =>
              s.sendMessages(
                messages.map(x => ({
                  body: JSON.stringify(
                    encoder({ body: x, meta: requestContext })
                  ),
                  messageId: x.id, /* correllationid: requestId */
                  contentType: "application/json"
                }))
              )
            )
              .forkDaemonReportQueue
          )
        })
    } satisfies QueueBase<DrainR, Evt>
  })
}

/**
 * @tsplus static QueueMaker.Ops makeServiceBusLayers
 */
export function makeServiceBusLayers(url: string, queueName: string, queueDrainName: string) {
  return LiveServiceBusClient(url)
    >> (LiveReceiver(queueDrainName) + LiveSender(queueName))
}

function report<E>(cause: Cause<E>) {
  return Effect.gen(function*($) {
    const requestContext = yield* $(RequestContext.Tag.access)
    return reportQueueError(cause, { requestContext })
  })
}
