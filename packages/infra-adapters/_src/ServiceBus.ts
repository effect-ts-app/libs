import type {
  OperationOptionsBase,
  ProcessErrorArgs,
  ServiceBusMessage,
  ServiceBusMessageBatch,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
  ServiceBusSender
} from "@azure/service-bus"
import { ServiceBusClient } from "@azure/service-bus"

function makeClient(url: string) {
  return Effect.sync(() => new ServiceBusClient(url)).acquireRelease(
    (client) => Effect.promise(() => client.close())
  )
}

const Client = Tag<ServiceBusClient>()
export const LiveServiceBusClient = (url: string) => makeClient(url).toLayerScoped(Client)

function makeSender(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client)

    return yield* $(
      Effect.sync(() => serviceBusClient.createSender(queueName)).acquireRelease(
        (subscription) => Effect.promise(() => subscription.close())
      )
    )
  })
}
export const Sender = Tag<ServiceBusSender>()

export function LiveSender(queueName: string) {
  return makeSender(queueName).toLayerScoped(Sender)
}

function makeReceiver(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client)

    return yield* $(
      Effect.sync(() => serviceBusClient.createReceiver(queueName)).acquireRelease(
        (r) => Effect.promise(() => r.close())
      )
    )
  })
}

export const Receiver = Tag<ServiceBusReceiver>()
export function LiveReceiver(queueName: string) {
  return makeReceiver(queueName).toLayerScoped(Receiver)
}

export function sendMessages(
  messages: ServiceBusMessage | ServiceBusMessage[] | ServiceBusMessageBatch,
  options?: OperationOptionsBase
) {
  return Effect.gen(function*($) {
    const s = yield* $(Sender)
    return yield* $(Effect.promise(() => s.sendMessages(messages, options)))
  })
}

export function subscribe<RMsg, RErr>(hndlr: MessageHandlers<RMsg, RErr>) {
  return Effect.gen(function*($) {
    const r = yield* $(Receiver)

    yield* $(
      Effect
        .runtime<RMsg | RErr>()
        .map((rt) =>
          r.subscribe({
            processError: (err) =>
              rt.runPromise(
                hndlr
                  .processError(err)
                  .catchAllCause((cause) => Effect.logError("ServiceBus Error", cause))
              ),
            processMessage: (msg) =>
              rt.runPromise(
                hndlr.processMessage(msg)
              )
            // DO NOT CATCH ERRORS here as they should return to the queue!
          })
        )
        .acquireRelease(
          (subscription) => Effect.promise(() => subscription.close())
        )
    )
  })
}

const SubscribeTag = Tag<Effect.Success<ReturnType<typeof subscribe>>>()

export function Subscription<RMsg, RErr>(hndlr: MessageHandlers<RMsg, RErr>) {
  return subscribe(hndlr).toLayerScoped(SubscribeTag)
}

export interface MessageHandlers<RMsg, RErr> {
  /**
   * Handler that processes messages from service bus.
   *
   * @param message - A message received from Service Bus.
   */
  processMessage(message: ServiceBusReceivedMessage): Effect<RMsg, never, void>
  /**
   * Handler that processes errors that occur during receiving.
   * @param args - The error and additional context to indicate where
   * the error originated.
   */
  processError(args: ProcessErrorArgs): Effect<RErr, never, void>
}
