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
import { Context, Effect, Layer, Runtime, Scope } from "effect-app"

function makeClient(url: string) {
  return Effect.acquireRelease(
    Effect.sync(() => new ServiceBusClient(url)),
    (client) => Effect.promise(() => client.close())
  )
}

const Client = Context.GenericTag<ServiceBusClient>("@services/Client")
export const LiveServiceBusClient = (url: string) => Layer.scoped(Client)(makeClient(url))

function makeSender(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client)

    return yield* $(
      Effect.acquireRelease(
        Effect.sync(() => serviceBusClient.createSender(queueName)),
        (subscription) => Effect.promise(() => subscription.close())
      )
    )
  })
}
export const Sender = Context.GenericTag<ServiceBusSender>("@services/Sender")

export function LiveSender(queueName: string) {
  return Layer.scoped(Sender, makeSender(queueName))
}

function makeReceiver(queueName: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client)

    return yield* $(
      Effect.acquireRelease(
        Effect.sync(() => serviceBusClient.createReceiver(queueName)),
        (r) => Effect.promise(() => r.close())
      )
    )
  })
}

export const Receiver = Context.GenericTag<{ make: Effect<ServiceBusReceiver, never, Scope>}>("@services/Receiver")
export function LiveReceiver(queueName: string) {
  return Layer.effect(Receiver, Client.pipe(Effect.andThen((cl) => ({ make: makeReceiver(queueName).pipe(Effect.provideService(Client, cl)) }))))
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
    const rf = yield* $(Receiver)
    const r = yield* $(rf.make)

    yield* $(
      Effect.acquireRelease(
        Effect.map(
          Effect
            .runtime<RMsg | RErr>(),
          (rt) =>
            r.subscribe({
              processError: (err) =>
                Runtime.runPromise(rt)(
                  hndlr
                    .processError(err)
                    .pipe(Effect.catchAllCause((cause) => Effect.logError("ServiceBus Error", cause)))
                ),
              processMessage: (msg) =>
                Runtime.runPromise(rt)(
                  hndlr.processMessage(msg)
                )
              // DO NOT CATCH ERRORS here as they should return to the queue!
            })
        ),
        (subscription) => Effect.promise(() => subscription.close())
      )
    )
  })
}


export interface MessageHandlers<RMsg, RErr> {
  /**
   * Handler that processes messages from service bus.
   *
   * @param message - A message received from Service Bus.
   */
  processMessage(message: ServiceBusReceivedMessage): Effect<void, never, RMsg>
  /**
   * Handler that processes errors that occur during receiving.
   * @param args - The error and additional context to indicate where
   * the error originated.
   */
  processError(args: ProcessErrorArgs): Effect<void, never, RErr>
}
