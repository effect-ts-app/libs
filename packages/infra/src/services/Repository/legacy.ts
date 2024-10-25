/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NonEmptyReadonlyArray, Option, ParseResult, S } from "effect-app"
import { Context, Effect, Layer } from "effect-app"
import type { InvalidStateError, NotFoundError, OptimisticConcurrencyException } from "effect-app/client"
import type { FixEnv, PureEnv } from "effect-app/Pure"
import type { NonNegativeInt } from "effect-app/Schema"
import type { FieldValues } from "../../filter/types.js"
import * as Q from "../query.js"
import type { Repos } from "../RepositoryBase.js"
import { makeRepoInternal } from "../RepositoryBase.js"
import type { StoreConfig, StoreMaker } from "../Store.js"
import { type ExtendedRepository, extendRepo } from "./ext.js"
import type { RefineTHelper, Repository } from "./service.js"

const names = new Map<string, number>()
const registerName = (name: string) => {
  const existing = names.get(name)
  if (existing === undefined) {
    names.set(name, 1)
    return name
  } else {
    const n = existing + 1
    names.set(name, n)
    return name + "-" + existing
  }
}

/**
 * @deprecated
 */
export interface RepoFunctions<
  T,
  Encoded extends { id: string },
  Evt,
  ItemType,
  RPublish,
  IdKey extends keyof T,
  Service
> {
  itemType: ItemType
  T: T
  all: Effect<readonly T[], never, Service>
  find: (id: T[IdKey]) => Effect<Option<T>, never, Service>
  removeById: (id: T[IdKey]) => Effect<void, NotFoundError<ItemType>, Service>
  saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException, RPublish | Service>
  removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, never, Service>
  save: (...items: T[]) => Effect<void, InvalidStateError | OptimisticConcurrencyException, Service>
  get: (id: T[IdKey]) => Effect<T, NotFoundError<ItemType>, RPublish | Service>
  queryAndSavePure: {
    <A, E2, R2, T2 extends T>(
      q: (
        q: Q.Query<Encoded>
      ) => Q.QueryEnd<Encoded, "one">,
      pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | NotFoundError<ItemType> | E2,
      | Service
      | RPublish
      | Exclude<R2, {
        env: PureEnv<Evt, T, T2>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Q.Query<Encoded>
      ) =>
        | Q.Query<Encoded>
        | Q.QueryWhere<Encoded>
        | Q.QueryEnd<Encoded, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E2,
      | Service
      | RPublish
      | Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Q.Query<Encoded>
      ) =>
        | Q.Query<Encoded>
        | Q.QueryWhere<Encoded>
        | Q.QueryEnd<Encoded, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
      batch: "batched" | number
    ): Effect.Effect<
      A[],
      InvalidStateError | OptimisticConcurrencyException | E2,
      | Service
      | RPublish
      | Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
  }
  readonly query: {
    <A, R, From extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Q.Query<Encoded>
      ) => Q.QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      RPublish | R | Service
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded
    >(
      q: (
        initial: Q.Query<Encoded>
      ) => Q.QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      RPublish | R | Service
    >
  }
  byIdAndSaveWithPure: {
    <R, A, E, S2 extends T>(
      id: T[IdKey],
      pure: Effect<A, E, FixEnv<R, Evt, T, S2>>
    ): Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E | NotFoundError<ItemType>,
      | Service
      | RPublish
      | Exclude<R, {
        env: PureEnv<Evt, T, S2>
      }>
    >
  }
  saveManyWithPure: {
    <R, A, E, S1 extends T, S2 extends T>(
      items: Iterable<S1>,
      pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E,
      | RPublish
      | Exclude<R, {
        env: PureEnv<Evt, readonly S1[], readonly S2[]>
      }>
    >
    <R, A, E, S1 extends T, S2 extends T>(
      items: Iterable<S1>,
      pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>,
      batch: "batched" | number
    ): Effect.Effect<
      A[],
      InvalidStateError | OptimisticConcurrencyException | E,
      | RPublish
      | Exclude<R, {
        env: PureEnv<Evt, readonly S1[], readonly S2[]>
      }>
    >
  }
  /** @experimental */
  mapped: MM<Service, Encoded>
  use: <X>(
    body: (_: Service) => X
  ) => X extends Effect<infer A, infer E, infer R> ? Effect<A, E, R | Service> : Effect<X, never, Service>
}

/**
 * @deprecated
 */
