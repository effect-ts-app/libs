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
import { struct } from "@effect-app/schema"
import { Tracer } from "effect"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure, reportNonInterruptedFailureCause } from "./errors.js"
import { type QueueBase, QueueMeta } from "./service.js"

/**
 * @tsplus static QueueMaker.Ops makeServiceBus
 */
export function makeServiceBusQueue<
  DrainR,
  Evt extends { id: StringId; _tag: string },
  DrainEvt extends { id: StringId; _tag: string },
  EvtE,
  DrainE
>(
  _queueName: string,
  queueDrainName: string,
  schema: Schema.Schema<unknown, Evt, any, EvtE, any>,
  drainSchema: Schema.Schema<unknown, DrainEvt, any, any, any>,
  makeHandleEvent: Effect<DrainR, never, (ks: DrainEvt) => Effect<never, DrainE, void>>
) {
  const wireSchema = struct({
    body: schema,
    meta: QueueMeta
  })
  const encoder = wireSchema.Encoder
  const drainW = struct({ body: drainSchema, meta: QueueMeta })
  const parseDrain = drainW.parseCondemnDie

  return Effect.gen(function*($) {
    const s = yield* $(Sender)
    const receiver = yield* $(Receiver)
    const receiverLayer = Receiver.makeLayer(receiver)
    const silenceAndReportError = reportNonInterruptedFailure({ name: "ServiceBusQueue.drain." + queueDrainName })
    const reportError = reportNonInterruptedFailureCause({ name: "ServiceBusQueue.drain." + queueDrainName })
    const rcc = yield* $(RequestContextContainer)

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
                .pipe(Effect.annotateLogs({ body: body.$$.pretty, meta: meta.$$.pretty }))
                .zipRight(handleEvent(body))
                .orDie
                // we silenceAndReportError here, so that the error is reported, and moves into the Exit.
                .pipe(silenceAndReportError)
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
            // we reportError here, so that we report the error only, and keep flowing
            .tapErrorCause(reportError)
        }

        return yield* $(
          subscribe({
            processMessage: (x) => processMessage(x.body).uninterruptible,
            processError: (err) => Effect(captureException(err.error))
          })
            .provide(receiverLayer)
        )
      }),

      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(rcc.requestContext)
          const currentSpan = yield* $(Effect.currentSpan)
          const span = currentSpan.map(Tracer.externalSpan).value
          return yield* $(
            Effect
              .promise(() =>
                s.sendMessages(
                  messages.map((m) => ({
                    body: JSON.stringify(
                      encoder({ body: m, meta: { requestContext, span } })
                    ),
                    messageId: m.id, /* correllationid: requestId */
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
  return (LiveReceiver(queueDrainName) + LiveSender(queueName)) >> LiveServiceBusClient(url)
}
