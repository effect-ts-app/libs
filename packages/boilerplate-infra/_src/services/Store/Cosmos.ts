/* eslint-disable @typescript-eslint/no-explicit-any */

import * as CosmosClient from "@effect-ts-app/infra/cosmos-client"

import { OptimisticConcurrencyException } from "../../errors.js"

import { omit } from "@effect-ts-app/boilerplate-prelude/utils"

import type {
  Filter,
  FilterJoinSelect,
  JoinFindFilter,
  LegacyFilter,
  PersistenceModelType,
  StorageConfig,
  Store,
  StoreConfig,
  StoreWhereFilter
} from "./service.js"
import { StoreMaker } from "./service.js"

// TODO: Retry operation when running into RU limit.
function makeCosmosStore({ STORAGE_PREFIX }: StorageConfig) {
  return Effect.gen(function*($) {
    const { db } = yield* $(CosmosClient.CosmosClient)
    return {
      make: <Id extends string, PM extends PersistenceModelType<Id>, Id2 extends Id>(
        name: string,
        existing?: Effect<never, never, ROMap<Id2, PM>>,
        config?: StoreConfig<PM>
      ) =>
        Effect.gen(function*($) {
          const containerId = `${STORAGE_PREFIX}${name}`
          yield* $(
            Effect.promise(() =>
              db.containers.createIfNotExists({
                id: containerId,
                uniqueKeyPolicy: config?.uniqueKeys
                  ? { uniqueKeys: config.uniqueKeys }
                  : undefined
              })
            )
          )
          const container = db.container(containerId)
          const bulk = container.items.bulk.bind(container.items)
          const execBatch = container.items.batch.bind(container.items)
          const importedMarkerId = containerId

          const bulkSet = <T extends Collection<PM>>(items: T) =>
            Effect.gen(function*($) {
              // TODO: disable batching if need atomicity
              // we delay and batch to keep low amount of RUs
              const batches = ROArray.split_(
                [...items].map(
                  x =>
                    [
                      x,
                      Maybe.fromNullable(x._etag).fold(
                        () => ({
                          operationType: "Create" as const,
                          resourceBody: {
                            ...omit(x, "_etag"),
                            _partitionKey: config?.partitionValue(x)
                          } as any,
                          partitionKey: config?.partitionValue(x)
                        }),
                        eTag => ({
                          operationType: "Replace" as const,
                          id: x.id,
                          resourceBody: {
                            ...omit(x, "_etag"),
                            _partitionKey: config?.partitionValue(x)
                          } as any,
                          ifMatch: eTag,
                          partitionKey: config?.partitionValue(x)
                        })
                      )
                    ] as const
                ),
                4
              )

              const batchResult = yield* $(
                batches.mapWithIndex((i, x) => [i, x] as const).forEachEffect(
                  ([i, batch]) =>
                    Effect.promise(() => bulk(batch.map(([, op]) => op)))
                      .delay(DUR.millis(i === 0 ? 0 : 1100))
                      .flatMap(responses =>
                        Effect.gen(function*($) {
                          const r = responses.find(x => x.statusCode === 412)
                          if (r) {
                            return yield* $(
                              Effect.fail(
                                new OptimisticConcurrencyException(
                                  name,
                                  JSON.stringify(r.resourceBody?.["id"])
                                )
                              )
                            )
                          }
                          const r2 = responses.find(
                            x => x.statusCode > 299 || x.statusCode < 200
                          )
                          if (r2) {
                            return yield* $(
                              Effect.die(
                                new CosmosDbOperationError(
                                  "not able to update record: " + r2.statusCode
                                )
                              )
                            )
                          }
                          return batch.mapWithIndex((i, [e]) => ({
                            ...e,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            _etag: responses[i]!.eTag
                          }))
                        })
                      )
                )
              )
              return batchResult.toArray.flatten()
            })

          const batchSet = <T extends Collection<PM>>(items: T) => {
            const batch = [...items].map(
              x =>
                [
                  x,
                  Maybe.fromNullable(x._etag).fold(
                    () => ({
                      operationType: "Create" as const,
                      resourceBody: {
                        ...omit(x, "_etag"),
                        _partitionKey: config?.partitionValue(x)
                      } as any
                    }),
                    eTag => ({
                      operationType: "Replace" as const,
                      id: x.id,
                      resourceBody: {
                        ...omit(x, "_etag"),
                        _partitionKey: config?.partitionValue(x)
                      } as any,
                      ifMatch: eTag
                    })
                  )
                ] as const
            )

            const ex = batch.map(([, c]) => c)
            return Effect.promise(() => execBatch(ex, ex[0]?.resourceBody._partitionKey))
              .flatMap(x =>
                Effect.gen(function*($) {
                  const result = x.result ?? []
                  const firstFailed = result.find(
                    (x: any) => x.statusCode > 299 || x.statusCode < 200
                  )
                  if (firstFailed) {
                    const code = firstFailed.statusCode ?? 0
                    if (code === 412) {
                      return yield* $(
                        Effect.fail(new OptimisticConcurrencyException(name, "batch"))
                      )
                    }

                    return yield* $(
                      Effect.die(
                        new CosmosDbOperationError("not able to update record: " + code)
                      )
                    )
                  }

                  return batch.mapWithIndex((i, [e]) => ({
                    ...e,
                    _etag: result[i]?.eTag
                  }))
                })
              )
          }

          const s: Store<PM, Id> = {
            all: Effect.promise(() =>
              container.items
                .query<PM>({
                  query: `SELECT * FROM ${name} f WHERE f.id != @id`,
                  parameters: [{ name: "@id", value: importedMarkerId }]
                })
                .fetchAll()
                .then(({ resources }) => resources.toChunk)
            ),
            filterJoinSelect: <T extends object>(
              filter: FilterJoinSelect,
              cursor?: { skip?: number; limit?: number }
            ) =>
              filter.keys
                .forEachEffect(k =>
                  Effect.promise(() =>
                    container.items
                      .query<T>(buildFilterJoinSelectCosmosQuery(filter, k, name, cursor?.skip, cursor?.limit))
                      .fetchAll()
                      .then(({ resources }) => resources.toChunk)
                  )
                )
                .map(a => {
                  const v = a
                    .flatMap(_ => _)
                    .map(x =>
                      spread(
                        x,
                        ({ r, ...rest }: any) => ({ ...rest, ...r } as T & { _rootId: string })
                      )
                    )
                  return Chunk.from(v)
                }),
            /**
             * May return duplicate results for "join_find", when matching more than once.
             */
            filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) => {
              const skip = cursor?.skip
              const limit = cursor?.limit
              return filter.type === "join_find"
                ? // This is a problem if one of the multiple joined arrays can be empty!
                // https://stackoverflow.com/questions/60320780/azure-cosmosdb-sql-join-not-returning-results-when-the-child-contains-empty-arra
                // so we use multiple queries instead.
                  filter.keys
                    .forEachEffect(k =>
                      Effect.promise(() =>
                        container.items
                          .query<PM>(buildFindJoinCosmosQuery(filter, k, name, skip, limit))
                          .fetchAll()
                          .then(({ resources }) => resources.toChunk)
                      )
                    )
                    .map(_ => _.flatMap(_ => _))
                : Effect.promise(() =>
                  container.items
                    .query<PM>(
                      buildCosmosQuery(filter, name, importedMarkerId, skip, limit)
                    )
                    .fetchAll()
                    .then(({ resources }) => resources.toChunk)
                )
            },
            find: id =>
              Effect.promise(() =>
                container
                  .item(id, config?.partitionValue({ id } as PM))
                  .read<PM>()
                  .then(({ resource }) => Maybe.fromNullable(resource))
              ),
            set: e =>
              Maybe.fromNullable(e._etag)
                .fold(
                  () =>
                    Effect.promise(() =>
                      container.items.create({
                        ...e,
                        _partitionKey: config?.partitionValue(e)
                      })
                    ),
                  eTag =>
                    Effect.promise(() =>
                      container.item(e.id, config?.partitionValue(e)).replace(
                        { ...e, _partitionKey: config?.partitionValue(e) },
                        {
                          accessCondition: {
                            type: "IfMatch",
                            condition: eTag
                          }
                        }
                      )
                    )
                )
                .flatMap(x => {
                  if (x.statusCode === 412) {
                    return Effect.fail(new OptimisticConcurrencyException(name, e.id))
                  }
                  if (x.statusCode > 299 || x.statusCode < 200) {
                    return Effect.die(
                      new CosmosDbOperationError(
                        "not able to update record: " + x.statusCode
                      )
                    )
                  }
                  return Effect({
                    ...e,
                    _etag: x.etag
                  })
                }),
            batchSet,
            bulkSet,
            remove: (e: PM) => Effect.promise(() => container.item(e.id, config?.partitionValue(e)).delete())
          }

          // handle mock data
          const marker = yield* $(
            Effect.promise(() =>
              container
                .item(importedMarkerId, importedMarkerId)
                .read<{ id: string }>()
                .then(({ resource }) => Maybe.fromNullable(resource))
            )
          )

          if (!marker.isSome()) {
            console.log("Creating mock data for " + name)
            if (existing) {
              const m = yield* $(existing)
              yield* $(
                s
                  .bulkSet([...m.values()])
                  .orDie
                  // we delay extra here, so that initial creation between Companies/POs also have an interval between them.
                  .delay(DUR.millis(1100))
              )
            }
            // Mark as imported
            yield* $(
              Effect.promise(() =>
                container.items.create({
                  _partitionKey: importedMarkerId,
                  id: importedMarkerId
                })
              )
            )
          }
          return s
        })
    }
  })
}

