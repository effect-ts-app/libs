/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestContextContainer } from "../RequestContextContainer.js"
import type { Filter, FilterJoinSelect, PersistenceModelType, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilter, codeFilterJoinSelect, makeETag, makeUpdateETag } from "./utils.js"

export function memFilter<T extends { id: string }>(filter: Filter<T>, cursor?: { skip?: number; limit?: number }) {
  return ((c: Chunk<T>): Chunk<T> => {
    const skip = cursor?.skip
    const limit = cursor?.limit
    if (!skip && limit === 1) {
      return c.findFirstMap(codeFilter(filter)).map(Chunk.make).getOrElse(() => Chunk.empty())
    }
    let r = c.filterMap(codeFilter(filter))
    if (skip) {
      r = r.drop(skip)
    }
    if (limit !== undefined) {
      r = r.take(limit)
    }
    return r.toChunk
  })
}

export const storeId = FiberRef.unsafeMake("primary")
export const restoreFromRequestContext = RequestContextContainer.get.flatMap(ctx =>
  storeId.set(ctx.namespace ?? "primary")
)

export function makeMemoryStoreInt<Id extends string, PM extends PersistenceModelType<Id>>(
  name: string,
  seed?: Effect<never, never, Iterable<PM>>
) {
  return Effect.gen(function*($) {
    const updateETag = makeUpdateETag(name)
    const items_ = yield* $(seed ?? Effect([]))
    const items = new Map(items_.toChunk.map(_ => [_.id, _] as const))
    const makeStore = (): ReadonlyMap<Id, PM> => new Map([...items.entries()].map(([id, e]) => [id, makeETag(e)]))
    const store = Ref.unsafeMake(makeStore())
    const sem = Semaphore.unsafeMake(1)
    const withPermit = sem.withPermits(1)
    const values = store.get.map(s => s.values())
    const all = values.map(Chunk.fromIterable)
    const batchSet = (items: NonEmptyReadonlyArray<PM>) =>
      items
        .forEachEffect(i => s.find(i.id).flatMap(current => updateETag(i, current)))
        .tap(items =>
          store.get
            .map(m => {
              const mut = m as Map<Id, PM>
              items.forEach(e => mut.set(e.id, e))
              return mut
            })
            .flatMap(_ => store.set(_))
        )
        .map(_ => _.toReadonlyArray as NonEmptyReadonlyArray<PM>)
        .apply(withPermit)
    const s: Store<PM, Id> = {
      all,
      find: id => store.get.map(_ => Option.fromNullable(_.get(id))),
      filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) => all.map(memFilter(filter, cursor)),
      filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
        all.map(c => c.flatMap(codeFilterJoinSelect<PM, T>(filter))),
      set: e =>
        s
          .find(e.id)
          .flatMap(current => updateETag(e, current))
          .tap(e => store.get.map(_ => new Map([..._, [e.id, e]])).flatMap(_ => store.set(_)))
          .apply(withPermit),
      batchSet,
      bulkSet: batchSet,
      remove: (e: PM) =>
        store.get.map(_ => new Map([..._].filter(([_]) => _ !== e.id)))
          .flatMap(_ => store.set(_)).apply(withPermit)
    }
    return s
  })
}

export const makeMemoryStore = () => ({
  make: <Id extends string, PM extends PersistenceModelType<Id>>(
    name: string,
    seed?: Effect<never, never, Iterable<PM>>,
    config?: StoreConfig<PM>
  ) =>
    Effect.gen(function*($) {
      const storesSem = Semaphore.unsafeMake(1)
      const primary = yield* $(makeMemoryStoreInt<Id, PM>(name, seed))
      const stores = new Map([["primary", primary]])
      const getStore = !config?.allowNamespace ? Effect.succeed(primary) : storeId.get.flatMap(namespace => {
        const store = stores.get(namespace)
        if (store) {
          return Effect.succeed(store)
        }
        if (!config.allowNamespace!(namespace)) {
          throw new Error(`Namespace ${namespace} not allowed!`)
        }
        return storesSem.withPermits(1)(Effect.suspend(() => {
          const store = stores.get(namespace)
          if (store) return Effect(store)
          return makeMemoryStoreInt(name, seed).tap(store => Effect.sync(() => stores.set(namespace, store)))
        }))
      })
      const s: Store<PM, Id> = {
        all: getStore.flatMap(_ => _.all),
        find: (...args) => getStore.flatMap(_ => _.find(...args)),
        filter: (...args) => getStore.flatMap(_ => _.filter(...args)),
        filterJoinSelect: (...args) => getStore.flatMap(_ => _.filterJoinSelect(...args)),
        set: (...args) => getStore.flatMap(_ => _.set(...args)),
        batchSet: (...args) => getStore.flatMap(_ => _.batchSet(...args)),
        bulkSet: (...args) => getStore.flatMap(_ => _.bulkSet(...args)),
        remove: (...args) => getStore.flatMap(_ => _.remove(...args))
      }
      return s
    })
})

export const MemoryStoreLive = StoreMaker.makeLayer(makeMemoryStore())
