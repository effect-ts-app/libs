/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import type { Repository } from "./Repository.js"
import { StoreMaker } from "./Store.js"
import type { Filter, StoreConfig, Where } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import type { Opt } from "@effect-app/core/Option"
import { makeCodec } from "@effect-app/infra/api/codec"
import { makeFilters } from "@effect-app/infra/filter"
import type { Schema } from "@effect-app/prelude"
import { EParserFor } from "@effect-app/prelude/schema"
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"

export abstract class RepositoryBaseC<
  T extends { id: string },
  PM extends { id: string },
  Evt,
  ItemType extends string
> implements Repository<T, PM, Evt, ItemType> {
  abstract readonly itemType: ItemType
  abstract readonly find: (id: T["id"]) => Effect<never, never, Opt<T>>
  abstract readonly all: Effect<never, never, T[]>
  abstract readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<never, InvalidStateError | OptimisticConcurrencyException, void>
  abstract readonly utils: {
    mapReverse: (
      pm: PM,
      setEtag: (id: string, eTag: string | undefined) => void
    ) => unknown // TODO
    parse: (a: unknown, env?: ParserEnv | undefined) => T
    all: Effect<never, never, PM[]>
    filter: (filter: Filter<PM>, cursor?: { limit?: number; skip?: number }) => Effect<never, never, PM[]>
  }
  abstract readonly changeFeed: PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<never, never, void>
}

/**
 * A base for creating an abstract class usable as Tag, Companion and interface to create your own implementation.
 */
export const RepositoryBase = <Service>() => {
  return <T extends { id: string }, PM extends { id: string; _etag: string | undefined }, Evt, ItemType extends string>(
    itemType: ItemType
  ) => {
    abstract class C extends RepositoryBaseC<T, PM, Evt, ItemType> {
      readonly itemType: ItemType = itemType
      static readonly where = makeWhere<PM>()
      static flatMap<R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>): Effect<Service | R1, E1, B> {
        return Effect.flatMap(this as unknown as Tag<Service, Service>, f)
      }
      static map<B>(f: (a: Service) => B): Effect<Service, never, B> {
        return Effect.map(this as unknown as Tag<Service, Service>, f)
      }
      static makeLayer(svc: Service) {
        return Layer.succeed(this as unknown as Tag<Service, Service>, svc)
      }
    }
    return assignTag<Service>()(C)
  }
}

/**
 * A base implementation to create a repository.
 */
export function makeRepo<
  PM extends { id: string; _etag: string | undefined },
  Evt = unknown
