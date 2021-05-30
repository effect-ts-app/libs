import { CosmosClient as ComosClient_ } from "@azure/cosmos"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as Has from "@effect-ts/core/Has"
import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/ext/Function"

const withClient = (url: string) => T.succeedWith(() => new ComosClient_(url))

const makeCosmosClient = (url: string, dbName: string) =>
  pipe(
    withClient(url),
    T.map((x) => ({ db: x.database(dbName) }))
  )

export interface CosmosClient extends _A<ReturnType<typeof makeCosmosClient>> {}

export const CosmosClient = Has.tag<CosmosClient>()

export const { db } = T.deriveLifted(CosmosClient)([], [], ["db"])

export const CosmosClientLive = (cosmosUrl: string, dbName: string) =>
  L.fromEffect(CosmosClient)(makeCosmosClient(cosmosUrl, dbName))
