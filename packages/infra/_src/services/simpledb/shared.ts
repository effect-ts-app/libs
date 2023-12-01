import * as MO from "@effect-app/schema"
import type { SchemaAny } from "@effect-app/schema"

export class CouldNotAquireDbLockException
  extends Data.TaggedError("CouldNotAquireDbLockException")<{ type: string; id: string; error: Error; message: string }>
{
  constructor(type: string, id: string, error: Error) {
    super({ type, id, error, message: `Couldn't lock db record ${type}: ${id}` })
  }
}

export class OptimisticLockException
  extends Data.TaggedError("OptimisticLockException")<{ type: string; id: string; message: string }>
{
  constructor(type: string, id: string) {
    super({ type, id, message: `Existing ${type} ${id} record changed` })
  }
}

export class ConnectionException extends Data.TaggedError("ConnectionException")<{ cause: Error; message: string }> {
  readonly _errorTag = "ConnectionException"
  constructor(cause: Error) {
    super({ cause, message: "A connection error ocurred" })
  }
}

export interface DBRecord<TKey extends string> {
  id: TKey
}

export class SerializedDBRecord extends MO.Class<SerializedDBRecord>()({
  version: MO.string,
  timestamp: MO.date,
  data: MO.string
}) {}

// unknown -> string -> SDB?
export function makeSerialisedDBRecord(s: SchemaAny) {
  return MO.struct({
    version: MO.number,
    timestamp: MO.date,
    data: s
  })
}

export interface CachedRecord<T> {
  version: string
  data: T
}

export interface Index {
  doc: string
  key: string
}

export function getIndexName(type: string, id: string) {
  return `${type}-idx_${id}`
}

export function getRecordName(type: string, id: string) {
  return `${type}-r_${id}`
}

export function makeMap<TKey, T>() {
  const map = new Map<TKey, T>()
  return {
    find: (k: TKey) => Effect(Option.fromNullable(map.get(k))),
    [Symbol.iterator]: () => map[Symbol.iterator](),
    set: (k: TKey, v: T) =>
      Effect.sync(() => {
        map.set(k, v)
      })
  } as EffectMap<TKey, T>
}

export interface EffectMap<TKey, T> {
  [Symbol.iterator](): IterableIterator<[TKey, T]>
  find: (k: TKey) => Effect<never, never, Option<T>>
  set: (k: TKey, v: T) => Effect<never, never, void>
}

// export function encodeOnlyWhenStrictMatch<A, E>(
//   encode: MO.HasEncoder<A, E>["encode_"],
//   v: A
// ) {
//   const e1 = Sync.run(encode(v, "strict"))
//   const e2 = Sync.run(encode(v, "classic"))
//   try {
//     assert.deepStrictEqual(e1, e2)
//   } catch (err) {
//     throw new Error(
//       // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
//       "The strict encoding of these objects does not match the classic encoding of these objects. This means that there is a chance of a data-loss, and is probably a programming error\n" +
//         err
//     )
//   }
//   return e1
// }

// export function decodeOnlyWhenStrictMatch<A, E>(
//   decode: MO.HasDecoder<A, E>["decode_"],
//   u: unknown
// ) {
//   return pipe(
//     decode(u, "strict"),
//     Sync.tap((v) =>
//       pipe(
//         decode(u),
//         Sync.tap((v2) => {
//           assert.deepStrictEqual(v, v2)
//           return Sync.succeed(v2)
//         })
//       )
//     )
//   )
// }
