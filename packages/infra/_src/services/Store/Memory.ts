/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RequestContext } from "../../RequestContext.js"
import type { Filter, FilterJoinSelect, PersistenceModelType, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilter, codeFilterJoinSelect, makeUpdateETag } from "./utils.js"

export function memFilter<T extends { id: string }>(filter: Filter<T>, cursor?: { skip?: number; limit?: number }) {
  return ((c: T[]): T[] => {
    const skip = cursor?.skip
    const limit = cursor?.limit
    if (!skip && limit === 1) {
      return c.findFirstMap(codeFilter(filter)).map(ReadonlyArray.make).getOrElse(() => [])
    }
    let r = c.filterMap(codeFilter(filter))
    if (skip) {
      r = r.drop(skip)
    }
    if (limit !== undefined) {
      r = r.take(limit)
    }
    return r
  })
}

export const storeId = FiberRef.unsafeMake("primary")

/**
 * @tsplus getter RequestContext restoreStoreId
 */
export const restoreFromRequestContext = (ctx: RequestContext) => storeId.set(ctx.namespace ?? "primary")

function logQuery(filter: any, cursor: any) {
  return Effect
    .logDebug("mem query")
    .apply(Effect.annotateLogs({
      query: JSON.stringify(filter, undefined, 2),
      cursor: JSON.stringify(
        cursor,
        undefined,
        2
      )
    }))
}

export function makeMemoryStoreInt<Id extends string, PM extends PersistenceModelType<Id>, R = never, E = never>(
  modelName: string,
  namespace: string,
  seed?: Effect<R, E, Iterable<PM>>
) {
  return Effect.gen(function*($) {
    const updateETag = makeUpdateETag(modelName)
    const items_ = yield* $(seed ?? Effect([]))
    const items = new Map(items_.toChunk.map((_) => [_.id, _] as const))
    const store = Ref.unsafeMake<ReadonlyMap<Id, PM>>(items)
    const sem = Semaphore.unsafeMake(1)
    const withPermit = sem.withPermits(1)
    const values = store.get.map((s) => s.values())

    const all = values
      .map(ReadonlyArray.fromIterable)
      .withSpan("Memory.all [effect-app/infra/Store]", {
        attributes: {
          modelName,
          namespace
        }
      })
    const batchSet = (items: NonEmptyReadonlyArray<PM>) =>
      items
        .forEachEffect((i) => s.find(i.id).flatMap((current) => updateETag(i, current)))
        .tap((items) =>
          store
            .get
            .map((m) => {
              const mut = m as Map<Id, PM>
              items.forEach((e) => mut.set(e.id, e))
              return mut
            })
            .flatMap((_) => store.set(_))
        )
        .map((_) => _ as NonEmptyArray<PM>)
        .apply(withPermit)
    const s: Store<PM, Id> = {
      all,
      find: (id) =>
        store.get.map((_) => Option.fromNullable(_.get(id))).withSpan("Memory.find [effect-app/infra/Store]", {
          attributes: {
            modelName,
            namespace
          }
        }),
      filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) =>
        all
          .tap(() => logQuery(filter, cursor))
          .map(memFilter(filter, cursor))
          .withSpan("Memory.filter [effect-app/infra/Store]", { attributes: { modelName, namespace } }),
      filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
        all.map((c) => c.flatMap(codeFilterJoinSelect<PM, T>(filter))).withSpan(
          "Memory.filterJoinSelect [effect-app/infra/Store]",
          {
            attributes: {
              modelName
            }
          }
        ),
      set: (e) =>
        s
          .find(e.id)
          .flatMap((current) => updateETag(e, current))
          .tap((e) => store.get.map((_) => new Map([..._, [e.id, e]])).flatMap((_) => store.set(_)))
          .apply(withPermit)
          .withSpan("Memory.set [effect-app/infra/Store]", { attributes: { modelName, namespace } }),
      batchSet: flow(
        batchSet,
        (_) => _.withSpan("Memory.batchSet [effect-app/infra/Store]", { attributes: { modelName, namespace } })
      ),
      bulkSet: flow(
        batchSet,
        (_) => _.withSpan("Memory.bulkSet [effect-app/infra/Store]", { attributes: { modelName, namespace } })
      ),
      remove: (e: PM) =>
        store
          .get
          .map((_) => new Map([..._].filter(([_]) => _ !== e.id)))
          .flatMap((_) => store.set(_))
          .apply(withPermit)
          .withSpan("Memory.remove [effect-app/infra/Store]", { attributes: { modelName, namespace } })
    }
    return s
  })
}

export const makeMemoryStore = () => ({
  make: <Id extends string, PM extends PersistenceModelType<Id>, R = never, E = never>(
    modelName: string,
    seed?: Effect<R, E, Iterable<PM>>,
    config?: StoreConfig<PM>
  ) =>
    Effect.gen(function*($) {
      const storesSem = Semaphore.unsafeMake(1)
      const primary = yield* $(makeMemoryStoreInt<Id, PM, R, E>(modelName, "primary", seed))
      const ctx = yield* $(Effect.context<R>())
      const stores = new Map([["primary", primary]])
      const getStore = !config?.allowNamespace ? Effect.succeed(primary) : storeId.get.flatMap((namespace) => {
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
          return makeMemoryStoreInt(modelName, namespace, seed)
            .orDie
            .provide(ctx)
            .tap((store) => Effect.sync(() => stores.set(namespace, store)))
        }))
      })
      const s: Store<PM, Id> = {
        all: getStore.flatMap((_) => _.all),
        find: (...args) => getStore.flatMap((_) => _.find(...args)),
        filter: (...args) => getStore.flatMap((_) => _.filter(...args)),
        filterJoinSelect: (...args) => getStore.flatMap((_) => _.filterJoinSelect(...args)),
        set: (...args) => getStore.flatMap((_) => _.set(...args)),
        batchSet: (...args) => getStore.flatMap((_) => _.batchSet(...args)),
        bulkSet: (...args) => getStore.flatMap((_) => _.bulkSet(...args)),
        remove: (...args) => getStore.flatMap((_) => _.remove(...args))
      }
      return s
    })
})

export const MemoryStoreLive = StoreMaker.makeLayer(makeMemoryStore())
