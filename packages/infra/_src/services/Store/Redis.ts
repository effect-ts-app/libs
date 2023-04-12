/* eslint-disable @typescript-eslint/no-explicit-any */
import * as RedisClient from "@effect-app/infra-adapters/redis-client"
import { NotFoundError } from "../../errors.js"
import { memFilter } from "./Memory.js"

import type { Filter, FilterJoinSelect, PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilterJoinSelect, makeETag, makeUpdateETag } from "./utils.js"

export function makeRedisStore({ prefix }: StorageConfig) {
  return Effect.gen(function*($) {
    const redis = yield* $(RedisClient.RedisClient)
    return {
      make: <Id extends string, PM extends PersistenceModelType<Id>>(
        name: string,
        seed?: Effect<never, never, Iterable<PM>>,
        _config?: StoreConfig<PM>
      ) =>
        Effect.gen(function*($) {
          const updateETag = makeUpdateETag(name)
          // Very naive implementation of course.
          const key = `${prefix}${name}`
          const current = yield* $(RedisClient.get(key).orDie.provideService(RedisClient.RedisClient, redis))
          if (!current.isSome()) {
            const m = yield* $(seed ?? Effect([]))
            yield* $(
              RedisClient
                .set(key, JSON.stringify({ data: [...m].map((e) => makeETag(e)) }))
                .orDie
                .provideService(RedisClient.RedisClient, redis)
            )
          }
          const get = RedisClient
            .get(key)
            .flatMap((x) => x.encaseInEffect(() => new NotFoundError("data", "")))
            .orDie
            .map((x) => JSON.parse(x) as { data: readonly PM[] })
            .map((_) => _.data)
            .provideService(RedisClient.RedisClient, redis)

          const set = (i: ReadonlyMap<Id, PM>) => RedisClient.set(key, JSON.stringify({ data: [...i.values()] })).orDie

          const sem = Semaphore.unsafeMake(1)
          const withPermit = sem.withPermits(1)

          const asMap = get.map((x) => new Map(x.map((x) => [x.id, x] as const)))
          const all = get.map(Chunk.fromIterable)
          const batchSet = (items: NonEmptyReadonlyArray<PM>) =>
            items
              .forEachEffect((e) => s.find(e.id).flatMap((current) => updateETag(e, current)))
              .tap((items) =>
                asMap
                  .map((m) => {
                    const mut = m
                    items.forEach((e) => mut.set(e.id, e))
                    return mut
                  })
                  .flatMap(set)
              )
              .map((_) => _.toReadonlyArray as NonEmptyReadonlyArray<PM>)
              .apply(withPermit)
              .provideService(RedisClient.RedisClient, redis)
          const s: Store<PM, Id> = {
            all,
            filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) =>
              all.map(memFilter(filter, cursor)),
            filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
              all.map((c) => c.flatMap(codeFilterJoinSelect<PM, T>(filter))),
            find: (id) => asMap.map((_) => Option.fromNullable(_.get(id))),
            set: (e) =>
              s
                .find(e.id)
                .flatMap((current) => updateETag(e, current))
                .tap((e) => asMap.map((_) => new Map([..._, [e.id, e]])).flatMap(set))
                .apply(withPermit)
                .provideService(RedisClient.RedisClient, redis),
            batchSet,
            bulkSet: batchSet,
            remove: (e: PM) =>
              asMap
                .map((_) => new Map([..._].filter(([_]) => _ !== e.id)))
                .flatMap(set)
                .apply(withPermit)
                .provideService(
                  RedisClient.RedisClient,
                  redis
                )
          }
          return s
        })
    }
  })
}
export function RedisStoreLive(config: Config<StorageConfig>) {
  return config.config.flatMap(makeRedisStore).toLayer(StoreMaker)
}
