/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NonEmptyReadonlyArray, Option, ParseResult, S } from "effect-app"
import { Context, Effect, Layer } from "effect-app"
import type { NotFoundError, OptimisticConcurrencyException } from "effect-app/client"
import * as Q from "../query.js"
import type { Repos } from "../RepositoryBase.js"
import { makeRepoInternal } from "../RepositoryBase.js"
import type { StoreConfig, StoreMaker } from "../Store.js"
import { type ExtendedRepository, extendRepo } from "./ext.js"
import type { Repository } from "./service.js"

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

/** @deprecated use makeRepo/extendRepo */
export class RepositoryBase<
  T,
  Encoded extends { id: string },
  Evt,
  ItemType extends string,
  Ext,
  IdKey extends keyof T,
  R
> implements ExtendedRepository<T, Encoded, Evt, ItemType, IdKey, R> {
  constructor(protected readonly impl: ExtendedRepository<T, Encoded, Evt, ItemType, IdKey, R> & Ext) {
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
  get: (id: T[IdKey]) => Effect<T, NotFoundError<ItemType>, R>
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
      R,
      Encoded extends { id: string },
      T,
      IdKey extends keyof T,
      E = never,
      RInitial = never,
      R2 = never,
      Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
      E1 = never,
      R1 = never,
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      Ext = {}
    >(
      itemType: ItemType,
      schema: S.Schema<T, Encoded, R>,
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
              publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
    ):
      & (abstract new(
        impl: Repository<T, Encoded, Evt, ItemType, IdKey, R> & Ext
      ) => RepositoryBase<T, Encoded, Evt, ItemType, Ext, IdKey, R>)
      & Context.Tag<Service, Service>
      & {
        Default: Layer.Layer<
          Service,
          E1 | Layer.Layer.Error<Layers[number]>,
          Exclude<
            R1 | R | StoreMaker,
            { [k in keyof Layers]: Layer.Layer.Success<Layers[k]> }[number]
          >
        >
        DefaultWithoutDependencies: Layer.Layer<
          Service,
          E1,
          R1 | R | StoreMaker
        >
      }
      & Repos<
        T,
        Encoded,
        R,
        Evt,
        ItemType,
        IdKey
      >
    <
      ItemType extends string,
      R,
      Encoded extends { id: string },
      T extends { id: unknown },
      E = never,
      RInitial = never,
      R2 = never,
      Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
      E1 = never,
      R1 = never,
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      Ext = {}
    >(
      itemType: ItemType,
      schema: S.Schema<T, Encoded, R>,
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
              publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
              makeInitial?: Effect<readonly T[], E, RInitial>
              ext?: Ext
            },
            E1,
            R1
          >
        }
    ):
      & (abstract new(
        impl: Repository<T, Encoded, Evt, ItemType, "id", R> & Ext
      ) => RepositoryBase<T, Encoded, Evt, ItemType, Ext, "id", R>)
      & Context.Tag<Service, Service>
      & {
        Default: Layer.Layer<
          Service,
          E1 | Layer.Layer.Error<Layers[number]>,
          Exclude<
            R1 | R | StoreMaker,
            { [k in keyof Layers]: Layer.Layer.Success<Layers[k]> }[number]
          >
        >
        DefaultWithoutDependencies: Layer.Layer<
          Service,
          E1,
          R1 | R | StoreMaker
        >
      }
      & Repos<
        T,
        Encoded,
        R,
        Evt,
        ItemType,
        "id"
      >
  } = <
    ItemType extends string,
    R,
    Encoded extends { id: string },
    T,
    IdKey extends keyof T,
    E = never,
    RInitial = never,
    R2 = never,
    Layers extends [Layer.Layer.Any, ...Layer.Layer.Any[]] = [Layer.Layer<never>],
    E1 = never,
    R1 = never,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Ext = {}
  >(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, R>,
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
            publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
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
      R
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
      static readonly type: Repository<T, Encoded, Evt, ItemType, IdKey, R> = undefined as any
    }
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    // TODO: actual class name or expect a string identifier - careful with overlapping between modules
    return Context.assignTag<Service>(registerName(itemType + "Repo"), creationError)(
      Cls
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
