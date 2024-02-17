import type { CachedRecord, DBRecord, EffectMap } from "./shared.js"
import { makeMap, OptimisticLockException } from "./shared.js"

export type Version = string
export class InvalidStateError {
  readonly _tag = "InvalidStateError"
  constructor(readonly message: string, readonly details?: unknown) {}
}

export function makeLiveRecordCache() {
  const m = new Map<string, EffectMap<string, unknown>>()
  return {
    get: <T>(type: string) =>
      Effect.sync(() => {
        const ex = m.get(type)
        if (!ex) {
          const nm = makeMap<string, unknown>()
          m.set(type, nm)
          return nm as EffectMap<string, CachedRecord<T>>
        }
        return ex as EffectMap<string, CachedRecord<T>>
      })
  }
}

export interface RecordCache extends ReturnType<typeof makeLiveRecordCache> {}

// module tag
export const RecordCache = GenericTag<RecordCache>("@services/RecordCache")

export const LiveRecordCache = Effect.sync(() => makeLiveRecordCache()).toLayer(RecordCache)

const getM = <T>(type: string) => <R, E, A>(eff: (m: EffectMap<string, CachedRecord<T>>) => Effect<A, E, R>) =>
  Effect.gen(function*($) {
    const { get } = yield* $(RecordCache)
    return yield* $(get<T>(type).flatMap(eff))
  })

export function find<R, RDecode, EDecode, E, EA, A>(
  tryRead: (id: string) => Effect<Option<CachedRecord<EA>>, E, R>,
  decode: (d: EA) => Effect<A, EDecode, RDecode>,
  type: string
) {
  const getCache = getM<A>(type)
  const read = (id: string) =>
    tryRead(id)
      .flatMapOpt(({ data, version }) =>
        decode(data).mapBoth({
          onFailure: (err) => new InvalidStateError("DB serialisation Issue", err),
          onSuccess: (data) => ({ data, version })
        })
      )
      .tapOpt((r) => getCache((c) => c.set(id, r)))
      .mapOpt((r) => r.data)

  return (id: string) =>
    getCache((c) =>
      c
        .find(id)
        .mapOpt((existing) => existing.data)
        .orElse(() => read(id))
    )
}

export function storeDirectly<R, E, TKey extends string, A extends DBRecord<TKey>>(
  save: (r: A, version: Option<Version>) => Effect<CachedRecord<A>, E, R>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      c
        .find(record.id)
        .mapOpt((x) => x.version)
        .flatMap((cv) => save(record, cv))
        .tap((r) => c.set(record.id, r))
        .map((r) => r.data)
    )
}

export function store<R, E, R2, E2, TKey extends string, EA, A extends DBRecord<TKey>>(
  tryRead: (id: string) => Effect<Option<CachedRecord<EA>>, E, R>,
  save: (r: A, version: Option<Version>) => Effect<CachedRecord<A>, E, R>,
  lock: (id: string) => Effect<unknown, E2, R2 | Scope>,
  type: string
) {
  const getCache = getM<A>(type)
  return (record: A) =>
    getCache((c) =>
      c
        .find(record.id)
        .mapOpt((x) => x.version)
        .flatMap((_) => _.match({ onNone: () => save(record, Option.none()), onSome: confirmVersionAndSave(record) }))
        .tap((r) => c.set(record.id, r))
        .map((r) => r.data)
    )

  function confirmVersionAndSave(record: A) {
    return (cv: Version) =>
      lock(record.id)
        .zipRight(
          tryRead(record.id)
            .flatMap((_) =>
              _.match(
                { onNone: () => Effect.fail(new InvalidStateError("record is gone")), onSome: Effect.succeed }
              )
            )
            .tap(({ version }) =>
              version !== cv
                ? new OptimisticLockException(type, record.id)
                : Effect.unit
            )
            .zipRight(save(record, Option.some(cv)))
        )
        .scoped
  }
}
