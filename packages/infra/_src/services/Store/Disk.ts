/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fu from "@effect-app/infra-adapters/simpledb/fileutil"

import fs from "fs"

import { makeMemoryStore } from "./Memory.js"
import type { PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"

/**
 * The Disk-backed store, flushes writes in background, but keeps the data in memory
 * and should therefore be as fast as the Memory Store.
 */
export function makeDiskStore({ prefix }: StorageConfig) {
  return Effect(() => {
    const dir = "./.data"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    return {
      make: <Id extends string, Id2 extends Id, E extends PersistenceModelType<Id>>(
        name: string,
        existing?: Effect<never, never, ROMap<Id2, E>>,
        _config?: StoreConfig<E>
      ) =>
        Effect.gen(function*($) {
          const file = dir + "/" + prefix + name + ".json"
          const fsStore = {
            get: fu
              .readTextFile(file)
              .map(x => JSON.parse(x) as E[])
              .orDie,
            setRaw: (v: Iterable<E>) => JSON.stringify([...v], undefined, 2)["|>"](json => fu.writeTextFile(file, json))
          }

          const { make } = makeMemoryStore()

          const store = yield* $(
            make<Id, Id, E>(
              name,
              !fs.existsSync(file)
                ? existing ?? Effect(ROMap.empty)
                : fsStore.get.map(x => ROMap.make(x.map(x => [x.id, x] as const)))
            )
          )

          yield* $(store.all.flatMap(fsStore.setRaw))

          const sem = Semaphore.unsafeMake(1)
          const withPermit = sem.withPermits(1)
          const flushToDisk = store.all.flatMap(fsStore.setRaw).apply(withPermit)
          const s: Store<E, Id> = {
            ...store,
            batchSet: flow(store.batchSet, t =>
              t.tap(() => flushToDisk.tapErrorCause(err => Effect(console.error(err))).forkDaemon)),
            bulkSet: flow(store.bulkSet, t =>
              t.tap(() =>
                flushToDisk.tapErrorCause(err =>
                  Effect(console.error(err))
                ).forkDaemon
              )),
            set: flow(store.set, t =>
              t.tap(() => flushToDisk.tapErrorCause(err => Effect(console.error(err))).forkDaemon)),
            remove: flow(store.remove, t =>
              t.tap(() =>
                flushToDisk.tapErrorCause(err =>
                  Effect(console.error(err))
                ).forkDaemon
              ))
          }
          return s
        })
    }
  })
}

export function DiskStoreLive(config: Config<StorageConfig>) {
  return config.config
    .flatMap(makeDiskStore)
    .toLayer(StoreMaker)
}
