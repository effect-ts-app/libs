/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CosmosClient from "@effect-ts-app/infra/cosmos-client"
import * as RedisClient from "@effect-ts-app/infra/redis-client"
import { createClient } from "redis"

import { CosmosStoreLive } from "./Cosmos.js"
import { DiskStoreLive } from "./Disk.js"
import { MemoryStoreLive } from "./Memory.js"
import { RedisStoreLive } from "./Redis.js"
import type { StorageConfig } from "./service.js"

export function StoreMakerLive(storageUrl: string, config: StorageConfig) {
  if (storageUrl.startsWith("mem://")) {
    console.log("Using in memory store")
    return MemoryStoreLive
  }
  if (storageUrl.startsWith("disk://")) {
    console.log("Using disk store at ./.data")
    return DiskStoreLive(config)
  }
  if (storageUrl.startsWith("redis://")) {
    console.log("Using Redis store")

    return makeRedis(storageUrl, config)
  }

  console.log("Using Cosmos DB store")
  return makeCosmos(storageUrl, config)
}

function makeRedis(storageUrl: string, config: StorageConfig) {
  const url = new URL(storageUrl)
  const hostname = url.hostname
  const password = url.password
  return RedisClient.RedisClientLive(() =>
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
  ).provideTo(RedisStoreLive(config))
}

function makeCosmos(storageUrl: string, config: StorageConfig) {
  return CosmosClient.CosmosClientLive(
    storageUrl,
    `${config.serviceName}${config.env === "prod" ? "" : config.env === "local-dev" ? "-local-dev" : "-dev"}`
  ).provideTo(CosmosStoreLive(config))
}

export * from "./service.js"
