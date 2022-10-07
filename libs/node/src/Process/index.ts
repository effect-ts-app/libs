// ets_tracing: off

import * as P from "process"

import { Byte } from "../Byte/index.js"

export class StdinError {
  readonly _tag = "StdinError"
  constructor(readonly error: Error) {}
}

/**
 * Creates a stream that reads from the standard input
 */
export const stdin: Stream<never, StdinError, Byte> = Stream.fromEffect(() =>
  Effect.succeedWith(() => Tuple(P.stdin.resume(), new Array<Function>()))
).flatMap(({ tuple: [rs, cleanup] }) =>
  Stream.async<never, StdinError, Byte>((cb) => {
    const onData = (data: Buffer): void => {
      cb(Effect.succeed(Byte.chunk(data)))
    }
    const onError = (error: Error): void => {
      cb(Effect.fail(Maybe.some(new StdinError(error))))
    }
    cleanup.push(
      () => {
        rs.removeListener("error", onError)
      },
      () => {
        rs.removeListener("data", onData)
      },
      () => {
        rs.pause()
      }
    )
    rs.on("data", onData)
    rs.on("error", onError)
  }).ensuring(
    Effect.succeedWith(() => {
      cleanup.forEach((h) => {
        h()
      })
    })
  )
)