>() {
  return <
    ItemType extends string,
    T extends { id: string },
    ConstructorInput,
    Api,
    Encoded extends { id: string }
  >(
    name: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, Encoded, Api>,
    mapFrom: (pm: Omit<PM, "_etag">) => Encoded,
    mapTo: (e: Encoded, etag: string | undefined) => PM
  ) => {
    const where = makeWhere<PM>()

    function mapToPersistenceModel(
      e: Encoded,
      getEtag: (id: string) => string | undefined
    ): PM {
      return mapTo(e, getEtag(e.id))
    }

    function mapReverse(
      { _etag, ...e }: PM,
      setEtag: (id: string, eTag: string | undefined) => void
    ): Encoded {
      setEtag(e.id, _etag)
      return mapFrom(e)
    }

    const mkStore = makeStore<PM>()(name, schema, mapTo)

    function make<R = never, E = never, R2 = never>(
      args: [Evt] extends [object] ? {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
          makeInitial?: Effect<R, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
        : {
          makeInitial?: Effect<R, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
    ) {
      return Do(($) => {
        const store = $(mkStore(args.makeInitial, args.config))
        const cms = $(ContextMapContainer)
        const pubCfg = $(Effect.context<R2>())
        const pub = "publishEvents" in args ? flow(args.publishEvents, (_) => _.provide(pubCfg)) : () => Effect.unit
        const changeFeed = $(PubSub.unbounded<[T[], "save" | "remove"]>())

        const allE = store.all.flatMap((items) =>
          Do(($) => {
            const { set } = $(cms.get)
            return items.map((_) => mapReverse(_, set))
          })
        )

        const parse = EParserFor(schema).condemnDie

        const all = allE.flatMap((_) => _.forEachEffect((_) => parse(_)))

        function findE(id: T["id"]) {
          return store
            .find(id)
            .flatMap((items) =>
              Do(($) => {
                const { set } = $(cms.get)
                return items.map((_) => mapReverse(_, set))
              })
            )
        }

        function find(id: T["id"]) {
          return findE(id).flatMapOpt(EParserFor(schema).condemnDie)
        }

        const saveAllE = (a: Iterable<Encoded>) =>
          Effect(a.toNonEmptyArray)
            .flatMapOpt((a) =>
              Do(($) => {
                const { get, set } = $(cms.get)
                const items = a.mapNonEmpty((_) => mapToPersistenceModel(_, get))
                const ret = $(store.batchSet(items))
                ret.forEach((_) => set(_.id, _._etag))
              })
            )
        const encode = Encoder.for(schema)

        const saveAll = (a: Iterable<T>) => saveAllE(a.toChunk.map(encode))

        const saveAndPublish = (items: Iterable<T>, events: Iterable<Evt> = []) => {
          const it = items.toChunk
          return saveAll(it)
            > Effect(events.toNonEmptyArray)
              // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
              .flatMapOpt(pub)
            > changeFeed.publish([it.toArray, "save"])
        }

        function removeAndPublish(a: Iterable<T>, events: Iterable<Evt> = []) {
          return Effect.gen(function*($) {
            const { get, set } = yield* $(cms.get)
            const it = a.toChunk
            const items = it.map(encode)
            // TODO: we should have a batchRemove on store so the adapter can actually batch...
            for (const e of items) {
              yield* $(store.remove(mapToPersistenceModel(e, get)))
              set(e.id, undefined)
            }
            yield* $(
              Effect(events.toNonEmptyArray)
                // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
                .flatMapOpt(pub)
            )

            yield* $(changeFeed.publish([it.toArray, "remove"]))
          })
        }

        const r: Repository<T, PM, Evt, ItemType> = {
          /**
           * @internal
           */
          utils: {
            mapReverse,
            parse: Parser.for(schema).unsafe,
            filter: store
              .filter
              .flow((_) => _.tap((items) => cms.get.map(({ set }) => items.forEach((_) => set(_.id, _._etag))))),
            all: store.all.tap((items) => cms.get.map(({ set }) => items.forEach((_) => set(_.id, _._etag))))
          },
          changeFeed,
          itemType: name,
          find,
          all,
          saveAndPublish,
          removeAndPublish
        }
        return r
      })
        .withSpan("Repository.make [effect-app/infra]", { attributes: { modelName: name } })
        .withLogSpan("Repository.make: " + name)
    }

    return {
      make,
      where
    }
  }
}

/**
 * only use this as a shortcut if you don't have the item already
 * @tsplus fluent Repository removeById
 */
export function removeById<
  T extends { id: string },
  PM extends { id: string },
  Evt,
  ItemType extends string
>(
  self: Repository<T, PM, Evt, ItemType>,
  id: T["id"]
) {
  return self.get(id).flatMap((_) => self.removeAndPublish([_]))
}

export function makeWhere<PM extends { id: string; _etag: string | undefined }>() {
  const f_ = makeFilters<PM>()
  type WhereFilter = typeof f_

  function makeFilter_(filter: (f: WhereFilter) => Filter<PM>) {
    return filter(f_)
  }

  function where(
    makeWhere: (
      f: WhereFilter
    ) => Where | readonly [Where, ...Where[]],
    mode?: "or" | "and"
  ) {
    return makeFilter_((f) => {
      const m = makeWhere ? makeWhere(f) : []
      return ({
        mode,
        where: (Array.isArray(m) ? m as unknown as [Where, ...Where[]] : [m]) as readonly [Where, ...Where[]]
      })
    })
  }
  return where
}

const pluralize = (s: string) =>
  s.endsWith("s")
    ? s + "es"
    : s.endsWith("y")
    ? s.substring(0, s.length - 1) + "ies"
    : s + "s"

export function makeStore<
  PM extends { id: string; _etag: string | undefined }
>() {
  return <
    ItemType extends string,
    T extends { id: string },
    ConstructorInput,
    Api,
    E extends { id: string }
  >(
    name: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, E, Api>,
    mapTo: (e: E, etag: string | undefined) => PM
  ) => {
    const [_dec, encode] = makeCodec(schema)
    function encodeToPM() {
      const getEtag = () => undefined
      return flow(encode, (v) => mapToPersistenceModel(v, getEtag))
    }

    function mapToPersistenceModel(
      e: E,
      getEtag: (id: string) => string | undefined
    ): PM {
      return mapTo(e, getEtag(e.id))
    }

    function makeStore<R = never, E = never>(
      makeInitial?: Effect<R, E, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ) {
      return Do(($) => {
        const { make } = $(StoreMaker)

        const store = $(
          make<PM, string, R, E>(
            pluralize(name),
            makeInitial
              ? (makeInitial
                .map((_) => _.map(encodeToPM())))
                .withSpan("Repository.makeInitial [effect-app/infra]")
              : undefined,
            {
              ...config,
              partitionValue: config?.partitionValue
                ?? ((_) => "primary") /*(isIntegrationEvent(r) ? r.companyId : r.id*/
            }
          )
        )
        return store
      })
    }

    return makeStore
  }
}

export const RepositoryBaseImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = unknown
  >() =>
  <ItemType extends string, T extends { id: string }, ConstructorInput, Api, E extends { id: string }>(
    itemType: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, E, Api>,
    mapFrom: (pm: Omit<PM, "_etag">) => E,
    mapTo: (e: E, etag: string | undefined) => PM
  ): (abstract new() => Repository<T, PM, Evt, ItemType>) & Tag<Service, Service> & {
    make<R = never, E = never, R2 = never>(
      args: [Evt] extends [object] ? {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
          makeInitial?: Effect<R, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
        : {
          makeInitial?: Effect<R, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
    ): Effect<
      StoreMaker | ContextMapContainer | R | R2,
      E,
      Repository<T, PM, Evt, ItemType> & {
        readonly itemType: ItemType
      }
    >
    where: ReturnType<typeof makeWhere<PM>>
    flatMap: <R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>) => Effect<Service | R1, E1, B>
    makeLayer: (svc: Service) => Layer<never, never, Service>
    map: <B>(f: (a: Service) => B) => Effect<Service, never, B>
  } => {
    const mkRepo = makeRepo<PM, Evt>()(itemType, schema, mapFrom, mapTo)
    abstract class Cls extends RepositoryBase<Service>()<T, PM, Evt, ItemType>(itemType) {
      static readonly make = mkRepo.make
    }
    return Cls
  }
}

export const RepositoryDefaultImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = unknown
  >() =>
  <ItemType extends string, T extends { id: string }, ConstructorInput, Api, E extends { id: string }>(
    itemType: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, E, Api>,
    mapFrom: (pm: Omit<PM, "_etag">) => E,
    mapTo: (e: E, etag: string | undefined) => PM
  ):
    & Tag<Service, Service>
    & {
      new(
        impl: Repository<T, PM, Evt, ItemType>
      ): Repository<T, PM, Evt, ItemType>

      where: ReturnType<typeof makeWhere<PM>>
      flatMap: <R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>) => Effect<Service | R1, E1, B>
      makeLayer: (svc: Service) => Layer<never, never, Service>
      map: <B>(f: (a: Service) => B) => Effect<Service, never, B>
      repo: Repository<T, PM, Evt, ItemType> // just a helper to type the constructor
    }
    & ([Evt] extends [object] ? {
        make<R = never, E = never, R2 = never>(
          args: {
            publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
        ): Effect<StoreMaker | R | R2, E, Repository<T, PM, Evt, ItemType>>

        toLayer<R = never, E = never, R2 = never>(
          args: {
            publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
        ): Layer<StoreMaker | R | R2, E, Service>
      }
      : {
        make<R = never, E = never>(
          args: {
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
        ): Effect<StoreMaker | R, E, Repository<T, PM, Evt, ItemType>>
        toLayer<R = never, E = never>(
          args: {
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
        ): Layer<StoreMaker | R, E, Service>
      }) =>
  {
    const cls = class extends RepositoryBaseImpl<Service>()<PM, Evt>()(itemType, schema, mapFrom, mapTo) {
      static toLayer<R = never, E = never, R2 = never>(
        args: [Evt] extends [object] ? {
            publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
          : {
            makeInitial?: Effect<R, E, readonly T[]>
            config?: Omit<StoreConfig<PM>, "partitionValue"> & {
              partitionValue?: (a: PM) => string
            }
          }
      ) {
        return this
          .make(args)
          .map((impl) => new this(impl) as any as Service)
          .toLayer(this)
      }
      static repo: any
      readonly #impl: Repository<T, PM, Evt, ItemType>
      constructor(
        impl: Repository<T, PM, Evt, ItemType>
      ) {
        super()
        this.#impl = impl
        Object.assign(this, impl)
      }
      // to make super calls work
      override get saveAndPublish() {
        return this.#impl.saveAndPublish
      }
      override get removeAndPublish() {
        return this.#impl.removeAndPublish
      }
      override get find() {
        return this.#impl.find
      }
      override get all() {
        return this.#impl.all
      }
      override get utils() {
        return this.#impl.utils
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cls as any // TODO: seems to be a compiler bug, it somehow says its missing toLayer and repo...
  }
}

useClassFeaturesForSchema
export class TestModel extends Model<TestModel>()({ id: string }) {}
