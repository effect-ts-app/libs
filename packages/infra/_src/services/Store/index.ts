/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CosmosClient from "@effect-app/infra-adapters/cosmos-client"
import * as RedisClient from "@effect-app/infra-adapters/redis-client"
import { createClient } from "redis"

import { makeCosmosStore } from "./Cosmos.js"
import { makeDiskStore } from "./Disk.js"
import { makeMemoryStore } from "./Memory.js"
import { makeRedisStore } from "./Redis.js"
import type { StorageConfig } from "./service.js"
import { StoreMaker } from "./service.js"

/**
 * @tsplus static StoreMaker.Ops Live
 */
export function StoreMakerLive(config: Config<StorageConfig>) {
  return config.config.flatMap(cfg => {
    const storageUrl = cfg.url.value
    if (storageUrl.startsWith("mem://")) {
      console.log("Using in memory store")
      return Effect(makeMemoryStore())
    }
    if (storageUrl.startsWith("disk://")) {
      console.log("Using disk store at ./.data")
      return makeDiskStore(cfg)
    }
    if (storageUrl.startsWith("redis://")) {
      console.log("Using Redis store")
      return RedisClient.makeRedisClient(makeRedis(storageUrl)).flatMap(client =>
        makeRedisStore(cfg).provideService(
          RedisClient.RedisClient,
          client
        )
      )
    }

    console.log("Using Cosmos DB store")
    return CosmosClient.makeCosmosClient(storageUrl, cfg.dbName).flatMap(client =>
      makeCosmosStore(cfg).provideService(CosmosClient.CosmosClient, client)
    )
  })
    .toLayerScoped(StoreMaker)
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