/**
 * @deprecated: should build Select into Where query
 */
export function buildFilterJoinSelectCosmosQuery(
  filter: FilterJoinSelect,
  k: string,
  name: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
SELECT r, c.id as _rootId
FROM ${name} c
JOIN r IN c.${k}
WHERE LOWER(r.${filter.valueKey}) = LOWER(@value)
${lm}
`,
    parameters: [{ name: "@value", value: filter.value }]
  }
}

/**
 * @deprecated: is now part of Where query as k.-1.valueKey
 */
export function buildFindJoinCosmosQuery(
  filter: JoinFindFilter,
  k: string,
  name: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
SELECT DISTINCT VALUE c
FROM ${name} c
JOIN r IN c.${k}
WHERE LOWER(r.${filter.valueKey}) = LOWER(@value)
${lm}`,
    parameters: [{ name: "@value", value: filter.value }]
  }
}

/**
 * @deprecated: should build into Where query
 */
export function buildLegacyCosmosQuery<PM>(
  filter: LegacyFilter<PM>,
  name: string,
  importedMarkerId: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `SELECT * FROM ${name} f WHERE f.id != @id AND f.${
      String(
        filter.by
      )
    } LIKE @filter
  ${lm}`,
    parameters: [
      { name: "@id", value: importedMarkerId },
      {
        name: "@filter",
        value: filter.type === "endsWith"
          ? `%${filter.value}`
          : filter.type === "contains"
          ? `%${filter.value}%`
          : `${filter.value}%`
      }
    ]
  }
}