const makeRepoFunctions = (tag: any, itemType: any) => {
  const { all } = Effect.serviceConstants(tag) as any
  const {
    byIdAndSaveWithPure,
    find,
    get,
    query,
    queryAndSavePure,
    removeAndPublish,
    removeById,
    save,
    saveAndPublish,
    saveManyWithPure
  } = Effect.serviceFunctions(tag) as any
  const mapped = (s: any) => Effect.map(tag, (_: any) => _.mapped(s))
  return {
    itemType,
    all,
    byIdAndSaveWithPure,
    find,
    removeById,
    saveAndPublish,
    removeAndPublish,
    save,
    get,
    query,
    mapped,
    queryAndSavePure,
    saveManyWithPure,
    use: (body: any) => Effect.andThen(tag, body)
  }
}

/** @deprecated use makeRepo/extendRepo */
export class RepositoryBase<
  T,
  Encoded extends { id: string },
  Evt,
  ItemType extends string,
  Ext,
  IdKey extends keyof T,
  RSchema,
  RPublish
> implements ExtendedRepository<T, Encoded, Evt, ItemType, IdKey, RSchema, RPublish> {
  constructor(protected readonly impl: ExtendedRepository<T, Encoded, Evt, ItemType, IdKey, RSchema, RPublish> & Ext) {
    this.saveAndPublish = this.impl.saveAndPublish
    this.removeAndPublish = this.impl.removeAndPublish
    this.find = this.impl.find
    this.all = this.impl.all
    this.changeFeed = this.impl.changeFeed
    this.mapped = this.impl.mapped
    this.query = this.impl.query
    this.get = this.impl.get
    this.itemType = this.impl.itemType
    this.idKey = this.impl.idKey
    this.log = this.impl.log
    this.removeById = this.impl.removeById
    this.save = this.impl.save
    this.saveWithEvents = this.impl.saveWithEvents
    this.queryAndSavePure = this.impl.queryAndSavePure
    this.saveManyWithPure = this.impl.saveManyWithPure
    this.byIdAndSaveWithPure = this.impl.byIdAndSaveWithPure
    this.saveWithPure = this.impl.saveWithPure
    this.request = this.impl.request
  }
  get: (id: T[IdKey]) => Effect<T, NotFoundError<ItemType>, RSchema>
  idKey
  request
  itemType
  saveAndPublish
  removeAndPublish
  find
  all
  changeFeed
  mapped
  query
  log
  removeById
  save
  saveWithEvents
  queryAndSavePure
  saveManyWithPure
  byIdAndSaveWithPure
  saveWithPure
}

