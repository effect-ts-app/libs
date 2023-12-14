/* eslint-disable @typescript-eslint/no-explicit-any */

import { pick } from "@effect-app/prelude/utils"
import type { RequestContext } from "../../RequestContext.js"
import type { FilterArgs, FilterJoinSelect, PersistenceModelType, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilter, codeFilterJoinSelect, makeUpdateETag } from "./utils.js"

export function memFilter<T extends PersistenceModelType<string>, U extends keyof T = never>(f: FilterArgs<T, U>) {
  type M = U extends undefined ? T : Pick<T, U>
  return ((c: T[]): M[] => {
    const select = (r: T[]): M[] => (f.select ? r.map((_) => pick(_, f.select!)) : r) as any
    const skip = f?.skip
    const limit = f?.limit
    if (!skip && limit === 1) {
      return select(
        c.findFirstMap(f.filter ? codeFilter(f.filter) : (_) => Option.some(_)).map(ReadonlyArray.make).getOrElse(
          () => []
        )
      )
    }
    let r = f.filter ? c.filterMap(codeFilter(f.filter)) : c
    if (skip) {
      r = r.drop(skip)
    }
    if (limit !== undefined) {
      r = r.take(limit)
    }

    return select(r)
  })
}

export const storeId = FiberRef.unsafeMake("primary")

/**
 * @tsplus getter RequestContext restoreStoreId
 */
export const restoreFromRequestContext = (ctx: RequestContext) => storeId.set(ctx.namespace ?? "primary")

function logQuery(f: FilterArgs<any, any>, defaultValues?: any) {
  return Effect
    .logDebug("mem query")
    .pipe(Effect.annotateLogs({
      filter: JSON.stringify(
        f.filter ? f.filter.type === "new-kid" ? f.filter.build() : f.filter : f.filter,
        undefined,
        2
      ),
      select: JSON.stringify(f.select, undefined, 2),
      defaultValues: JSON.stringify(defaultValues, undefined, 2),
      skip: f.skip,
      limit: f.limit
    }))
}

export function makeMemoryStoreInt<Id extends string, PM extends PersistenceModelType<Id>, R = never, E = never>(
  modelName: string,
  namespace: string,
  seed?: Effect<R, E, Iterable<PM>>,
  _defaultValues?: Partial<PM>
) {
  return Effect.gen(function*($) {
    const updateETag = makeUpdateETag(modelName)
    const items_ = yield* $(seed ?? Effect([]))
    const defaultValues = _defaultValues ?? {}

    const items = new Map(items_.toChunk.map((_) => [_.id, { ...defaultValues, ..._ }] as const))
    const store = Ref.unsafeMake<ReadonlyMap<Id, PM>>(items)
    const sem = Semaphore.unsafeMake(1)
    const withPermit = sem.withPermits(1)
    const values = store.get.map((s) => s.values())

    const all = values.map(ReadonlyArray.fromIterable)

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
        .pipe(withPermit)
    const s: Store<PM, Id> = {
      all: all.withSpan("Memory.all [effect-app/infra/Store]", {
        attributes: {
          modelName,
          namespace
        }
      }),
      find: (id) =>
        store
          .get
          .map((_) => Option.fromNullable(_.get(id)))
          .withSpan("Memory.find [effect-app/infra/Store]", {
            attributes: {
              modelName,
              namespace
            }
          }),
      filter: (f) =>
        all
          .tap(() => logQuery(f, defaultValues))
          .map(memFilter(f))
          .withSpan("Memory.filter [effect-app/infra/Store]", {
            attributes: { "repository.model_name": modelName, "repository.namespace": namespace }
          }),
      filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
        all
          .map((c) => c.flatMap(codeFilterJoinSelect<PM, T>(filter)))
          .withSpan(
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
          .pipe(withPermit)
          .withSpan("Memory.set [effect-app/infra/Store]", {
            attributes: { "repository.model_name": modelName, "repository.namespace": namespace }
          }),
      batchSet: flow(
        batchSet,
        (_) =>
          _.withSpan("Memory.batchSet [effect-app/infra/Store]", {
            attributes: { "repository.model_name": modelName, "repository.namespace": namespace }
          })
      ),
      bulkSet: flow(
        batchSet,
        (_) =>
          _.withSpan("Memory.bulkSet [effect-app/infra/Store]", {
            attributes: { "repository.model_name": modelName, "repository.namespace": namespace }
          })
      ),
      remove: (e: PM) =>
        store
          .get
          .map((_) => new Map([..._].filter(([_]) => _ !== e.id)))
          .flatMap((_) => store.set(_))
          .pipe(withPermit)
          .withSpan("Memory.remove [effect-app/infra/Store]", {
            attributes: { "repository.model_name": modelName, "repository.namespace": namespace }
          })
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
      const primary = yield* $(makeMemoryStoreInt<Id, PM, R, E>(modelName, "primary", seed, config?.defaultValues))
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
          return makeMemoryStoreInt(modelName, namespace, seed, config?.defaultValues)
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
