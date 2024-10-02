import type {} from "@azure/service-bus"
import {
  LiveSender,
  LiveServiceBusClient,
  Sender,
  ServiceBusReceiverFactory,
  subscribe
} from "@effect-app/infra-adapters/ServiceBus"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { Tracer } from "effect"
import { Cause, Effect, flow, Layer, Option, S } from "effect-app"
import { RequestId } from "effect-app/ids"
import type { StringId } from "effect-app/schema"
import { NonEmptyString255 } from "effect-app/schema"
import { pretty } from "effect-app/utils"
import { setupRequestContext } from "../../api/setupRequest.js"
import { RequestContextContainer } from "../RequestContextContainer.js"
import { reportNonInterruptedFailure, reportNonInterruptedFailureCause, reportQueueError } from "./errors.js"
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
  queueName: string,
  queueDrainName: string,
  schema: S.Schema<Evt, EvtE>,
  drainSchema: S.Schema<DrainEvt, DrainEvtE>
) {
  const wireSchema = S.Struct({
    body: schema,
    meta: QueueMeta
  })
  const drainW = S.Struct({ body: drainSchema, meta: QueueMeta })
  const parseDrain = flow(S.decodeUnknown(drainW), Effect.orDie)

  return Effect.gen(function*() {
    const s = yield* Sender
    const receiver = yield* ServiceBusReceiverFactory
    const silenceAndReportError = reportNonInterruptedFailure({ name: "ServiceBusQueue.drain." + queueDrainName })
    const reportError = reportNonInterruptedFailureCause({ name: "ServiceBusQueue.drain." + queueDrainName })
    const rcc = yield* RequestContextContainer

    // TODO: or do async?
    // This will make sure that the host receives the error (MainFiberSet.join), who will then interrupt everything and commence a shutdown and restart of app
    // const deferred = yield* Deferred.make<never, ServiceBusError | Error>()

    return {
      drain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>,
        sessionId?: string
      ) =>
        Effect
          .gen(function*() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function processMessage(messageBody: any) {
              return Effect
                .sync(() => JSON.parse(messageBody))
                .pipe(
                  Effect.flatMap((x) => parseDrain(x)),
                  Effect.orDie,
                  Effect
                    .flatMap(({ body, meta }) => {
                      let effect = Effect
                        .logDebug(`[${queueDrainName}] Processing incoming message`)
                        .pipe(
                          Effect.annotateLogs({
                            body: pretty(body),
                            meta: pretty(meta)
                          }),
                          Effect.zipRight(handleEvent(body)),
                          Effect.orDie
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
                                name: NonEmptyString255(`${queueDrainName}.${body._tag}`)
                              })
                            ),
                          Effect
                            .withSpan(
                              `queue.drain: ${queueDrainName}${sessionId ? `#${sessionId}` : ""}.${body._tag}`,
                              {
                                captureStackTrace: false,
                                kind: "consumer",
                                attributes: {
                                  "queue.name": queueDrainName,
                                  "queue.sessionId": sessionId,
                                  "queue.input": body
                                }
                              }
                            )
                        )
                      if (meta.span) {
                        effect = Effect.withParentSpan(effect, Tracer.externalSpan(meta.span))
                      }
                      return effect
                    }),
                  Effect
                    // we reportError here, so that we report the error only, and keep flowing
                    .tapErrorCause(reportError)
                )
            }

            return yield* subscribe({
              processMessage: (x) => processMessage(x.body).pipe(Effect.uninterruptible),
              processError: (err) => reportQueueError(Cause.fail(err.error))
              // Deferred.completeWith(
              //   deferred,
              //   reportFatalQueueError(Cause.fail(err.error))
              //     .pipe(Effect.andThen(Effect.fail(err.error)))
              // )
            }, sessionId)
              .pipe(Effect.provideService(ServiceBusReceiverFactory, receiver))
          })
          // .pipe(Effect.andThen(Deferred.await(deferred).pipe(Effect.orDie))),
          .pipe(Effect.andThen(Effect.never)),

      publish: (...messages) =>
        Effect
          .gen(function*() {
            const requestContext = yield* rcc.requestContext
            const span = yield* Effect.serviceOption(Tracer.ParentSpan)
            return yield* Effect
              .promise((abortSignal) =>
                s.sendMessages(
                  messages.map((m) => ({
                    body: JSON.stringify(
                      S.encodeSync(wireSchema)({
                        body: m,
                        meta: { requestContext, span: Option.getOrUndefined(span) }
                      })
                    ),
                    messageId: m.id, /* correllationid: requestId */
                    contentType: "application/json",
                    sessionId: "sessionId" in m ? m.sessionId : undefined
                  })),
                  { abortSignal }
                )
              )
          })
          .pipe(Effect.withSpan("queue.publish: " + queueName, {
            captureStackTrace: false,
            kind: "producer",
            attributes: { "message_tags": messages.map((_) => _._tag) }
          }))
    } satisfies QueueBase<Evt, DrainEvt>
  })
}

/**
 * @tsplus static QueueMaker.Ops makeServiceBusLayers
 */
export function makeServiceBusLayers(url: string, queueName: string, queueDrainName: string) {
  return Layer.merge(ServiceBusReceiverFactory.Live(queueDrainName), LiveSender(queueName)).pipe(
    Layer.provide(LiveServiceBusClient(url))
  )
}