export function buildWhereCosmosQuery(
  filter: StoreWhereFilter,
  name: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
    SELECT * FROM ${name} f
    ${
      filter.where.filter(_ => _.key.includes(".-1."))
        .map(_ => _.key.split(".-1.")[0])
        .map(_ => `JOIN ${_} IN c.${_}`)
    }
    WHERE ${
      filter.where
        .map(_ =>
          _.key.includes(".-1.") ?
            { ..._, f: _.key.split(".-1.")[0], key: _.key.split(".-1.")[1]! } :
            { ..._, f: "f" }
        )
        .mapWithIndex(
          (i, x) =>
            x.t === "in"
              ? `ARRAY_CONTAINS(@v${i}, ${x.f}.${x.key})`
              : x.t === "not-in"
              ? `ARRAY_CONTAINS(@v${i}, ${x.f}.${x.key}, false)`
              : `LOWER(${x.f}.${x.key}) = LOWER(@v${i})`
        )
        .join(filter.mode === "or" ? " OR " : " AND ")
    }
    ${lm}`,
    parameters: filter.where
      .mapWithIndex((i, x) => ({
        name: `@v${i}`,
        value: x.value
      }))
      .mutable
  }
}

export function buildCosmosQuery<PM>(
  filter: LegacyFilter<PM> | StoreWhereFilter,
  name: string,
  importedMarkerId: string,
  skip?: number,
  limit?: number
) {
  return filter.type === "startsWith" ||
      filter.type === "endsWith" ||
      filter.type === "contains"
    ? buildLegacyCosmosQuery(filter, name, importedMarkerId, skip, limit)
    : buildWhereCosmosQuery(filter, name, skip, limit)
}

class CosmosDbOperationError {
  constructor(readonly message: string) {}
}
export function CosmosStoreLive(config: StorageConfig) {
  return Layer.fromEffect(StoreMaker)(makeCosmosStore(config))
}
