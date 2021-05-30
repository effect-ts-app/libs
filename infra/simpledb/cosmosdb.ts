import { IndexingPolicy } from "@azure/cosmos"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"
import * as EO from "@effect-ts-app/core/ext/EffectOption"
import { pipe } from "@effect-ts-app/core/ext/Function"
import { typedKeysOf } from "@effect-ts-app/core/ext/utils"

import * as Cosmos from "../cosmos-client"
import { CachedRecord, DBRecord, OptimisticLockException } from "./shared"
import * as simpledb from "./simpledb"
import { Version } from "./simpledb"

class CosmosDbOperationError {
  constructor(readonly message: string) {}
}

const setup = (type: string, indexingPolicy: IndexingPolicy) =>
  pipe(
    Cosmos.db,
    T.tap((db) =>
      T.tryPromise(() =>
        db.containers
          .create({ id: type, indexingPolicy })
          .catch((err) => console.warn(err))
      )
    )
    // TODO: Error if current indexingPolicy does not match
    //T.chain((db) => T.tryPromise(() => db.container(type).(indexes)))
  )
export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => T.RIO<REncode, EA>,
    decode: (d: EA) => T.Effect<RDecode, EDecode, A>,
    //schemaVersion: string,
    indexes: IndexingPolicy
  ) => {
    return pipe(
      setup(type, indexes),
      T.map(() => ({
        find: simpledb.find(find, decode, type),
        findBy,
        save: simpledb.storeDirectly(store, type),
      }))
    )

    function find(id: string) {
      return pipe(
        Cosmos.db,
        T.chain((db) =>
          T.tryPromise(() => db.container(type).item(id).read<{ data: EA }>())
        ),
        T.map((i) => O.fromNullable(i.resource)),
        EO.map(({ _etag, data }) => ({ version: _etag, data } as CachedRecord<EA>))
      )
    }

    function findBy(parameters: Record<string, string>) {
      return pipe(
        Cosmos.db,
        T.chain((db) =>
          T.tryPromise(() =>
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
        T.map((x) => A.head(x.resources)),
        EO.map(({ id }) => id)
      )
    }

    function store(record: A, currentVersion: O.Option<Version>) {
      return T.gen(function* ($) {
        const version = "_etag" // we get this from the etag anyway.

        const db = yield* $(Cosmos.db)
        const data = yield* $(encode(record))

        yield* $(
          O.fold_(
            currentVersion,
            () =>
              T.tryPromise(() =>
                db.container(type).items.create({
                  id: record.id,
                  timestamp: new Date(),
                  data,
                })
              )
                ["|>"](T.asUnit)
                ["|>"](T.orDie),
            (currentVersion) =>
              pipe(
                T.tryPromise(() =>
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
                )["|>"](T.orDie),
                T.chain((x) => {
                  if (x.statusCode === 412) {
                    return T.fail(new OptimisticLockException(type, record.id))
                  }
                  if (x.statusCode > 299 || x.statusCode < 200) {
                    return T.die(
                      new CosmosDbOperationError(
                        "not able to update record: " + x.statusCode
                      )
                    )
                  }
                  return T.unit
                })
              )
          )
        )
        return { version, data: record } as CachedRecord<A>
      })
    }
  }
}
