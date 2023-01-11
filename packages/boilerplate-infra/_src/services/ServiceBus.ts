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
    client => Effect.promise(() => client.close())
  )
}

const Client = Tag<ServiceBusClient>()
export const LiveServiceBusClient = (url: string) => Client.scoped(makeClient(url))

function makeSender(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client.get)

    return yield* $(
      Effect.sync(() => serviceBusClient.createSender(queueName)).acquireRelease(
        subscription => Effect.promise(() => subscription.close())
      )
    )
  })
}
export const Sender = Tag<ServiceBusSender>()

export function LiveSender(queueName: string) {
  return Sender.scoped(makeSender(queueName))
}

function makeReceiver(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client.get)

    return yield* $(
      Effect.sync(() => serviceBusClient.createReceiver(queueName)).acquireRelease(
        r => Effect.promise(() => r.close())
      )
    )
  })
}

export const Receiver = Tag<ServiceBusReceiver>()
export function LiveReceiver(queueName: string) {
  return Receiver.scoped(makeReceiver(queueName))
}

export function sendMessages(
  messages: ServiceBusMessage | ServiceBusMessage[] | ServiceBusMessageBatch,
  options?: OperationOptionsBase
) {
  return Effect.gen(function*($) {
    const s = yield* $(Sender.get)
    return yield* $(Effect.promise(() => s.sendMessages(messages, options)))
  })
}

export function subscribe<RMsg, RErr>(hndlr: MessageHandlers<RMsg, RErr>) {
  return Effect.gen(function*($) {
    const r = yield* $(Receiver.get)

    const env = yield* $(Effect.environment<RMsg | RErr>())

    yield* $(
      Effect.sync(() =>
        r.subscribe({
          processError: err =>
            hndlr.processError(err)
              .provideEnvironment(env)
              .unsafeRunPromise
              .catch(console.error),
          processMessage: msg =>
            hndlr.processMessage(msg)
              .provideEnvironment(env)
              .unsafeRunPromise
          // DO NOT CATCH ERRORS here as they should return to the queue!
        })
      ).acquireRelease(
        subscription => Effect.promise(() => subscription.close())
      )
    )
  })
}

const SubscribeTag = Tag<Effect.Success<ReturnType<typeof subscribe>>>()

export function Subscription<RMsg, RErr>(hndlr: MessageHandlers<RMsg, RErr>) {
  return SubscribeTag.scoped(subscribe(hndlr))
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
