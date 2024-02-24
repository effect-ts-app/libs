/* eslint-disable @typescript-eslint/no-explicit-any */

import { CosmosClient, CosmosClientLayer } from "@effect-app/infra-adapters/cosmos-client"
import { Duration, Effect, Option } from "effect-app"
import type { NonEmptyReadonlyArray } from "effect-app"
import { dropUndefinedT, omit, pick, spread } from "effect-app/utils"
import { OptimisticConcurrencyException } from "../../errors.js"
import {
  buildCosmosQuery,
  buildFilterJoinSelectCosmosQuery,
  buildFindJoinCosmosQuery,
  buildWhereCosmosQuery3,
  logQuery
} from "./Cosmos/query.js"
import { StoreMaker } from "./service.js"
import type {
  FilterArgs,
  FilterJoinSelect,
  PersistenceModelType,
  StorageConfig,
  Store,
  StoreConfig
} from "./service.js"

class CosmosDbOperationError {
  constructor(readonly message: string) {}
} // TODO: Retry operation when running into RU limit.

function makeCosmosStore({ prefix }: StorageConfig) {
  return Effect.gen(function*($) {
    const { db } = yield* $(CosmosClient)
    return {
      make: <Id extends string, PM extends PersistenceModelType<Id>, R = never, E = never>(
        name: string,
        seed?: Effect<Iterable<PM>, E, R>,
        config?: StoreConfig<PM>
      ) =>
        Effect.gen(function*($) {
          const containerId = `${prefix}${name}`
          yield* $(
            Effect.promise(() =>
              db.containers.createIfNotExists(dropUndefinedT({
                id: containerId,
                uniqueKeyPolicy: config?.uniqueKeys
                  ? { uniqueKeys: config.uniqueKeys }
                  : undefined
              }))
            )
          )
          const defaultValues = config?.defaultValues ?? {}
          const container = db.container(containerId)
          const bulk = container.items.bulk.bind(container.items)
          const execBatch = container.items.batch.bind(container.items)
          const importedMarkerId = containerId

          const bulkSet = (items: NonEmptyReadonlyArray<PM>) =>
            Effect
              .gen(function*($) {
                // TODO: disable batching if need atomicity
                // we delay and batch to keep low amount of RUs
                const b = [...items].map(
                  (x) =>
                    [
                      x,
                      Option.fromNullable(x._etag).match({
                        onNone: () =>
                          dropUndefinedT({
                            operationType: "Create" as const,
                            resourceBody: {
                              ...omit(x, "_etag"),
                              _partitionKey: config?.partitionValue(x)
                            },
                            partitionKey: config?.partitionValue(x)
                          }),
                        onSome: (eTag) =>
                          dropUndefinedT({
                            operationType: "Replace" as const,
                            id: x.id,
                            resourceBody: {
                              ...omit(x, "_etag"),
                              _partitionKey: config?.partitionValue(x)
                            },
                            ifMatch: eTag,
                            partitionKey: config?.partitionValue(x)
                          })
                      })
                    ] as const
                )
                const batches = b.chunk(config?.maxBulkSize ?? 10).toReadonlyArray

                const batchResult = yield* $(
                  batches
                    .map((x, i) => [i, x] as const)
                    .forEachEffect(
                      ([i, batch]) =>
                        Effect
                          .promise(() => bulk(batch.map(([, op]) => op)))
                          .delay(Duration.millis(i === 0 ? 0 : 1100))
                          .flatMap((responses) =>
                            Effect.gen(function*($) {
                              const r = responses.find((x) => x.statusCode === 412 || x.statusCode === 404)
                              if (r) {
                                return yield* $(
                                  Effect.fail(
                                    new OptimisticConcurrencyException(
                                      { type: name, id: JSON.stringify(r.resourceBody?.["id"]) }
                                    )
                                  )
                                )
                              }
                              const r2 = responses.find(
                                (x) => x.statusCode > 299 || x.statusCode < 200
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
                              return batch.map(([e], i) => ({
                                ...e,
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                _etag: responses[i]!.eTag
                              }))
                            })
                          )
                    )
                )
                return batchResult.flat() as unknown as NonEmptyReadonlyArray<PM>
              })
              .withSpan("Cosmos.bulkSet [effect-app/infra/Store]", {
                attributes: { "repository.container_id": containerId, "repository.model_name": name }
              })

          const batchSet = (items: NonEmptyReadonlyArray<PM>) => {
            return Effect
              .suspend(() => {
                const batch = [...items].map(
                  (x) =>
                    [
                      x,
                      Option.fromNullable(x._etag).match({
                        onNone: () => ({
                          operationType: "Create" as const,
                          resourceBody: {
                            ...omit(x, "_etag"),
                            _partitionKey: config?.partitionValue(x)
                          }
                        }),
                        onSome: (eTag) => ({
                          operationType: "Replace" as const,
                          id: x.id,
                          resourceBody: {
                            ...omit(x, "_etag"),
                            _partitionKey: config?.partitionValue(x)
                          },
                          ifMatch: eTag
                        })
                      })
                    ] as const
                )

                const ex = batch.map(([, c]) => c)

                return Effect
                  .promise(() => execBatch(ex, ex[0]?.resourceBody._partitionKey))
                  .flatMap((x) =>
                    Effect.gen(function*($) {
                      const result = x.result ?? []
                      const firstFailed = result.find(
                        (x: any) => x.statusCode > 299 || x.statusCode < 200
                      )
                      if (firstFailed) {
                        const code = firstFailed.statusCode ?? 0
                        if (code === 412 || code === 404) {
                          return yield* $(
                            new OptimisticConcurrencyException({ type: name, id: "batch" })
                          )
                        }

                        return yield* $(
                          Effect.die(
                            new CosmosDbOperationError("not able to update record: " + code)
                          )
                        )
                      }

                      return batch.map(([e], i) => ({
                        ...e,
                        _etag: result[i]?.eTag
                      })) as unknown as NonEmptyReadonlyArray<PM>
                    })
                  )
              })
              .withSpan("Cosmos.batchSet [effect-app/infra/Store]", {
                attributes: { "repository.container_id": containerId, "repository.model_name": name }
              })
          }

          const s: Store<PM, Id> = {
            all: Effect
              .sync(() => ({
                query: `SELECT * FROM ${name} f WHERE f.id != @id`,
                parameters: [{ name: "@id", value: importedMarkerId }]
              }))
              .tap((q) => logQuery(q))
              .flatMap((q) =>
                Effect.promise(() =>
                  container
                    .items
                    .query<PM>(q)
                    .fetchAll()
                    .then(({ resources }) => resources)
                )
              )
              .withSpan("Cosmos.all [effect-app/infra/Store]", {
                attributes: { "repository.container_id": containerId, "repository.model_name": name }
              }),
            filterJoinSelect: <T extends object>(
              filter: FilterJoinSelect,
              cursor?: { skip?: number; limit?: number }
            ) =>
              filter
                .keys
                .forEachEffect((k) =>
                  Effect
                    .sync(() => buildFilterJoinSelectCosmosQuery(filter, k, name, cursor?.skip, cursor?.limit))
                    .tap((q) => logQuery(q))
                    .flatMap((q) =>
                      Effect.promise(() =>
                        container
                          .items
                          .query<T>(q)
                          .fetchAll()
                          .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._ })))
                      )
                    )
                )
                .map((a) => {
                  const v = a
                    .flatMap((_) => _)
                    .map((x) =>
                      spread(
                        x,
                        ({ r, ...rest }: any) => ({ ...rest, ...r } as T & { _rootId: string })
                      )
                    )
                  return v
                })
                .withSpan("Cosmos.filterJoinSelect [effect-app/infra/Store]", {
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                }),
            /**
             * May return duplicate results for "join_find", when matching more than once.
             */
            filter: <U extends keyof PM = never>(
              f: FilterArgs<PM, U>
            ) => {
              const skip = f?.skip
              const limit = f?.limit
              const filter = f.filter ?? { type: "new-kid", build: () => [] }
              type M = U extends undefined ? PM : Pick<PM, U>
              return (filter.type === "join_find"
                // This is a problem if one of the multiple joined arrays can be empty!
                // https://stackoverflow.com/questions/60320780/azure-cosmosdb-sql-join-not-returning-results-when-the-child-contains-empty-arra
                // so we use multiple queries instead.
                ? filter
                  .keys
                  .forEachEffect((k) =>
                    Effect
                      .sync(() => buildFindJoinCosmosQuery(filter, k, name, skip, limit))
                      .tap((q) => logQuery(q))
                      .flatMap((q) =>
                        Effect.promise(() =>
                          container
                            .items
                            .query<M>(q)
                            .fetchAll()
                            .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._ })))
                        )
                      )
                  )
                  .map((_) => _.flatMap((_) => _))
                : (filter.type === "new-kid"
                  ? Effect
                    .sync(() =>
                      buildWhereCosmosQuery3(
                        filter.build(),
                        name,
                        importedMarkerId,
                        defaultValues,
                        f.select as NonEmptyReadonlyArray<string> | undefined,
                        f.order as NonEmptyReadonlyArray<{ key: string; direction: "ASC" | "DESC" }> | undefined,
                        skip,
                        limit
                      )
                    )
                    .tap((q) => logQuery(q))
                    .flatMap((q) =>
                      Effect.promise(() =>
                        f.select
                          ? container
                            .items
                            .query<M>(q)
                            .fetchAll()
                            .then(({ resources }) =>
                              resources.map((_) => ({ ...pick(defaultValues, f.select!), ..._ }))
                            )
                          : container
                            .items
                            .query<{ f: M }>(q)
                            .fetchAll()
                            .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._.f })))
                      )
                    )
                  : Effect
                    .sync(() => buildCosmosQuery(filter, name, importedMarkerId, defaultValues, skip, limit))
                    .tap((q) => logQuery(q))
                    .flatMap((q) =>
                      Effect.promise(() =>
                        container
                          .items
                          .query<{ f: M }>(q)
                          .fetchAll()
                          .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._.f })))
                      )
                    )))
                .withSpan("Cosmos.filter [effect-app/infra/Store]", {
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                })
            },
            find: (id) =>
              Effect
                .promise(() =>
                  container
                    .item(id, config?.partitionValue({ id } as PM))
                    .read<PM>()
                    .then(({ resource }) => Option.fromNullable(resource).map((_) => ({ ...defaultValues, ..._ })))
                )
                .withSpan("Cosmos.find [effect-app/infra/Store]", {
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                }),
            set: (e) =>
              Option
                .fromNullable(e._etag)
                .match(
                  {
                    onNone: () =>
                      Effect.promise(() =>
                        container.items.create({
                          ...e,
                          _partitionKey: config?.partitionValue(e)
                        })
                      ),
                    onSome: (eTag) =>
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
                  }
                )
                .flatMap((x) => {
                  if (x.statusCode === 412 || x.statusCode === 404) {
                    return new OptimisticConcurrencyException({ type: name, id: e.id })
                  }
                  if (x.statusCode > 299 || x.statusCode < 200) {
                    return Effect.die(
                      new CosmosDbOperationError(
                        "not able to update record: " + x.statusCode
                      )
                    )
                  }
                  return Effect.sync(() => ({
                    ...e,
                    _etag: x.etag
                  }))
                })
                .withSpan("Cosmos.set [effect-app/infra/Store]", {
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                }),
            batchSet,
            bulkSet,
            remove: (e: PM) =>
              Effect
                .promise(() => container.item(e.id, config?.partitionValue(e)).delete())
                .withSpan("Cosmos.remove [effect-app/infra/Store]", {
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                })
          }

          // handle mock data
          const marker = yield* $(
            Effect.promise(() =>
              container
                .item(importedMarkerId, importedMarkerId)
                .read<{ id: string }>()
                .then(({ resource }) => Option.fromNullable(resource))
            )
          )

          if (!marker.isSome()) {
            console.log("Creating mock data for " + name)
            if (seed) {
              const m = yield* $(seed)
              yield* $(
                Effect
                  .succeed([...m].toNonEmpty)
                  .flatMapOpt((a) =>
                    s
                      .bulkSet(a)
                      .orDie
                      // we delay extra here, so that initial creation between Companies/POs also have an interval between them.
                      .delay(Duration.millis(1100))
                  )
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

export function CosmosStoreLayer(cfg: StorageConfig) {
  return StoreMaker
    .toLayer(makeCosmosStore(cfg))
    .provide(CosmosClientLayer(cfg.url.value, cfg.dbName))
}
