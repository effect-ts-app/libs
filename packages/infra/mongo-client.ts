import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Has from "@effect-ts/core/Has"
import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/ext/Function"
import { MongoClient as MongoClient_ } from "mongodb"

// TODO: we should probably share a single client...

const withClient = (url: string) =>
  M.make_(
    T.effectAsync<unknown, Error, MongoClient_>((res) => {
      const client = new MongoClient_(url)
      client.connect((err, cl) => {
        err ? res(T.fail(err)) : res(T.succeed(cl))
      })
    }),
    (cl) =>
      pipe(
        T.uninterruptible(
          T.effectAsync<unknown, Error, void>((res) => {
            cl.close((err, r) => res(err ? T.fail(err) : T.succeed(r)))
          })
        ),
        T.orDie
      )
  )

const makeMongoClient = (url: string, dbName?: string) =>
  pipe(
    withClient(url),
    M.map((x) => ({ db: x.db(dbName) }))
  )

export interface MongoClient extends _A<ReturnType<typeof makeMongoClient>> {}

export const MongoClient = Has.tag<MongoClient>()

export const { db } = T.deriveLifted(MongoClient)([], [], ["db"])

export const MongoClientLive = (mongoUrl: string, dbName?: string) =>
  L.fromManaged(MongoClient)(makeMongoClient(mongoUrl, dbName))
