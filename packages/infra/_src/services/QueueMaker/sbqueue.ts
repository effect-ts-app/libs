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
import type { S } from "@effect-app/prelude"
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
  Evt extends { id: StringId; _tag: string },
  DrainEvt extends { id: StringId; _tag: string },
  EvtE,
  DrainEvtE
>(
  _queueName: string,
  queueDrainName: string,
  schema: S.Schema<EvtE, Evt>,
  drainSchema: S.Schema<DrainEvtE, DrainEvt>
) {
  const wireSchema = struct({
    body: schema,
    meta: QueueMeta
  })
  const drainW = struct({ body: drainSchema, meta: QueueMeta })
  const parseDrain = flow(drainW.parse, (_) => _.orDie)

  return Effect.gen(function*($) {
    const s = yield* $(Sender)
    const receiver = yield* $(Receiver)
    const receiverLayer = Receiver.makeLayer(receiver)
    const silenceAndReportError = reportNonInterruptedFailure({ name: "ServiceBusQueue.drain." + queueDrainName })
    const reportError = reportNonInterruptedFailureCause({ name: "ServiceBusQueue.drain." + queueDrainName })
    const rcc = yield* $(RequestContextContainer)

    return {
      makeDrain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<DrainR, DrainE, void>
      ) =>
        Effect.gen(function*($) {
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
                    name: NonEmptyString255(body._tag)
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
              processError: (err) => Effect.sync(() => captureException(err.error))
            })
              .provide(receiverLayer)
          )
        }),

      publish: (...messages) =>
        Effect.gen(function*($) {
          const requestContext = yield* $(rcc.requestContext)
          const currentSpan = yield* $(Effect.currentSpan.orDie)
          const span = Tracer.externalSpan(currentSpan)
          return yield* $(
            Effect
              .promise(() =>
                s.sendMessages(
                  messages.map((m) => ({
                    body: JSON.stringify(
                      wireSchema.encodeSync({ body: m, meta: { requestContext, span } })
                    ),
                    messageId: m.id, /* correllationid: requestId */
                    contentType: "application/json"
                  }))
                )
              )
              .forkDaemonReportQueue
          )
        })
    } satisfies QueueBase<Evt, DrainEvt>
  })
}

/**
 * @tsplus static QueueMaker.Ops makeServiceBusLayers
 */
export function makeServiceBusLayers(url: string, queueName: string, queueDrainName: string) {
  return Layer.merge(LiveReceiver(queueDrainName), LiveSender(queueName)).provide(LiveServiceBusClient(url))
}
