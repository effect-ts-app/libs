import * as L from "@effect-ts/core/Effect/Layer"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Has from "@effect-ts/core/Has"
import * as EO from "@effect-ts-app/core/EffectOption"
import { pipe } from "@effect-ts-app/core/Function"

import {
  CachedRecord,
  DBRecord,
  EffectMap,
  makeMap,
  OptimisticLockException,
} from "./shared.js"

export type Version = string
export class InvalidStateError {
  readonly _tag = "InvalidStateError"
  constructor(readonly message: string, readonly details?: unknown) {}
}

export function makeLiveRecordCache() {
  const m = new Map<string, EffectMap<string, unknown>>()
  return {
    get: <T>(type: string) =>
      Effect.succeedWith(() => {
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
  <R, E, A>(eff: (m: EffectMap<string, CachedRecord<T>>) => Effect<R, E, A>) =>
    Effect.gen(function* ($) {
      const { get } = yield* $(RecordCache)
      return yield* $(pipe(get<T>(type), Effect.chain(eff)))
    })

export function find<R, RDecode, EDecode, E, EA, A>(
  tryRead: (id: string) => Effect<R, E, Option<CachedRecord<EA>>>,
  decode: (d: EA) => Effect<RDecode, EDecode, A>,
  type: string
) {
  const getCache = getM<A>(type)
  const read = (id: string) =>
    pipe(
      tryRead(id),
      EO.chainEffect(({ data, version }) =>
        pipe(
          decode(data),
          Effect.bimap(
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
        EO.alt(() => read(id))
      )
    )
}

export function storeDirectly<R, E, TKey extends string, A extends DBRecord<TKey>>(
  save: (r: A, version: Option<Version>) => Effect<R, E, CachedRecord<A>>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      pipe(
        c.find(record.id),
        EO.map((x) => x.version),
        Effect.chain((cv) => save(record, cv)),
        Effect.tap((r) => c.set(record.id, r)),
        Effect.map((r) => r.data)
      )
    )
}

export function store<R, E, R2, E2, TKey extends string, EA, A extends DBRecord<TKey>>(
  tryRead: (id: string) => Effect<R, E, Option<CachedRecord<EA>>>,
  save: (r: A, version: Option<Version>) => Effect<R, E, CachedRecord<A>>,
  lock: (id: string) => M.Managed<R2, E2, unknown>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      pipe(
        c.find(record.id),
        EO.map((x) => x.version),
        Effect.chain(Option.fold(() => save(record, Option.none), confirmVersionAndSave(record))),
        Effect.tap((r) => c.set(record.id, r)),
        Effect.map((r) => r.data)
      )
    )

  function confirmVersionAndSave(record: A) {
    return (cv: Version) =>
      M.use_(lock(record.id), () =>
        pipe(
          pipe(
            tryRead(record.id),
            Effect.chain(
              Option.fold(() => Effect.fail(new InvalidStateError("record is gone")), Effect.succeed)
            )
          ),
          Effect.tap(({ version }) =>
            version !== cv
              ? Effect.fail(new OptimisticLockException(type, record.id))
              : Effect.unit
          ),
          Effect.zipRight(save(record, Option.some(cv)))
        )
      )
  }
}
