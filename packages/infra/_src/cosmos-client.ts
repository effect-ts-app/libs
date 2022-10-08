import { CosmosClient as ComosClient_ } from "@azure/cosmos"
import { _A } from "@effect-ts/core/Utils"

const withClient = (url: string) => Effect.sync(() => new ComosClient_(url))

const makeCosmosClient = (url: string, dbName: string) =>
  withClient(url).map((x) => ({ db: x.database(dbName) }))

export interface CosmosClient extends _A<ReturnType<typeof makeCosmosClient>> {}

export const CosmosClient = Tag<CosmosClient>()

export const { db } = Effect.deriveLifted(CosmosClient)([], [], ["db"])

export const CosmosClientLive = (cosmosUrl: string, dbName: string) =>
  Layer.fromEffect(CosmosClient)(makeCosmosClient(cosmosUrl, dbName))
