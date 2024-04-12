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
import type { Scope } from "effect-app"
import { Cause, Context, Effect, Exit, FiberSet, Layer } from "effect-app"

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

function makeReceiver(queueName: string, sessionId?: string) {
  return Effect.gen(function*($) {
    const serviceBusClient = yield* $(Client)

    return yield* $(
      Effect.acquireRelease(
        sessionId
          ? Effect.promise(() => serviceBusClient.acceptSession(queueName, sessionId))
          : Effect.sync(() => serviceBusClient.createReceiver(queueName)),
        (r) => Effect.promise(() => r.close())
      )
    )
  })
}

export const Receiver = Context.GenericTag<
  {
    make: Effect<ServiceBusReceiver, never, Scope>
    makeSession: (sessionId: string) => Effect<ServiceBusReceiver, never, Scope>
  }
>("@services/Receiver")
export function LiveReceiver(queueName: string) {
  return Layer.effect(
    Receiver,
    Client.pipe(Effect.andThen((cl) => ({
      make: makeReceiver(queueName).pipe(Effect.provideService(Client, cl)),
      makeSession: (sessionId: string) => makeReceiver(queueName, sessionId).pipe(Effect.provideService(Client, cl))
    })))
  )
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

export function subscribe<RMsg, RErr>(hndlr: MessageHandlers<RMsg, RErr>, sessionId?: string) {
  return Effect.gen(function*($) {
    const rf = yield* $(Receiver)
    const r = yield* $(sessionId ? rf.makeSession(sessionId) : rf.make)

    yield* $(
      Effect.acquireRelease(
        Effect.map(
          FiberSet.makeRuntime<RMsg | RErr>(),
          (rt) => {
            const runEffect = <E>(effect: Effect<void, E, RMsg | RErr>) =>
              new Promise<void>((resolve, reject) =>
                rt(effect)
                  .addObserver((exit) => {
                    if (Exit.isSuccess(exit)) {
                      resolve(exit.value)
                    } else {
                      reject(Cause.pretty(exit.cause))
                    }
                  })
              )
            return r.subscribe({
              processError: (err) =>
                runEffect(
                  hndlr
                    .processError(err)
                    .pipe(Effect.catchAllCause((cause) => Effect.logError("ServiceBus Error", cause)))
                ),
              processMessage: (msg) => runEffect(hndlr.processMessage(msg))
              // DO NOT CATCH ERRORS here as they should return to the queue!
            })
          }
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
