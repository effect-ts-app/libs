/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

// import type { ParserEnv } from "effect-app/Schema/custom/Parser"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import type { Context, NonEmptyReadonlyArray, S } from "effect-app"
import { Effect } from "effect-app"
import type { StoreConfig, StoreMaker } from "../../Store.js"
import type { ExtendedRepository } from "./ext.js"
import { extendRepo } from "./ext.js"
import { makeRepoInternal } from "./internal/internal.js"

export interface RepositoryOptions<
  IdKey extends keyof T,
  Encoded extends {
    id: string
  },
  T,
  Evt = never,
  RPublish = never,
  E = never,
  RInitial = never,
  RCtx = never
> {
  /**
   * Specify the idKey of the Type side, if it's different from the default "id".
   * Does not change the Encoded side, which is always "id" to support database drivers.
   * At this time as queries are operating on the Encoded side, the queries must still specify "id" regardless.
   */
  idKey: IdKey
  /**
   * just in time Migration: for complex migrations that aren't just default simple values
   * use the config.defaultValues instead for simple default values
   */
  jitM?: (pm: Encoded) => Encoded
  config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
    partitionValue?: (a: Encoded) => string
  }
  /**
   * Optional handler to be able to publish events after successfull save.
   */
  publishEvents?: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, RPublish>
  /**
   * Optional creator for initial data in the table when it's created for the first itme.
   */
  makeInitial?: Effect<readonly T[], E, RInitial>
  /**
   * Optional context to be provided to Schema decode/encode.
   * Useful for effectful transformations like XWithItems, where items is a transformation retrieving elements from another database table or other source.
   */
  schemaContext?: Context.Context<RCtx>
}

/**
 * Create a repository instance.
 * @param itemType an identifier used for the table name and e.g NotFoundError
 * @param schema the Schema used for this Repository
 * @param options @see RepositoryOptions
 * @returns a Repository
 */
export const makeRepo: {
  <
    ItemType extends string,
    RSchema,
    Encoded extends { id: string },
    T,
    IdKey extends keyof T,
    E = never,
    Evt = never,
    RInitial = never,
    RPublish = never,
    RCtx = never
  >(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, RSchema>,
    options: RepositoryOptions<IdKey, Encoded, T, Evt, RPublish, E, RInitial, RCtx>
  ): Effect.Effect<
    ExtendedRepository<T, Encoded, Evt, ItemType, IdKey, Exclude<RSchema, RCtx>, RPublish>,
    E,
    RInitial | StoreMaker
  >
  <
    ItemType extends string,
    RSchema,
    Encoded extends { id: string },
    T extends { id: unknown },
    E = never,
    Evt = never,
    RInitial = never,
    RPublish = never,
    RCtx = never
  >(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, RSchema>,
    options: Omit<RepositoryOptions<"id", Encoded, T, Evt, RPublish, E, RInitial, RCtx>, "idKey">
  ): Effect.Effect<
    ExtendedRepository<T, Encoded, Evt, ItemType, "id", Exclude<RSchema, RCtx>, RPublish>,
    E,
    RInitial | StoreMaker
  >
} = <
  ItemType extends string,
  R,
  Encoded extends { id: string },
  T,
  IdKey extends keyof T,
  E = never,
  RInitial = never,
  RPublish = never,
  Evt = never,
  RCtx = never
>(
  itemType: ItemType,
  schema: S.Schema<T, Encoded, R>,
  options: Omit<RepositoryOptions<IdKey, Encoded, T, Evt, RPublish, E, RInitial, RCtx>, "idKey"> & { idKey?: IdKey }
) =>
  Effect.gen(function*() {
    const mkRepo = makeRepoInternal<Evt>()(
      itemType,
      schema,
      options?.jitM ? (pm) => options.jitM!(pm) : (pm) => pm,
      (e, _etag) => ({ ...e, _etag }),
      options.idKey ?? "id" as any
    )
    const r = yield* mkRepo.make<RInitial, E, RPublish, RCtx>(options as any)
    const repo = extendRepo(r)
    return repo
  })
