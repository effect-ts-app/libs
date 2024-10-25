/* eslint-disable @typescript-eslint/no-explicit-any */

import { Array, Chunk, Duration, Effect, Layer, Option, pipe, Secret, Struct } from "effect-app"
import type { NonEmptyReadonlyArray } from "effect-app"
import { toNonEmptyArray } from "effect-app/Array"
import { dropUndefinedT } from "effect-app/utils"
import { CosmosClient, CosmosClientLayer } from "../adapters/cosmos-client.js"
import { OptimisticConcurrencyException } from "../errors.js"
import { InfraLogger } from "../logger.js"
import { buildWhereCosmosQuery3, logQuery } from "./Cosmos/query.js"
import { StoreMaker } from "./service.js"
import type { FilterArgs, PersistenceModelType, StorageConfig, Store, StoreConfig } from "./service.js"

class CosmosDbOperationError {
  constructor(readonly message: string) {}
} // TODO: Retry operation when running into RU limit.

function makeCosmosStore({ prefix }: StorageConfig) {
  return Effect.gen(function*() {
    const { db } = yield* CosmosClient
    return {
      make: <Id extends string, Encoded extends Record<string, any> & { id: Id }, R = never, E = never>(
        name: string,
        seed?: Effect<Iterable<Encoded>, E, R>,
        config?: StoreConfig<Encoded>
      ) =>
        Effect.gen(function*() {
          type PM = PersistenceModelType<Encoded>
          const containerId = `${prefix}${name}`
          yield* Effect.promise(() =>
            db.containers.createIfNotExists(dropUndefinedT({
              id: containerId,
              uniqueKeyPolicy: config?.uniqueKeys
                ? { uniqueKeys: config.uniqueKeys }
                : undefined
            }))
          )

          const defaultValues = config?.defaultValues ?? {}
          const container = db.container(containerId)
          const bulk = container.items.bulk.bind(container.items)
          const execBatch = container.items.batch.bind(container.items)
          const importedMarkerId = containerId

          const bulkSet = (items: NonEmptyReadonlyArray<PM>) =>
            Effect
              .gen(function*() {
                // TODO: disable batching if need atomicity
                // we delay and batch to keep low amount of RUs
                const b = [...items].map(
                  (x) =>
                    [
                      x,
                      Option.match(Option.fromNullable(x._etag), {
                        onNone: () =>
                          dropUndefinedT({
                            operationType: "Create" as const,
                            resourceBody: {
                              ...Struct.omit(x, "_etag"),
                              _partitionKey: config?.partitionValue(x)
                            },
                            partitionKey: config?.partitionValue(x)
                          }),
                        onSome: (eTag) =>
                          dropUndefinedT({
                            operationType: "Replace" as const,
                            id: x.id,
                            resourceBody: {
                              ...Struct.omit(x, "_etag"),
                              _partitionKey: config?.partitionValue(x)
                            },
                            ifMatch: eTag,
                            partitionKey: config?.partitionValue(x)
                          })
                      })
                    ] as const
                )
                const batches = Chunk.toReadonlyArray(Array.chunk_(b, config?.maxBulkSize ?? 10))

                const batchResult = yield* Effect.forEach(
                  batches
                    .map((x, i) => [i, x] as const),
                  ([i, batch]) =>
                    Effect
                      .promise(() => bulk(batch.map(([, op]) => op)))
                      .pipe(
                        Effect
                          .delay(Duration.millis(i === 0 ? 0 : 1100)),
                        Effect
                          .flatMap((responses) =>
                            Effect.gen(function*() {
                              const r = responses.find((x) => x.statusCode === 412 || x.statusCode === 404)
                              if (r) {
                                return yield* Effect.fail(
                                  new OptimisticConcurrencyException(
                                    { type: name, id: JSON.stringify(r.resourceBody?.["id"]) }
                                  )
                                )
                              }
                              const r2 = responses.find(
                                (x) => x.statusCode > 299 || x.statusCode < 200
                              )
                              if (r2) {
                                return yield* Effect.die(
                                  new CosmosDbOperationError(
                                    "not able to update record: " + r2.statusCode
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

                return batchResult.flat() as unknown as NonEmptyReadonlyArray<Encoded>
              })
              .pipe(Effect.withSpan("Cosmos.bulkSet [effect-app/infra/Store]", {
                captureStackTrace: false,
                attributes: { "repository.container_id": containerId, "repository.model_name": name }
              }))

          const batchSet = (items: NonEmptyReadonlyArray<PM>) => {
            return Effect
              .suspend(() => {
                const batch = [...items].map(
                  (x) =>
                    [
                      x,
                      Option.match(Option.fromNullable(x._etag), {
                        onNone: () => ({
                          operationType: "Create" as const,
                          resourceBody: {
                            ...Struct.omit(x, "_etag"),
                            _partitionKey: config?.partitionValue(x)
                          }
                        }),
                        onSome: (eTag) => ({
                          operationType: "Replace" as const,
                          id: x.id,
                          resourceBody: {
                            ...Struct.omit(x, "_etag"),
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
                  .pipe(Effect.flatMap((x) =>
                    Effect.gen(function*() {
                      const result = x.result ?? []
                      const firstFailed = result.find(
                        (x: any) => x.statusCode > 299 || x.statusCode < 200
                      )
                      if (firstFailed) {
                        const code = firstFailed.statusCode ?? 0
                        if (code === 412 || code === 404) {
                          return yield* new OptimisticConcurrencyException({ type: name, id: "batch" })
                        }

                        return yield* Effect.die(
                          new CosmosDbOperationError("not able to update record: " + code)
                        )
                      }

                      return batch.map(([e], i) => ({
                        ...e,
                        _etag: result[i]?.eTag
                      })) as unknown as NonEmptyReadonlyArray<Encoded>
                    })
                  ))
              })
              .pipe(Effect
                .withSpan("Cosmos.batchSet [effect-app/infra/Store]", {
                  captureStackTrace: false,
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                }))
          }

          const s: Store<Encoded, Id> = {
            all: Effect
              .sync(() => ({
                query: `SELECT * FROM ${name} f WHERE f.id != @id`,
                parameters: [{ name: "@id", value: importedMarkerId }]
              }))
              .pipe(
                Effect.tap((q) => logQuery(q)),
                Effect.flatMap((q) =>
                  Effect.promise(() =>
                    container
                      .items
                      .query<PM>(q)
                      .fetchAll()
                      .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._ })))
                  )
                ),
                Effect
                  .withSpan("Cosmos.all [effect-app/infra/Store]", {
                    captureStackTrace: false,
                    attributes: { "repository.container_id": containerId, "repository.model_name": name }
                  })
              ),
            /**
             * May return duplicate results for "join_find", when matching more than once.
             */
            filter: <U extends keyof Encoded = never>(
              f: FilterArgs<Encoded, U>
            ) => {
              const skip = f?.skip
              const limit = f?.limit
              const filter = f.filter
              type M = U extends undefined ? Encoded : Pick<Encoded, U>
              return Effect
                .sync(() =>
                  buildWhereCosmosQuery3(
                    filter ?? [],
                    name,
                    importedMarkerId,
                    defaultValues,
                    f.select as NonEmptyReadonlyArray<string> | undefined,
                    f.order as NonEmptyReadonlyArray<{ key: string; direction: "ASC" | "DESC" }> | undefined,
                    skip,
                    limit
                  )
                )
                .pipe(
                  Effect.tap((q) => logQuery(q)),
                  Effect
                    .flatMap((q) =>
                      Effect.promise(() =>
                        f.select
                          ? container
                            .items
                            .query<M>(q)
                            .fetchAll()
                            .then(({ resources }) =>
                              resources.map((_) => ({ ...pipe(defaultValues, Struct.pick(...f.select!)), ..._ }))
                            )
                          : container
                            .items
                            .query<{ f: M }>(q)
                            .fetchAll()
                            .then(({ resources }) => resources.map((_) => ({ ...defaultValues, ..._.f })))
                      )
                    )
                )
                .pipe(Effect.withSpan("Cosmos.filter [effect-app/infra/Store]", {
                  captureStackTrace: false,
                  attributes: { "repository.container_id": containerId, "repository.model_name": name }
                }))
            },
            find: (id) =>
              Effect
                .promise(() =>
                  container
                    .item(id, config?.partitionValue({ id } as Encoded))
                    .read<Encoded>()
                    .then(({ resource }) =>
                      Option.fromNullable(resource).pipe(Option.map((_) => ({ ...defaultValues, ..._ })))
                    )
                )
                .pipe(Effect
                  .withSpan("Cosmos.find [effect-app/infra/Store]", {
                    captureStackTrace: false,
                    attributes: { "repository.container_id": containerId, "repository.model_name": name }
                  })),
            set: (e) =>
              Option
                .match(
                  Option
                    .fromNullable(e._etag),
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
                .pipe(
                  Effect
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
                    }),
                  Effect
                    .withSpan("Cosmos.set [effect-app/infra/Store]", {
                      captureStackTrace: false,
                      attributes: { "repository.container_id": containerId, "repository.model_name": name }
                    })
                ),
            batchSet,
            bulkSet,
            remove: (e: Encoded) =>
              Effect
                .promise(() => container.item(e.id, config?.partitionValue(e)).delete())
                .pipe(Effect
                  .withSpan("Cosmos.remove [effect-app/infra/Store]", {
                    captureStackTrace: false,
                    attributes: { "repository.container_id": containerId, "repository.model_name": name }
                  }))
          }

          // handle mock data
          const marker = yield* Effect.promise(() =>
            container
              .item(importedMarkerId, importedMarkerId)
              .read<{ id: string }>()
              .then(({ resource }) => Option.fromNullable(resource))
          )

          if (!Option.isSome(marker)) {
            yield* InfraLogger.logInfo("Creating mock data for " + name)
            if (seed) {
              const m = yield* seed
              yield* Effect.flatMapOption(
                Effect.succeed(toNonEmptyArray([...m])),
                (a) =>
                  s.bulkSet(a).pipe(
                    Effect.orDie,
                    Effect
                      // we delay extra here, so that initial creation between Companies/POs also have an interval between them.
                      .delay(Duration.millis(1100))
                  )
              )
            }
            // Mark as imported
            yield* Effect.promise(() =>
              container.items.create({
                _partitionKey: importedMarkerId,
                id: importedMarkerId,
                ttl: -1
              })
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
    .pipe(Layer.provide(CosmosClientLayer(Secret.value(cfg.url), cfg.dbName)))
}
