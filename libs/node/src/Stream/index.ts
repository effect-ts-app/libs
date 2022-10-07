// ets_tracing: off

import type * as stream from "stream"

import { Byte } from "../Byte/index.js"

/**
 * @tsplus type effect/node/NodeStream.Ops
 */
export interface NodeStreamOps {}
export const NodeStream: NodeStreamOps = {}

export class ReadableError {
  readonly _tag = "ReadableError"
  constructor(readonly error: Error) {}
}

/**
 * Captures a Node `Readable`, converting it into a `Stream`,
 *
 * Note: your Readable should not have an encoding set in order to work with buffers,
 * calling this with a Readable with an encoding setted with `Die`.
 * @tsplus static effect/node/NodeStream.Ops streamFromReadable
 */
export function streamFromReadable(
  r: () => stream.Readable
): Stream<never, ReadableError, Byte> {
  return pipe(
    Effect.succeedWith(r).tap((sr) =>
      sr.readableEncoding != null
        ? Effect.dieMessage(
            `stream.Readable encoding set to ${sr.readableEncoding} cannot be used to produce Buffer`
          )
        : Effect.unit
    ),
    Stream.bracket((sr) =>
      Effect.succeedWith(() => {
        sr.destroy()
      })
    ),
    Stream.$.flatMap((sr) =>
      Stream.async<never, ReadableError, Byte>((cb) => {
        sr.on("data", (data) => {
          cb(Effect.succeed(Byte.chunk(data)))
        })
        sr.on("end", () => {
          cb(Effect.fail(Maybe.none))
        })
        sr.on("error", (err) => {
          cb(Effect.fail(Maybe.some(new ReadableError(err))))
        })
      })
    )
  )
}

export class WritableError {
  readonly _tag = "WritableError"
  constructor(readonly error: Error) {}
}

/**
 * Captures a Node `Writable`, converting it into a `Sink`
 * @tsplus static effect/node/NodeStream.Ops sinkFromWritable
 */
export function sinkFromWritable(
  w: () => stream.Writable
): Sink<never, WritableError, Byte, never, void> {
  return new Sink(
    pipe(
      Effect.succeedWith(w),
      M.makeExit((sw) =>
        Effect.succeedWith(() => {
          sw.destroy()
        })
      ),
      M.map(
        (sw) => (o: Maybe<Chunk<Byte>>) =>
          Maybe.isNone(o)
            ? Push.emit(undefined, Chunk.empty())
            : Effect.async((cb) => {
                sw.write(Byte.buffer(o.value), (err) => {
                  if (err) {
                    cb(Push.fail(new WritableError(err), Chunk.empty()))
                  } else {
                    cb(Push.more)
                  }
                })
              })
      )
    )
  )
}

export class TransformError {
  readonly _tag = "TransformError"
  constructor(readonly error: Error) {}
}

/**
 * Captures a Node `Transform` for use with `Stream`
 * @tsplus static effect/node/NodeStream.Ops transform
 */
export function transform(
  tr: () => stream.Transform
): <R, E>(stream: Stream<R, E, Byte>) => Stream<R, E | TransformError, Byte> {
  return <R, E>(stream: Stream<R, E, Byte>) => {
    const managedSink = pipe(
      Effect.succeedWith(tr),
      M.makeExit((st) =>
        Effect.succeedWith(() => {
          st.destroy()
        })
      ),
      M.map((st) =>
        Tuple(
          st,
          Sink.fromPush<never, TransformError, Byte, never, void>((_) =>
            _.fold(
              () =>
                Effect.succeedWith(() => {
                  st.end()
                }).flatMap(() => Push.emit(undefined, Chunk.empty())),
              (chunk) =>
                Effect.effectAsync((cb) => {
                  st.write(Byte.buffer(chunk), (err) =>
                    err
                      ? cb(Push.fail(new TransformError(err), Chunk.empty()))
                      : cb(Push.more)
                  )
                })
            )
          )
        )
      )
    )
    return Stream.managed(managedSink).flatMap(({ tuple: [st, sink] }) =>
      Stream.asyncEffect<never, TransformError, Byte, R, E | TransformError>((cb) =>
        Effect.succeedWith(() => {
          st.on("data", (chunk) => {
            cb(Effect.succeed(Byte.chunk(chunk)))
          })
          st.on("error", (err) => {
            cb(Effect.fail(Maybe.some(new TransformError(err))))
          })
          st.on("end", () => {
            cb(Effect.fail(Maybe.none))
          })
        }).zipRight(Stream.run_(stream, sink))
      )
    )
  }
}

/**
 * A sink that collects all of its inputs into an array.
 * @tsplus static effect/node/NodeStream.Ops collectBuffer
 */
export function collectBuffer(): Sink<never, never, Byte, never, Buffer> {
  return Sink.reduceLeftChunks(Chunk.empty<Byte>())((s, i: Chunk<Byte>) =>
    s.concat(i)
  ).map(Byte.buffer)
}

/**
 * Runs the stream and collects all of its elements to a buffer.
 * @tsplus static effect/node/NodeStream.Ops runBuffer
 */
export function runBuffer<R, E>(self: Stream<R, E, Byte>): Effect<R, E, Buffer> {
  return Stream.run_(self, collectBuffer())
}
