import { MongoClient } from "@effect-app/infra-adapters/mongo-client"
import type { IndexDescription, InsertOneOptions } from "mongodb"
import type { CachedRecord, DBRecord } from "./shared.js"
import { OptimisticLockException } from "./shared.js"
import * as simpledb from "./simpledb.js"
import type { Version } from "./simpledb.js"

// const makeFromIndexKeys = (indexKeys: string[], unique: boolean) => indexKeys.reduce((prev, cur) => {
//   prev[cur] = 1
//   return prev
// }, {} as Record<string, number>)

const setup = (type: string, indexes: IndexDescription[]) =>
  MongoClient
    .tap(({ db }) => Effect.tryPromise(() => db.createCollection(type).catch((err) => console.warn(err))))
    .flatMap(({ db }) => Effect.tryPromise(() => db.collection(type).createIndexes(indexes)))

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect<EA, never, REncode>,
    decode: (d: EA) => Effect<A, EDecode, RDecode>,
    // schemaVersion: string,
    indexes: IndexDescription[]
  ) => {
    return setup(type, indexes).map(() => ({
      find: simpledb.find(find, decode, type),
      findBy,
      save: simpledb.storeDirectly(store, type)
    }))

    function find(id: string) {
      return MongoClient
        .flatMap(({ db }) =>
          Effect.tryPromise(() =>
            db
              .collection(type)
              .findOne<{ _id: TKey; version: Version; data: EA }>({ _id: { equals: id } })
          )
        )
        .map(Option.fromNullable)
        .mapOpt(({ data, version }) => ({ version, data } as CachedRecord<EA>))
    }

    function findBy(keys: Record<string, string>) {
      return MongoClient
        .flatMap(({ db }) =>
          Effect.tryPromise(() => db.collection(type).findOne<{ _id: TKey }>(keys, { projection: { _id: 1 } }))
        )
        .map(Option.fromNullable)
        .mapOpt(({ _id }) => _id)
    }

    function store(record: A, currentVersion: Option<Version>) {
      return Effect.gen(function*($) {
        const version = currentVersion
          .map((cv) => (parseInt(cv) + 1).toString())
          .getOrElse(() => "1")

        const { db } = yield* $(MongoClient)
        const data = yield* $(encode(record))
        yield* $(
          currentVersion.match(
            {
              onNone: () =>
                Effect
                  .tryPromise(() =>
                    db
                      .collection(type)
                      .insertOne(
                        { _id: record.id as any, version, timestamp: new Date(), data },
                        {
                          checkKeys: false // support for keys with `.` and `$`. NOTE: you can write them, read them, but NOT query for them.
                        } as InsertOneOptions
                      )
                  )
                  .asUnit
                  .orDie,
              onSome: (currentVersion) =>
                Effect
                  .tryPromise(() =>
                    db.collection(type).replaceOne(
                      { _id: record.id as any, version: currentVersion },
                      {
                        version,
                        timestamp: new Date(),
                        data
                      },
                      { upsert: false }
                    )
                  )
                  .orDie
                  .flatMap((x) => {
                    if (!x.modifiedCount) {
                      return new OptimisticLockException(type, record.id)
                    }
                    return Effect.unit
                  })
            }
          )
        )
        return { version, data: record } as CachedRecord<A>
      })
    }
  };
}
