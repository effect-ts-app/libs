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
import { Tracer } from "effect"
import { Effect, flow, Layer, S } from "effect-app"
import { RequestId } from "effect-app/ids"
import type { StringId } from "effect-app/schema"
import { NonEmptyString255, struct } from "effect-app/schema"
import { pretty } from "effect-app/utils"
import { setupRequestContext } from "../../api/setupRequest.js"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { forkDaemonReportQueue, reportNonInterruptedFailure, reportNonInterruptedFailureCause } from "./errors.js"
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
  schema: S.Schema<Evt, EvtE>,
  drainSchema: S.Schema<DrainEvt, DrainEvtE>
) {
  const wireSchema = struct({
    body: schema,
    meta: QueueMeta
  })
  const drainW = struct({ body: drainSchema, meta: QueueMeta })
  const parseDrain = flow(S.decodeUnknown(drainW), Effect.orDie)

  return Effect.gen(function*($) {
    const s = yield* $(Sender)
    const receiver = yield* $(Receiver)
    const receiverLayer = Layer.succeed(Receiver, receiver)
    const silenceAndReportError = reportNonInterruptedFailure({ name: "ServiceBusQueue.drain." + queueDrainName })
    const reportError = reportNonInterruptedFailureCause({ name: "ServiceBusQueue.drain." + queueDrainName })
    const rcc = yield* $(RequestContextContainer)

    return {
      makeDrain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>
      ) =>
        Effect
          .gen(function*($) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function processMessage(messageBody: any) {
              return Effect
                .sync(() => JSON.parse(messageBody))
                .pipe(
                  Effect.flatMap((x) => parseDrain(x)),
                  Effect.orDie,
                  Effect
                    .flatMap(({ body, meta }) =>
                      Effect
                        .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
                        .pipe(
                          Effect.annotateLogs({
                            body: pretty(body),
                            meta: pretty(meta)
                          }),
                          Effect
                            .zipRight(handleEvent(body)),
                          Effect
                            .orDie
                        )
                        // we silenceAndReportError here, so that the error is reported, and moves into the Exit.
                        .pipe(
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
                    ),
                  Effect
                    // we reportError here, so that we report the error only, and keep flowing
                    .tapErrorCause(reportError)
                )
            }

            return yield* $(
              subscribe({
                processMessage: (x) => processMessage(x.body).pipe(Effect.uninterruptible),
                processError: (err) => Effect.sync(() => captureException(err.error))
              })
                .pipe(Effect.provide(receiverLayer))
            )
          })
          .pipe(Effect.andThen(Effect.never.pipe(Effect.forkScoped))),

      publish: (...messages) =>
        Effect
          .gen(function*($) {
            const requestContext = yield* $(rcc.requestContext)
            const currentSpan = yield* $(Effect.currentSpan.pipe(Effect.orDie))
            const span = Tracer.externalSpan(currentSpan)
            return yield* $(
              Effect
                .promise(() =>
                  s.sendMessages(
                    messages.map((m) => ({
                      body: JSON.stringify(
                        S.encodeSync(wireSchema)({ body: m, meta: { requestContext, span } })
                      ),
                      messageId: m.id, /* correllationid: requestId */
                      contentType: "application/json"
                    }))
                  )
                )
            )
          })
          .pipe(forkDaemonReportQueue)
    } satisfies QueueBase<Evt, DrainEvt>
  })
}

/**
 * @tsplus static QueueMaker.Ops makeServiceBusLayers
 */
export function makeServiceBusLayers(url: string, queueName: string, queueDrainName: string) {
  return Layer.merge(LiveReceiver(queueDrainName), LiveSender(queueName)).pipe(Layer.provide(LiveServiceBusClient(url)))
}
