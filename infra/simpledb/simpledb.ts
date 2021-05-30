import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Has from "@effect-ts/core/Has"
import * as O from "@effect-ts/core/Option"
import * as EO from "@effect-ts-app/core/ext/EffectOption"
import { pipe } from "@effect-ts-app/core/ext/Function"

import {
  CachedRecord,
  DBRecord,
  EffectMap,
  makeMap,
  OptimisticLockException,
} from "./shared"

export type Version = string
export class InvalidStateError {
  readonly _tag = "InvalidStateError"
  constructor(readonly message: string, readonly details?: unknown) {}
}

export function makeLiveRecordCache() {
  const m = new Map<string, EffectMap<string, unknown>>()
  return {
    get: <T>(type: string) =>
      T.succeedWith(() => {
        const ex = m.get(type)
        if (!ex) {
          const nm = makeMap<string, unknown>()
          m.set(type, nm)
          return nm as EffectMap<string, CachedRecord<T>>
        }
        return ex as EffectMap<string, CachedRecord<T>>
      }),
  }
}

export interface RecordCache extends ReturnType<typeof makeLiveRecordCache> {}

// module tag
export const RecordCache = Has.tag<RecordCache>()

export const LiveRecordCache = L.fromFunction(RecordCache)(makeLiveRecordCache)

const getM =
  <T>(type: string) =>
  <R, E, A>(eff: (m: EffectMap<string, CachedRecord<T>>) => T.Effect<R, E, A>) =>
    T.gen(function* ($) {
      const { get } = yield* $(RecordCache)
      return yield* $(pipe(get<T>(type), T.chain(eff)))
    })

export function find<R, RDecode, EDecode, E, EA, A>(
  tryRead: (id: string) => T.Effect<R, E, O.Option<CachedRecord<EA>>>,
  decode: (d: EA) => T.Effect<RDecode, EDecode, A>,
  type: string
) {
  const getCache = getM<A>(type)
  const read = (id: string) =>
    pipe(
      tryRead(id),
      EO.chainEffect(({ data, version }) =>
        pipe(
          decode(data),
          T.bimap(
            (err) => new InvalidStateError("DB serialisation Issue", err),
            (data) => ({ data, version })
          )
        )
      ),
      EO.tap((r) => getCache((c) => c.set(id, r))),
      EO.map((r) => r.data)
    )

  return (id: string) =>
    getCache((c) =>
      pipe(
        c.find(id),
        EO.map((existing) => existing.data),
        EO.chainNone(read(id))
      )
    )
}

export function storeDirectly<R, E, TKey extends string, A extends DBRecord<TKey>>(
  save: (r: A, version: O.Option<Version>) => T.Effect<R, E, CachedRecord<A>>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      pipe(
        c.find(record.id)["|>"](EO.map((x) => x.version)),
        T.chain((cv) => save(record, cv)),
        T.tap((r) => c.set(record.id, r)),
        T.map((r) => r.data)
      )
    )
}

export function store<R, E, R2, E2, TKey extends string, EA, A extends DBRecord<TKey>>(
  tryRead: (id: string) => T.Effect<R, E, O.Option<CachedRecord<EA>>>,
  save: (r: A, version: O.Option<Version>) => T.Effect<R, E, CachedRecord<A>>,
  lock: (id: string) => M.Managed<R2, E2, unknown>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      pipe(
        c.find(record.id),
        EO.map((x) => x.version),
        T.chain(O.fold(() => save(record, O.none), confirmVersionAndSave(record))),
        T.tap((r) => c.set(record.id, r)),
        T.map((r) => r.data)
      )
    )

  function confirmVersionAndSave(record: A) {
    return (cv: Version) =>
      M.use_(lock(record.id), () =>
        pipe(
          pipe(
            tryRead(record.id),
            T.chain(
              O.fold(() => T.fail(new InvalidStateError("record is gone")), T.succeed)
            )
          ),
          T.tap(({ version }) =>
            version !== cv
              ? T.fail(new OptimisticLockException(type, record.id))
              : T.unit
          ),
          T.zipRight(save(record, O.some(cv)))
        )
      )
  }
}
