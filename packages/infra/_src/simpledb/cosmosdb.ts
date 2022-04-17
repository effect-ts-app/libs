import { IndexingPolicy } from "@azure/cosmos"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as EO from "@effect-ts-app/core/EffectOption"
import { pipe } from "@effect-ts-app/core/Function"
import { typedKeysOf } from "@effect-ts-app/core/utils"

import * as Cosmos from "../cosmos-client.js"
import { CachedRecord, DBRecord, OptimisticLockException } from "./shared.js"
import * as simpledb from "./simpledb.js"
import { Version } from "./simpledb.js"

class CosmosDbOperationError {
  constructor(readonly message: string) {}
}

const setup = (type: string, indexingPolicy: IndexingPolicy) =>
  pipe(
    Cosmos.db,
    Effect.tap((db) =>
      Effect.tryPromise(() =>
        db.containers
          .create({ id: type, indexingPolicy })
          .catch((err) => console.warn(err))
      )
    )
    // TODO: Error if current indexingPolicy does not match
    //Effect.chain((db) => Effect.tryPromise(() => db.container(type).(indexes)))
  )
export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect.RIO<REncode, EA>,
    decode: (d: EA) => Effect<RDecode, EDecode, A>,
    //schemaVersion: string,
    indexes: IndexingPolicy
  ) => {
    return pipe(
      setup(type, indexes),
      Effect.map(() => ({
        find: simpledb.find(find, decode, type),
        findBy,
        save: simpledb.storeDirectly(store, type),
      }))
    )

    function find(id: string) {
      return pipe(
        Cosmos.db,
        Effect.chain((db) =>
          Effect.tryPromise(() => db.container(type).item(id).read<{ data: EA }>())
        ),
        Effect.map((i) => Option.fromNullable(i.resource)),
        EO.map(({ _etag, data }) => ({ version: _etag, data } as CachedRecord<EA>))
      )
    }

    function findBy(parameters: Record<string, string>) {
      return pipe(
        Cosmos.db,
        Effect.chain((db) =>
          Effect.tryPromise(() =>
            db
              .container(type)
              .items.query({
                query: `
SELECT TOP 1 ${type}.id
FROM ${type} i
WHERE (
  ${typedKeysOf(parameters)
    .map((k) => `i.${k} = @${k}`)
    .join(" and ")}
)
`,
                parameters: typedKeysOf(parameters).map((p) => ({
                  name: `@${p}`,
                  value: parameters[p],
                })),
              })
              .fetchAll()
          )
        ),
        Effect.map((x) => A.head(x.resources)),
        EO.map(({ id }) => id)
      )
    }

    function store(record: A, currentVersion: Option<Version>) {
      return Effect.gen(function* ($) {
        const version = "_etag" // we get this from the etag anyway.

        const db = yield* $(Cosmos.db)
        const data = yield* $(encode(record))

        yield* $(
          Option.fold_(
            currentVersion,
            () =>
              Effect.tryPromise(() =>
                db.container(type).items.create({
                  id: record.id,
                  timestamp: new Date(),
                  data,
                })
              )
                .asUnit()
                .orDie(),
            (currentVersion) =>
              pipe(
                Effect.tryPromise(() =>
                  db
                    .container(type)
                    .item(record.id)
                    .replace(
                      {
                        id: record.id,
                        timestamp: new Date(),
                        data,
                      },
                      {
                        accessCondition: {
                          type: "IfMatch",
                          condition: currentVersion,
                        },
                      }
                    )
                ),
                Effect.orDie,
                Effect.chain((x) => {
                  if (x.statusCode === 412) {
                    return Effect.fail(new OptimisticLockException(type, record.id))
                  }
                  if (x.statusCode > 299 || x.statusCode < 200) {
                    return Effect.die(
                      new CosmosDbOperationError(
                        "not able to update record: " + x.statusCode
                      )
                    )
                  }
                  return Effect.unit
                })
              )
          )
        )
        return { version, data: record } as CachedRecord<A>
      })
    }
  }
}
