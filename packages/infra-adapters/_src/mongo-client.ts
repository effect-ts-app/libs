import { MongoClient as MongoClient_ } from "mongodb"

// TODO: we should probably share a single client...

const withClient = (url: string) =>
  Effect
    .promise(() => {
      const client = new MongoClient_(url)
      return client.connect()
    })
    .acquireRelease(
      (cl) => Effect.promise(() => cl.close()).uninterruptible.orDie
    )

const makeMongoClient = (url: string, dbName?: string) => withClient(url).map((x) => ({ db: x.db(dbName) }))

export interface MongoClient extends Effect.Success<ReturnType<typeof makeMongoClient>> {}

export const MongoClient = Tag<MongoClient>()

export const MongoClientLive = (mongoUrl: string, dbName?: string) =>
  makeMongoClient(mongoUrl, dbName)
    .toLayerScoped(MongoClient)
