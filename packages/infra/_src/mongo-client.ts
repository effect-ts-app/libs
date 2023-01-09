import { MongoClient as MongoClient_ } from "mongodb"

// TODO: we should probably share a single client...

const withClient = (url: string) =>
  Effect.async<never, Error, MongoClient_>(res => {
    const client = new MongoClient_(url)
    client.connect(err => {
      err ? res(Effect.fail(err)) : res(Effect.succeed(client))
    })
  }).acquireRelease(
    cl =>
      Effect.async<never, Error, void>(res => {
        cl.close((err, r) => res(err ? Effect.fail(err) : Effect.succeed(r)))
      }).uninterruptible.orDie
  )

const makeMongoClient = (url: string, dbName?: string) => withClient(url).map(x => ({ db: x.db(dbName) }))

export interface MongoClient extends Effect.Success<ReturnType<typeof makeMongoClient>> {}

export const MongoClient = Tag<MongoClient>()

export const db = MongoClient.with(_ => _.db)

export const MongoClientLive = (mongoUrl: string, dbName?: string) =>
  makeMongoClient(mongoUrl, dbName).scoped(MongoClient)
