/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fu from "@effect-app/infra-adapters/fileUtil"

import fs from "fs"

import { makeMemoryStoreInt, storeId } from "./Memory.js"
import type { PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"

function makeDiskStoreInt<Id extends string, PM extends PersistenceModelType<Id>, R, E>(
  prefix: string,
  namespace: string,
  dir: string,
  name: string,
  seed?: Effect<R, E, Iterable<PM>>
) {
  return Effect.gen(function*($) {
    const file = dir + "/" + prefix + name + (namespace === "primary" ? "" : "-" + namespace) + ".json"
    const fsStore = {
      get: fu
        .readTextFile(file)
        .map((x) => JSON.parse(x) as PM[])
        .orDie,
      setRaw: (v: Iterable<PM>) => JSON.stringify([...v], undefined, 2)["|>"]((json) => fu.writeTextFile(file, json))
    }

    const store = yield* $(
      makeMemoryStoreInt<Id, PM, R, E>(
        name,
        namespace,
        !fs.existsSync(file)
          ? seed
          : fsStore.get
      )
    )

    yield* $(store.all.flatMap(fsStore.setRaw))

    const sem = Semaphore.unsafeMake(1)
    const withPermit = sem.withPermits(1)
    const flushToDisk = store.all.flatMap(fsStore.setRaw).apply(withPermit)
    const flushToDiskInBackground = flushToDisk
      .tapErrorCause((err) => Effect(console.error(err)))
      .uninterruptible
      .forkDaemon

    return {
      ...store,
      batchSet: flow(
        store.batchSet,
        (t) => t.tap(() => flushToDiskInBackground)
      ),
      bulkSet: flow(
        store.bulkSet,
        (t) => t.tap(() => flushToDiskInBackground)
      ),
      set: flow(
        store.set,
        (t) => t.tap(() => flushToDiskInBackground)
      ),
      remove: flow(
        store.remove,
        (t) => t.tap(() => flushToDiskInBackground)
      )
    } satisfies Store<PM, Id>
  })
}

/**
 * The Disk-backed store, flushes writes in background, but keeps the data in memory
 * and should therefore be as fast as the Memory Store.
 */
export function makeDiskStore({ prefix }: StorageConfig, dir: string) {
  return Effect.sync(() => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    return {
      make: <Id extends string, PM extends PersistenceModelType<Id>, R, E>(
        name: string,
        seed?: Effect<R, E, Iterable<PM>>,
        config?: StoreConfig<PM>
      ) =>
        Effect.gen(function*($) {
          const storesSem = Semaphore.unsafeMake(1)
          const primary = yield* $(makeDiskStoreInt(prefix, "primary", dir, name, seed))
          const stores = new Map<string, Store<PM, Id>>([["primary", primary]])
          const ctx = yield* $(Effect.context<R>())
          const getStore = !config?.allowNamespace ? Effect.succeed(primary) : storeId.get.flatMap((namespace) => {
            const store = stores.get(namespace)
            if (store) {
              return Effect.succeed(store)
            }
            if (!config.allowNamespace!(namespace)) {
              throw new Error(`Namespace ${namespace} not allowed!`)
            }
            return storesSem.withPermits(1)(
              Effect.suspend(() => {
                const existing = stores.get(namespace)
                if (existing) return Effect(existing)
                return makeDiskStoreInt<Id, PM, R, E>(prefix, namespace, dir, name, seed)
                  .orDie
                  .provide(ctx)
                  .tap((store) => Effect.sync(() => stores.set(namespace, store)))
              })
            )
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
    }
  })
}

export function DiskStoreLive(config: Config<StorageConfig>, dir: string) {
  return config
    .config
    .flatMap((_) => makeDiskStore(_, dir))
    .toLayer(StoreMaker)
}
