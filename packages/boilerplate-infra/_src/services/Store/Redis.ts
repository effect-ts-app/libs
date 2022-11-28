/* eslint-disable @typescript-eslint/no-explicit-any */
import * as RedisClient from "@effect-ts-app/infra/redis-client"
import { NotFoundError } from "../../errors.js"
import { memFilter } from "./Memory.js"

import type { Filter, FilterJoinSelect, PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilterJoinSelect, makeETag, makeUpdateETag } from "./utils.js"

function makeRedisStore({ STORAGE_PREFIX }: StorageConfig) {
  return Effect.gen(function*($) {
    const redis = yield* $(RedisClient.RedisClient)
    return {
      make: <Id extends string, PM extends PersistenceModelType<Id>, Id2 extends Id>(
        name: string,
        existing?: Effect<never, never, ROMap<Id2, PM>>,
        _config?: StoreConfig<PM>
      ) =>
        Effect.gen(function*($) {
          const updateETag = makeUpdateETag(name)
          // Very naive implementation of course.
          const key = `${STORAGE_PREFIX}${name}`
          const current = yield* $(RedisClient.get(key).orDie.provideService(RedisClient.RedisClient, redis))
          if (!current.isSome()) {
            const m = yield* $(existing ?? Effect(ROMap.empty))
            yield* $(
              RedisClient.set(key, JSON.stringify({ data: [...m.values()].map(e => makeETag(e)) }))
                .orDie
                .provideService(RedisClient.RedisClient, redis)
            )
          }
          const get = RedisClient.get(key)
            .flatMap(x => x.encaseInEffect(() => new NotFoundError("data", "")))
            .orDie
            .map(x => JSON.parse(x) as { data: readonly PM[] })
            .map(_ => _.data)
            .provideService(RedisClient.RedisClient, redis)

          const set = (i: ROMap<Id, PM>) => RedisClient.set(key, JSON.stringify({ data: [...i.values()] })).orDie

          const semaphore = TSemaphore.unsafeMake(1)

          const asMap = get.map(x => ROMap.make(x.map(x => [x.id, x] as const)))
          const all = get.map(Chunk.from)
          const batchSet = <T extends Collection<PM>>(items: T) =>
            semaphore.withPermit(
              [...items]
                .forEachEffect(e => s.find(e.id).flatMap(current => updateETag(e, current)))
                .map(c => c.toArray)
                .tap(items =>
                  asMap
                    .map(m => {
                      const mut = ROMap.toMutable(m)
                      items.forEach(e => mut.set(e.id, e))
                      return ROMap.fromMutable(mut)
                    })
                    .flatMap(set)
                )
            ).provideService(RedisClient.RedisClient, redis)
          const s: Store<PM, Id> = {
            all,
            filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) =>
              all.map(memFilter(filter, cursor)),
            filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
              all.map(c => c.flatMap(codeFilterJoinSelect<PM, T>(filter))),
            find: id => asMap.map(ROMap.lookup(id)),
            set: e =>
              semaphore.withPermit(
                s
                  .find(e.id)
                  .flatMap(current => updateETag(e, current))
                  .tap(e => asMap.map(ROMap.insert(e.id, e)).flatMap(set))
              ).provideService(RedisClient.RedisClient, redis),
            batchSet,
            bulkSet: batchSet,
            remove: (e: PM) =>
              semaphore.withPermit(
                asMap.map(ROMap.remove(e.id)).flatMap(set)
              ).provideService(
                RedisClient.RedisClient,
                redis
              )
          }
          return s
        })
    }
  })
}
export function RedisStoreLive(config: StorageConfig) {
  return Layer.fromEffect(StoreMaker)(makeRedisStore(config))
}
