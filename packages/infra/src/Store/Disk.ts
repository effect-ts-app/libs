/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fu from "../fileUtil.js"

import fs from "fs"

import { Console, Effect, FiberRef, flow } from "effect-app"
import { makeMemoryStoreInt, storeId } from "./Memory.js"
import type { PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"

function makeDiskStoreInt<Id extends string, Encoded extends { id: Id }, R, E>(
  prefix: string,
  namespace: string,
  dir: string,
  name: string,
  seed?: Effect<Iterable<Encoded>, E, R>,
  defaultValues?: Partial<Encoded>
) {
  type PM = PersistenceModelType<Encoded>
  return Effect.gen(function*() {
    if (namespace !== "primary") {
      dir = dir + "/" + namespace
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
    }
    const file = dir + "/" + prefix + name + ".json"
    const fsStore = {
      get: fu
        .readTextFile(file)
        .pipe(
          Effect.withSpan("Disk.read.readFile [effect-app/infra/Store]", { captureStackTrace: false }),
          Effect.flatMap((x) =>
            Effect.sync(() => JSON.parse(x) as PM[]).pipe(
              Effect.withSpan("Disk.read.parse [effect-app/infra/Store]", { captureStackTrace: false })
            )
          ),
          Effect.orDie,
          Effect.withSpan("Disk.read [effect-app/infra/Store]", {
            captureStackTrace: false,
            attributes: { "disk.file": file }
          })
        ),
      setRaw: (v: Iterable<PM>) =>
        Effect
          .sync(() => JSON.stringify([...v], undefined, 2))
          .pipe(
            Effect.withSpan("Disk.stringify [effect-app/infra/Store]", {
              captureStackTrace: false,
              attributes: { "disk.file": file }
            }),
            Effect
              .flatMap(
                (json) =>
                  fu
                    .writeTextFile(file, json)
                    .pipe(Effect
                      .withSpan("Disk.write.writeFile [effect-app/infra/Store]", {
                        captureStackTrace: false,
                        attributes: { "disk.file_size": json.length }
                      }))
              ),
            Effect
              .withSpan("Disk.write [effect-app/infra/Store]", {
                captureStackTrace: false,
                attributes: { "disk.file": file }
              })
          )
    }

    const store = yield* makeMemoryStoreInt<Id, Encoded, R, E>(
      name,
      namespace,
      !fs.existsSync(file)
        ? seed
        : fsStore.get,
      defaultValues
    )

    yield* store.all.pipe(Effect.flatMap(fsStore.setRaw))

    const sem = Effect.unsafeMakeSemaphore(1)
    const withPermit = sem.withPermits(1)
    const flushToDisk = Effect.flatMap(store.all, fsStore.setRaw).pipe(withPermit)
    const flushToDiskInBackground = flushToDisk
      .pipe(
        Effect.tapErrorCause(Console.error),
        Effect.uninterruptible,
        Effect.forkDaemon
      )

    return {
      ...store,
      batchSet: flow(
        store.batchSet,
        Effect.tap(flushToDiskInBackground)
      ),
      bulkSet: flow(
        store.bulkSet,
        Effect.tap(flushToDiskInBackground)
      ),
      set: flow(
        store.set,
        Effect.tap(flushToDiskInBackground)
      ),
      remove: flow(
        store.remove,
        Effect.tap(flushToDiskInBackground)
      )
    } satisfies Store<Encoded, Id>
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
      make: <Id extends string, Encoded extends { id: Id }, R, E>(
        name: string,
        seed?: Effect<Iterable<Encoded>, E, R>,
        config?: StoreConfig<Encoded>
      ) =>
        Effect.gen(function*() {
          const storesSem = Effect.unsafeMakeSemaphore(1)
          const primary = yield* makeDiskStoreInt(prefix, "primary", dir, name, seed, config?.defaultValues)
          const stores = new Map<string, Store<Encoded, Id>>([["primary", primary]])
          const ctx = yield* Effect.context<R>()
          const getStore = !config?.allowNamespace
            ? Effect.succeed(primary)
            : FiberRef.get(storeId).pipe(Effect.flatMap((namespace) => {
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
                  if (existing) return Effect.sync(() => existing)
                  return makeDiskStoreInt<Id, Encoded, R, E>(prefix, namespace, dir, name, seed, config?.defaultValues)
                    .pipe(
                      Effect.orDie,
                      Effect.provide(ctx),
                      Effect.tap((store) => Effect.sync(() => stores.set(namespace, store)))
                    )
                })
              )
            }))

          const s: Store<Encoded, Id> = {
            all: Effect.flatMap(getStore, (_) => _.all),
            find: (...args) => Effect.flatMap(getStore, (_) => _.find(...args)),
            filter: (...args) => Effect.flatMap(getStore, (_) => _.filter(...args)),
            set: (...args) => Effect.flatMap(getStore, (_) => _.set(...args)),
            batchSet: (...args) => Effect.flatMap(getStore, (_) => _.batchSet(...args)),
            bulkSet: (...args) => Effect.flatMap(getStore, (_) => _.bulkSet(...args)),
            remove: (...args) => Effect.flatMap(getStore, (_) => _.remove(...args))
          }
          return s
        })
    }
  })
}

export function DiskStoreLayer(config: StorageConfig, dir: string) {
  return StoreMaker.toLayer(makeDiskStore(config, dir))
}
