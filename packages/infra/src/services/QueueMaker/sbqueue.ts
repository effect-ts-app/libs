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
import { Effect, flow, Layer, Option, S } from "effect-app"
import { RequestId } from "effect-app/ids"
import type { StringId } from "effect-app/schema"
import { NonEmptyString255, struct } from "effect-app/schema"
import { pretty } from "effect-app/utils"
import { setupRequestContext } from "../../api/setupRequest.js"
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
      drain: <DrainE, DrainR>(
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
                    .flatMap(({ body, meta }) => {
                      let effect = Effect
                        .logDebug(`$$ [${queueDrainName}] Processing incoming message`)
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
                                name: NonEmptyString255(body._tag)
                              })
                            ),
                          Effect
                            .withSpan(`queue.drain: ${queueDrainName}`, {
                              attributes: { "queue.name": queueDrainName }
                            })
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

            return yield* $(
              subscribe({
                processMessage: (x) => processMessage(x.body).pipe(Effect.uninterruptible),
                processError: (err) => Effect.sync(() => captureException(err.error))
              })
                .pipe(Effect.provide(receiverLayer))
            )
          })
          .pipe(Effect.andThen(Effect.never)),

      publish: (...messages) =>
        Effect
          .gen(function*($) {
            const requestContext = yield* $(rcc.requestContext)
            const span = yield* $(Effect.serviceOption(Tracer.ParentSpan))
            return yield* $(
              Effect
                .promise(() =>
                  s.sendMessages(
                    messages.map((m) => ({
                      body: JSON.stringify(
                        S.encodeSync(wireSchema)({
                          body: m,
                          meta: { requestContext, span: Option.getOrUndefined(span) }
                        })
                      ),
                      messageId: m.id, /* correllationid: requestId */
                      contentType: "application/json"
                    }))
                  )
                )
            )
          })
    } satisfies QueueBase<Evt, DrainEvt>
  })
}

/**
 * @tsplus static QueueMaker.Ops makeServiceBusLayers
 */
export function makeServiceBusLayers(url: string, queueName: string, queueDrainName: string) {
  return Layer.merge(LiveReceiver(queueDrainName), LiveSender(queueName)).pipe(Layer.provide(LiveServiceBusClient(url)))
}