export const RepositoryDefaultImpl2 = <Service, Evt = never>() => {
  const f: {
    <
      ItemType extends string,
      RSchema,
      Encoded extends { id: string },
      T,
      IdKey extends keyof T,
      E = never,
      RInitial = never,
      RPublish = never,
      Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
      E1 = never,
      R1 = never,
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      Ext = {}
    >(
      itemType: ItemType,
      schema: S.Schema<T, Encoded, RSchema>,
      options: [Evt] extends [never] ? {
          dependencies?: Layers
          idKey: IdKey
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
          }
          jitM?: (pm: Encoded) => Encoded
          options?: Effect<
            {
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
        : {
          dependencies?: Layers
          idKey: IdKey
          jitM?: (pm: Encoded) => Encoded
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
          }
          options?: Effect<
            {
              publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, RPublish>
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
    ):
      & (abstract new(
        impl: Repository<T, Encoded, Evt, ItemType, IdKey, RSchema, RPublish> & Ext
      ) => RepositoryBase<T, Encoded, Evt, ItemType, Ext, IdKey, RSchema, RPublish>)
      & Context.Tag<Service, Service>
      & RepoFunctions<T, Encoded, Evt, ItemType, RPublish, IdKey, Service>
      & {
        Default: Layer.Layer<
          Service,
          E | E1 | Layer.Layer.Error<Layers[number]>,
          Exclude<
            R1 | StoreMaker,
            { [k in keyof Layers]: Layer.Layer.Success<Layers[k]> }[number]
          >
        >
        DefaultWithoutDependencies: Layer.Layer<
          Service,
          E1,
          R1 | StoreMaker
        >
      }
      & Repos<
        T,
        Encoded,
        RSchema,
        Evt,
        ItemType,
        IdKey,
        RPublish
      >
    <
      ItemType extends string,
      RSchema,
      Encoded extends { id: string },
      T extends { id: unknown },
      E = never,
      RInitial = never,
      RPublish = never,
      Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
      E1 = never,
      R1 = never,
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      Ext = {}
    >(
      itemType: ItemType,
      schema: S.Schema<T, Encoded, RSchema>,
      options: [Evt] extends [never] ? {
          dependencies?: Layers
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
          }
          jitM?: (pm: Encoded) => Encoded
          options?: Effect<
            {
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
        : {
          dependencies?: Layers
          jitM?: (pm: Encoded) => Encoded
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
          }
          options?: Effect<
            {
              publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, RPublish>
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
    ):
      & (abstract new(
        impl: Repository<T, Encoded, Evt, ItemType, "id", RSchema, RPublish> & Ext
      ) => RepositoryBase<T, Encoded, Evt, ItemType, Ext, "id", RSchema, RPublish>)
      & Context.Tag<Service, Service>
      & RepoFunctions<T, Encoded, Evt, ItemType, RPublish, "id", Service>
      & {
        Default: Layer.Layer<
          Service,
          E | E1 | Layer.Layer.Error<Layers[number]>,
          Exclude<
            R1 | StoreMaker,
            { [k in keyof Layers]: Layer.Layer.Success<Layers[k]> }[number]
          >
        >
        DefaultWithoutDependencies: Layer.Layer<
          Service,
          E1,
          R1 | StoreMaker
        >
      }
      & Repos<
        T,
        Encoded,
        RSchema,
        Evt,
        ItemType,
        "id",
        RPublish
      >
  } = <
    ItemType extends string,
    RSchema,
    Encoded extends { id: string },
    T,
    IdKey extends keyof T,
    E = never,
    RInitial = never,
    RPublish = never,
    Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
    E1 = never,
    R1 = never,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Ext = {}
  >(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, RSchema>,
    options: [Evt] extends [never] ? {
        dependencies?: Layers
        idKey?: IdKey
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
        jitM?: (pm: Encoded) => Encoded
        options?: Effect<
          {
            makeInitial?: Effect<readonly T[], E, RInitial>
            ext?: Ext
          },
          E1,
          R1
        >
      }
      : {
        dependencies?: Layers
        idKey?: IdKey
        jitM?: (pm: Encoded) => Encoded
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
        options?: Effect<
          {
            publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, RPublish>
            makeInitial?: Effect<readonly T[], E, RInitial>
            ext?: Ext
          },
          E1,
          R1
        >
      }
  ) => {
    let layerCache = undefined
    let layerCache2 = undefined
    abstract class Cls extends RepositoryBase<
      T,
      Encoded,
      Evt,
      ItemType,
      Ext,
      IdKey,
      RSchema,
      RPublish
    > {
      static readonly Q = Q.make<Encoded>()
      static get DefaultWithoutDependencies() {
        const self = this as any
        return layerCache ??= Effect
          .gen(function*() {
            const opts = yield* options.options ?? Effect.succeed({})
            const mkRepo = makeRepoInternal<Evt>()(
              itemType,
              schema,
              options?.jitM ? (pm) => options.jitM!(pm) : (pm) => pm,
              (e, _etag) => ({ ...e, _etag }),
              options.idKey ?? "id" as any
            )
            const r = yield* mkRepo.make({ ...options, ...opts } as any)
            const repo = new self(Object.assign(extendRepo(r), "ext" in opts ? opts.ext : {}))
            return Layer.succeed(self, repo)
          })
          .pipe(Layer.unwrapEffect)
      }
      static get Default() {
        const self = this as any
        return layerCache2 ??= options.dependencies
          ? self
            .DefaultWithoutDependencies
            .pipe(Layer.provide(options.dependencies as any))
          : self.DefaultWithoutDependencies
      }
    }
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    // TODO: actual class name or expect a string identifier - careful with overlapping between modules
    return Context.assignTag<Service>(registerName(itemType + "Repo"), creationError)(
      Object.assign(Cls, makeRepoFunctions(Cls, itemType))
    ) as any // impl is missing, but its marked protected
  }

  return f
}

export interface Mapped1<A, IdKey extends keyof A, R> {
  all: Effect<A[], ParseResult.ParseError, R>
  save: (...xes: readonly A[]) => Effect<void, OptimisticConcurrencyException | ParseResult.ParseError, R>
  find: (id: A[IdKey]) => Effect<Option<A>, ParseResult.ParseError, R>
}

// TODO: auto use project, and select fields from the From side of schema only
export interface Mapped2<A, R> {
  all: Effect<A[], ParseResult.ParseError, R>
}

export interface Mapped<Encoded extends { id: string }> {
  <A, R, IdKey extends keyof A>(schema: S.Schema<A, Encoded, R>): Mapped1<A, IdKey, R>
  // TODO: constrain on Encoded2 having to contain only fields that fit Encoded
  <A, Encoded2, R>(schema: S.Schema<A, Encoded2, R>): Mapped2<A, R>
}

export interface MM<Repo, Encoded extends { id: string }> {
  <A, R, IdKey extends keyof A>(schema: S.Schema<A, Encoded, R>): Effect<Mapped1<A, IdKey, R>, never, Repo>
  // TODO: constrain on Encoded2 having to contain only fields that fit Encoded
  <A, Encoded2, R>(schema: S.Schema<A, Encoded2, R>): Effect<Mapped2<A, R>, never, Repo>
}
