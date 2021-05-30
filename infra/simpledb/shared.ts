import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"
import * as S from "@effect-ts-app/core/ext/Schema"
import { SchemaAny } from "@effect-ts-app/core/ext/Schema"

class BaseError {
  constructor(public message: string) {}
}
export class CouldNotAquireDbLockException extends BaseError {
  readonly _errorTag = "CouldNotAquireDbLockException"
  constructor(readonly type: string, readonly id: string, readonly error: Error) {
    super(`Couldn't lock db record ${type}: ${id}`)
  }
}

export class OptimisticLockException extends Error {
  readonly _errorTag = "OptimisticLockException"
  constructor(readonly type: string, readonly id: string) {
    super(`Existing ${type} ${id} record changed`)
  }
}

export class ConnectionException extends Error {
  readonly _errorTag = "ConnectionException"
  constructor(readonly error: Error) {
    super("A connection error ocurred")
  }
}

export interface DBRecord<TKey extends string> {
  id: TKey
}

export class SerializedDBRecord extends S.Model<SerializedDBRecord>()({
  version: S.prop(S.string),
  timestamp: S.prop(S.date),
  data: S.prop(S.string),
}) {}

// unknown -> string -> SDB?
export function makeSerialisedDBRecord(s: SchemaAny) {
  return S.props({
    version: S.prop(S.number),
    timestamp: S.prop(S.date),
    data: S.prop(s),
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
    find: (k: TKey) => T.succeedWith(() => O.fromNullable(map.get(k))),
    [Symbol.iterator]: () => map[Symbol.iterator](),
    set: (k: TKey, v: T) =>
      T.succeedWith(() => {
        map.set(k, v)
      }),
  } as EffectMap<TKey, T>
}

export interface EffectMap<TKey, T> {
  [Symbol.iterator](): IterableIterator<[TKey, T]>
  find: (k: TKey) => T.UIO<O.Option<T>>
  set: (k: TKey, v: T) => T.UIO<void>
}

// export function encodeOnlyWhenStrictMatch<A, E>(
//   encode: MO.HasEncoder<A, E>["encode_"],
//   v: A
// ) {
//   const e1 = Sy.run(encode(v, "strict"))
//   const e2 = Sy.run(encode(v, "classic"))
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
//     Sy.tap((v) =>
//       pipe(
//         decode(u),
//         Sy.tap((v2) => {
//           assert.deepStrictEqual(v, v2)
//           return Sy.succeed(v2)
//         })
//       )
//     )
//   )
// }
