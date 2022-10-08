import { IndexDescription, InsertOneOptions } from "mongodb"

import * as Mongo from "../mongo-client.js"
import { CachedRecord, DBRecord, OptimisticLockException } from "./shared.js"
import * as simpledb from "./simpledb.js"
import { Version } from "./simpledb.js"

// const makeFromIndexKeys = (indexKeys: string[], unique: boolean) => indexKeys.reduce((prev, cur) => {
//   prev[cur] = 1
//   return prev
// }, {} as Record<string, number>)

const setup = (type: string, indexes: IndexDescription[]) =>
  Mongo.db
    .tap((db) =>
      Effect.tryPromise(() =>
        db.createCollection(type).catch((err) => console.warn(err))
      )
    )
    .flatMap((db) =>
      Effect.tryPromise(() => db.collection(type).createIndexes(indexes))
    )

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect<REncode, never, EA>,
    decode: (d: EA) => Effect<RDecode, EDecode, A>,
    //schemaVersion: string,
    indexes: IndexDescription[]
  ) => {
    return setup(type, indexes).map(() => ({
      find: simpledb.find(find, decode, type),
      findBy,
      save: simpledb.storeDirectly(store, type),
    }))

    function find(id: string) {
      return Mongo.db
        .flatMap((db) =>
          Effect.tryPromise(() =>
            db
              .collection(type)
              .findOne<{ _id: TKey; version: Version; data: EA }>({ _id: id })
          )
        )
        .map(Maybe.fromNullable)
        .mapMaybe(({ data, version }) => ({ version, data } as CachedRecord<EA>))
    }

    function findBy(keys: Record<string, string>) {
      return Mongo.db
        .flatMap((db) =>
          Effect.tryPromise(() =>
            db.collection(type).findOne<{ _id: TKey }>(keys, { projection: { _id: 1 } })
          )
        )
        .map(Maybe.fromNullable)
        .mapMaybe(({ _id }) => _id)
    }

    function store(record: A, currentVersion: Maybe<Version>) {
      return Effect.gen(function* ($) {
        const version = currentVersion
          .map((cv) => (parseInt(cv) + 1).toString())
          .getOrElse(() => "1")

        const db = yield* $(Mongo.db)
        const data = yield* $(encode(record))
        yield* $(
          currentVersion.fold(
            () =>
              Effect.tryPromise(() =>
                db
                  .collection(type)
                  .insertOne(
                    { _id: record.id as any, version, timestamp: new Date(), data },
                    {
                      checkKeys: false, // support for keys with `.` and `$`. NOTE: you can write them, read them, but NOT query for them.
                    } as InsertOneOptions
                  )
              ).unit.orDie,
            (currentVersion) =>
              Effect.tryPromise(() =>
                db.collection(type).replaceOne(
                  { _id: record.id, version: currentVersion },
                  {
                    version,
                    timestamp: new Date(),
                    data,
                  },
                  { upsert: false }
                )
              ).orDie.flatMap((x) => {
                if (!x.modifiedCount) {
                  return Effect.fail(new OptimisticLockException(type, record.id))
                }
                return Effect.unit
              })
          )
        )
        return { version, data: record } as CachedRecord<A>
      })
    }
  }
}
