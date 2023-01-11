import { CosmosClient as ComosClient_ } from "@azure/cosmos"

const withClient = (url: string) => Effect.sync(() => new ComosClient_(url))

const makeCosmosClient = (url: string, dbName: string) => withClient(url).map(x => ({ db: x.database(dbName) }))

export interface CosmosClient extends Effect.Success<ReturnType<typeof makeCosmosClient>> {}

export const CosmosClient = Tag<CosmosClient>()

export const db = CosmosClient.with(_ => _.db)

export const CosmosClientLive = (cosmosUrl: string, dbName: string) =>
  makeCosmosClient(cosmosUrl, dbName).toLayer(CosmosClient)
