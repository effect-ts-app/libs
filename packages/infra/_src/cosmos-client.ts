import { CosmosClient as ComosClient_ } from "@azure/cosmos"
import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/Function"

const withClient = (url: string) => Effect.succeedWith(() => new ComosClient_(url))

const makeCosmosClient = (url: string, dbName: string) =>
  pipe(
    withClient(url),
    Effect.map((x) => ({ db: x.database(dbName) }))
  )

export interface CosmosClient extends _A<ReturnType<typeof makeCosmosClient>> {}

export const CosmosClient = Has.tag<CosmosClient>()

export const { db } = Effect.deriveLifted(CosmosClient)([], [], ["db"])

export const CosmosClientLive = (cosmosUrl: string, dbName: string) =>
  Layer.fromEffect(CosmosClient)(makeCosmosClient(cosmosUrl, dbName))
