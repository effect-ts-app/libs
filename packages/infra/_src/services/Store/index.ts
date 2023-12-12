/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CosmosClient from "@effect-app/infra-adapters/cosmos-client"
import * as RedisClient from "@effect-app/infra-adapters/redis-client"
import { createClient } from "redis"
import { makeCosmosStore } from "./Cosmos.js"
import { makeDiskStore } from "./Disk.js"
import { MemoryStoreLive } from "./Memory.js"
import { makeRedisStore } from "./Redis.js"
import type { StorageConfig } from "./service.js"
import { StoreMaker } from "./service.js"

/**
 * @tsplus static StoreMaker.Ops Live
 */
export function StoreMakerLive(config: Config<StorageConfig>) {
  return Effect
    .gen(function*($) {
      const cfg = yield* $(config)
      const storageUrl = cfg.url.value
      if (storageUrl.startsWith("mem://")) {
        console.log("Using in memory store")
        return MemoryStoreLive
      }
      if (storageUrl.startsWith("disk://")) {
        const dir = storageUrl.replace("disk://", "")
        console.log("Using disk store at " + dir)
        return makeDiskStore(cfg, dir)
          .toLayer(StoreMaker)
      }
      if (storageUrl.startsWith("redis://")) {
        console.log("Using Redis store")
        return makeRedisStore(cfg)
          .toLayer(StoreMaker)
          .provide(RedisClient.RedisClientLive(makeRedis(storageUrl)))
      }

      console.log("Using Cosmos DB store")
      return makeCosmosStore(cfg)
        .toLayer(StoreMaker)
        .provide(CosmosClient.CosmosClientLive(storageUrl, cfg.dbName))
    })
    .unwrapLayer
}

function makeRedis(storageUrl: string) {
  const url = new URL(storageUrl)
  const hostname = url.hostname
  const password = url.password
  return () =>
    createClient(
      storageUrl === "redis://"
        ? ({
          host: hostname,
          port: 6380,
          auth_pass: password,
          tls: { servername: hostname }
        } as any)
        : (storageUrl as any)
    )
}

export * from "./service.js"
