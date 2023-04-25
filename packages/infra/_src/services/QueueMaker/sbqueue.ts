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
import { RequestId } from "@effect-app/prelude/ids"
import type { CustomSchemaException } from "@effect-app/prelude/schema"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { restoreFromRequestContext } from "../Store/Memory.js"
import { reportNonInterruptedFailure, reportNonInterruptedFailureCause } from "./errors.js"
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
  ) => Effect<Exclude<R, RContext | RequestContextContainer>, E, A>,
  parseDrain: (
    a: unknown,
    env?: Parser.ParserEnv | undefined
  ) => Effect<never, CustomSchemaException, { body: DrainEvt; meta: RequestContext }>
) {
  return Effect.gen(function*($) {
    const s = yield* $(Sender)
    const receiver = yield* $(Receiver)
    const receiverLayer = Receiver.makeLayer(receiver)
    const silenceAndReportError = reportNonInterruptedFailure({ name: "ServiceBusQueue.drain." + queueDrainName })
    const reportError = reportNonInterruptedFailureCause({ name: "ServiceBusQueue.drain." + queueDrainName })

    return {
      drain: Effect.gen(function*($) {
        const handleEvent = yield* $(makeHandleEvent)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function processMessage(messageBody: any) {
          return Effect
            .sync(() => JSON.parse(messageBody))
            .flatMap((x) => parseDrain(x))
            .orDie
            .flatMap(({ body, meta }) =>
              Effect
                .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                .apply(Effect.logAnnotates({ body: body.$$.pretty, meta: meta.$$.pretty }))
                .tap(() => restoreFromRequestContext)
                .zipRight(handleEvent(body))
                .orDie
                // we silenceAndReportError here, so that the error is reported, and moves into the Exit.
                .apply(silenceAndReportError)
                .apply(
                  provideContext(
                    RequestContext.inherit(meta, {
                      id: RequestId(body.id),
                      locale: "en" as const,
                      name: ReasonableString(body._tag)
                    })
                  )
                )
            )
            // we reportError here, so that we report the error only, and keep flowing
            .tapErrorCause(reportError)
        }

        return yield* $(
          subscribe({
            processMessage: (x) => processMessage(x.body).uninterruptible.flatMap((_) => _.done),
            processError: (err) => Effect(captureException(err.error))
          })
            .provideSomeLayer(receiverLayer)
        )
      }),

      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(RequestContextContainer.get)
          return yield* $(
            Effect
              .promise(() =>
                s.sendMessages(
                  messages.map((x) => ({
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
