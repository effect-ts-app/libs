import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import type { Repository, RequestCTX } from "./Repository.js"
import type { RequestContextContainer } from "./RequestContextContainer.js"
import { ContextMap, StoreMaker } from "./Store.js"
import type { Filter, StoreConfig, Where } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import type { Opt } from "@effect-app/core/Option"
import { makeCodec } from "@effect-app/infra/api/codec"
import { makeFilters } from "@effect-app/infra/filter"
import type { Schema } from "@effect-app/prelude"
import { EParserFor } from "@effect-app/prelude/schema"
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"

/**
 * A base for creating an abstract class usable as Tag, Companion and interface to create your own implementation.
 */
export const RepositoryBase = <Service>() => {
  return <T extends { id: string }, PM extends { id: string; _etag: string | undefined }, Evt, ItemType extends string>(
    itemType: ItemType
  ) => {
    abstract class RepositoryBaseC implements Repository<T, PM, Evt, ItemType> {
      itemType: ItemType = itemType
      abstract find: (id: T["id"]) => Effect<ContextMap | RequestContextContainer, never, Opt<T>>
      abstract all: Effect<ContextMap, never, T[]>
      abstract saveAndPublish: (
        items: Iterable<T>,
        events?: Iterable<Evt>
      ) => Effect<ContextMap | RequestContextContainer, InvalidStateError | OptimisticConcurrencyException, void>
      abstract utils: {
        mapReverse: (
          pm: PM,
          setEtag: (id: string, eTag: string | undefined) => void
        ) => unknown // TODO
        parse: (a: unknown, env?: ParserEnv | undefined) => T
        all: Effect<ContextMap, never, PM[]>
        filter: (filter: Filter<PM>, cursor?: { limit?: number; skip?: number }) => Effect<ContextMap, never, PM[]>
      }
      abstract removeAndPublish: (
        items: Iterable<T>,
        events?: Iterable<Evt>
      ) => Effect<ContextMap | RequestContextContainer, never, void>
      static where = makeWhere<PM>()
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
    return assignTag<Service>()(RepositoryBaseC)
  }
}

/**
 * A base implementation to create a repository.
 */
export function makeRepo<
  PM extends { id: string; _etag: string | undefined },
  Evt = never
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
    mapFrom: (pm: Omit<PM, "_etag">) => E,
    mapTo: (e: E, etag: string | undefined) => PM
  ) => {
    const where = makeWhere<PM>()

    function mapToPersistenceModel(
      e: E,
      getEtag: (id: string) => string | undefined
    ): PM {
      return mapTo(e, getEtag(e.id))
    }

    function mapReverse(
      { _etag, ...e }: PM,
      setEtag: (id: string, eTag: string | undefined) => void
    ): E {
      setEtag(e.id, _etag)
      return mapFrom(e)
    }

    const mkStore = makeStore<PM>()(name, schema, mapTo)

    function make(
      publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<RequestCTX, never, void>,
      makeInitial?: Effect<never, never, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ) {
      return Do(($) => {
        const store = $(mkStore(makeInitial, config))

        const allE = store.all.flatMap((items) =>
          Do(($) => {
            const { set } = $(ContextMap)
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
                const { set } = $(ContextMap)
                return items.map((_) => mapReverse(_, set))
              })
            )
        }

        function find(id: T["id"]) {
          return findE(id).flatMapOpt(EParserFor(schema).condemnDie)
        }

        const saveAllE = (a: Iterable<E>) =>
          Effect(a.toNonEmptyArray)
            .flatMapOpt((a) =>
              Do(($) => {
                const { get, set } = $(ContextMap)
                const items = a.mapNonEmpty((_) => mapToPersistenceModel(_, get))
                const ret = $(store.batchSet(items))
                ret.forEach((_) => set(_.id, _._etag))
              })
            )
        const encode = Encoder.for(schema)

        const saveAll = (a: Iterable<T>) => saveAllE(a.toChunk.map(encode))

        const saveAndPublish = (items: Iterable<T>, events: Iterable<Evt> = []) =>
          saveAll(items)
            > Effect(events.toNonEmptyArray)
              // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
              .flatMapOpt(publishEvents)

        function removeAndPublish(a: Iterable<T>, events: Iterable<Evt> = []) {
          return Effect.gen(function*($) {
            const { get, set } = yield* $(ContextMap)
            const items = a.toChunk.map(encode)
            // TODO: we should have a batchRemove on store so the adapter can actually batch...
            for (const e of items) {
              yield* $(store.remove(mapToPersistenceModel(e, get)))
              set(e.id, undefined)
            }
            yield* $(
              Effect(events.toNonEmptyArray)
                // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
                .flatMapOpt(publishEvents)
            )
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
              .flow((_) => _.tap((items) => ContextMap.map(({ set }) => items.forEach((_) => set(_.id, _._etag))))),
            all: store.all.tap((items) => ContextMap.map(({ set }) => items.forEach((_) => set(_.id, _._etag))))
          },
          itemType: name,
          find,
          all,
          saveAndPublish,
          removeAndPublish
        }
        return r
      })
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

    function makeStore(
      makeInitial?: Effect<never, never, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ) {
      return Do(($) => {
        const { make } = $(StoreMaker)

        const store = $(
          make<PM, string>(
            pluralize(name),
            makeInitial
              ? makeInitial
                .map((_) => _.map(encodeToPM()))
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
    Evt = never
  >() =>
  <ItemType extends string, T extends { id: string }, ConstructorInput, Api, E extends { id: string }>(
    itemType: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, E, Api>,
    mapFrom: (pm: Omit<PM, "_etag">) => E,
    mapTo: (e: E, etag: string | undefined) => PM
  ): (abstract new() => Repository<T, PM, Evt, ItemType>) & Tag<Service, Service> & {
    make(
      publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<RequestCTX, never, void>,
      makeInitial?: Effect<never, never, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ): Effect<StoreMaker, never, Repository<T, PM, Evt, ItemType>>
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
    Evt = never
  >() =>
  <ItemType extends string, T extends { id: string }, ConstructorInput, Api, E extends { id: string }>(
    itemType: ItemType,
    schema: Schema.Schema<unknown, T, ConstructorInput, E, Api>,
    mapFrom: (pm: Omit<PM, "_etag">) => E,
    mapTo: (e: E, etag: string | undefined) => PM
  ): Tag<Service, Service> & {
    new(
      impl: Repository<T, PM, Evt, ItemType>
    ): Repository<T, PM, Evt, ItemType>
    make(
      publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<RequestCTX, never, void>,
      makeInitial?: Effect<never, never, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ): Effect<StoreMaker, never, Repository<T, PM, Evt, ItemType>>
    toLayer(
      publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<RequestCTX, never, void>,
      makeInitial?: Effect<never, never, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ): Layer<StoreMaker, never, Service>
    where: ReturnType<typeof makeWhere<PM>>
    flatMap: <R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>) => Effect<Service | R1, E1, B>
    makeLayer: (svc: Service) => Layer<never, never, Service>
    map: <B>(f: (a: Service) => B) => Effect<Service, never, B>
    repo: Repository<T, PM, Evt, ItemType> // just a helper to type the constructor
  } => {
    return class extends RepositoryBaseImpl<Service>()<PM, Evt>()(itemType, schema, mapFrom, mapTo) {
      static toLayer(
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<RequestCTX, never, void>,
        makeInitial?: Effect<never, never, readonly T[]>,
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      ) {
        return this.make(publishEvents, makeInitial, config).map((impl) => new this(impl) as any as Service).toLayer(
          this
        )
      }
      static repo: any
      constructor(
        impl: Repository<T, PM, Evt, ItemType>
      ) {
        super()
        Object.assign(this, impl)
      }
    } as any // TODO: seems to be a compiler bug, it somehow says its missing toLayer and repo...
  }
}
