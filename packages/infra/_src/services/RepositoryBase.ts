/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import type { Repository } from "./Repository.js"
import { StoreMaker } from "./Store.js"
import type { Filter, FilterArgs, FilterFunc, PersistenceModelType, StoreConfig, Where } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import type { Opt } from "@effect-app/core/Option"
import { makeCodec } from "@effect-app/infra/api/codec"
import { makeFilters } from "@effect-app/infra/filter"
import type { S } from "@effect-app/prelude"
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"
import { QueryBuilder } from "./Store/filterApi/query.js"

/**
 * @tsplus type Repository
 */
export abstract class RepositoryBaseC<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> {
  abstract readonly itemType: ItemType
  abstract readonly find: (id: T["id"]) => Effect<never, never, Opt<T>>
  abstract readonly all: Effect<never, never, T[]>
  abstract readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<never, InvalidStateError | OptimisticConcurrencyException, void>
  abstract readonly utils: {
    parseMany: (a: readonly PM[]) => Effect<never, never, readonly T[]>
    all: Effect<never, never, PM[]>
    filter: FilterFunc<PM>
    // count: (filter?: Filter<PM>) => Effect<never, never, PositiveInt>
  }
  abstract readonly changeFeed: PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<never, never, void>
}

export abstract class RepositoryBaseC1<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC<T, PM, Evt, ItemType> {
  constructor(
    public readonly itemType: ItemType
  ) {
    super()
  }
}

export class RepositoryBaseC2<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC1<T, PM, Evt, ItemType> {
  constructor(
    itemType: ItemType,
    protected readonly impl: Repository<T, PM, Evt, ItemType>
  ) {
    super(itemType)
  }
  // makes super calls a compiler error, as it should
  override saveAndPublish = this.impl.saveAndPublish
  override removeAndPublish = this.impl.removeAndPublish
  override find = this.impl.find
  override all = this.impl.all
  override utils = this.impl.utils
  override changeFeed = this.impl.changeFeed
}

type Exact<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false
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
    From extends { id: string }
  >(
    name: ItemType,
    schema: S.Schema<From, T>,
    mapFrom: (pm: Omit<PM, "_etag">) => From,
    mapTo: (e: From, etag: string | undefined) => PM
  ) => {
    const where = makeWhere<PM>()

    function mapToPersistenceModel(
      e: From,
      getEtag: (id: string) => string | undefined
    ): PM {
      return mapTo(e, getEtag(e.id))
    }

    function mapReverse(
      { _etag, ...e }: PM,
      setEtag: (id: string, eTag: string | undefined) => void
    ): From {
      setEtag(e.id, _etag)
      return mapFrom(e)
    }

    const mkStore = makeStore<PM>()(name, schema, mapTo)

    function make<R = never, E = never, R2 = never>(
      args: [Evt] extends [never] ? {
          makeInitial?: Effect<R, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
        : {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
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

        const parse = (e: From) => schema.parse(e).orDie

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
          return findE(id).flatMapOpt(parse)
        }

        const saveAllE = (a: Iterable<From>) =>
          Effect(a.toNonEmptyArray)
            .flatMapOpt((a) =>
              Do(($) => {
                const { get, set } = $(cms.get)
                const items = a.map((_) => mapToPersistenceModel(_, get))
                const ret = $(store.batchSet(items))
                ret.forEach((_) => set(_.id, _._etag))
              })
            )
        const encode = (i: T) => schema.encodeSync(i)

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

        const p = schema.parseSync

        const r: Repository<T, PM, Evt, ItemType> = {
          /**
           * @internal
           */
          utils: {
            parseMany: (items) => cms.get.map((cm) => items.map((_) => p(mapReverse(_, cm.set)))),
            filter: <U extends keyof PM = keyof PM>(args: FilterArgs<PM, U>) =>
              store
                .filter(args)
                .tap((items) =>
                  args.select
                    ? Effect.unit
                    : cms.get.map(({ set }) => items.forEach((_) => set((_ as PM).id, (_ as PM)._etag)))
                ),
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
        // .withSpan("Repository.make [effect-app/infra]", { attributes: { "repository.model_name": name } })
        .withLogSpan("Repository.make: " + name)
    }

    return {
      make,
      where,
      query: QueryBuilder.make<PM>()
    }
  }
}

/**
 * only use this as a shortcut if you don't have the item already
 * @tsplus fluent Repository removeById
 */
export function removeById<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
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
    E extends { id: string }
  >(
    name: ItemType,
    schema: S.Schema<E, T>,
    mapTo: (e: E, etag: string | undefined) => PM
  ) => {
    const [_dec, encode] = makeCodec(schema)
    function encodeToPM() {
      const getEtag = () => undefined
      return (t: T) => mapToPersistenceModel(encode(t), getEtag)
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
                .withSpan("Repository.makeInitial [effect-app/infra]", {
                  attributes: { "repository.model_name": name }
                })
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

export interface Repos<
  T extends { id: string },
  PM extends { id: string; _etag: string | undefined },
  Evt,
  ItemType extends string
> {
  make<R = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<R, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
        makeInitial?: Effect<R, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
  ): Effect<
    StoreMaker | ContextMapContainer | R | R2,
    E,
    Repository<T, PM, Evt, ItemType>
  >
  makeWith<Out, R = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<R, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
        makeInitial?: Effect<R, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      },
    f: (r: Repository<T, PM, Evt, ItemType>) => Out
  ): Effect<
    StoreMaker | ContextMapContainer | R | R2,
    E,
    Out
  >
  /** @deprecated use `query` instead */
  readonly where: ReturnType<typeof makeWhere<PM>>
  readonly query: ReturnType<typeof QueryBuilder.make<PM>>
  readonly type: Repository<T, PM, Evt, ItemType>
}

export type GetRepoType<T> = T extends { type: infer R } ? R : never

export const RepositoryBaseImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = never
  >() =>
  <ItemType extends string, T extends { id: string }, From extends { id: string }>(
    itemType: ItemType,
    schema: S.Schema<From, T>,
    jitM?: (pm: From) => From
  ): Exact<PM, From & { _etag: string | undefined }> extends true ?
      & (abstract new() => RepositoryBaseC1<T, PM, Evt, ItemType>)
      & Tag<Service, Service>
      & Repos<
        T,
        PM,
        Evt,
        ItemType
      >
    : never =>
  {
    const mkRepo = makeRepo<PM, Evt>()(
      itemType,
      schema,
      jitM ? (pm) => jitM(pm as unknown as From) : (pm) => pm as any,
      (e, _etag) => ({ ...e, _etag })
    )
    abstract class Cls extends RepositoryBaseC1<T, PM, Evt, ItemType> {
      constructor() {
        super(itemType)
      }
      static readonly make = mkRepo.make
      static readonly makeWith = ((a: any, b: any) => mkRepo.make(a).map(b)) as any

      static readonly where = makeWhere<PM>()
      static readonly query = QueryBuilder.make<PM>()
      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }
    return assignTag<Service>()(Cls) as any
  }
}

export const RepositoryDefaultImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = never
  >() =>
  <ItemType extends string, T extends { id: string }, From extends { id: string }>(
    itemType: ItemType,
    schema: S.Schema<From, T>,
    jitM?: (pm: From) => From
  ): Exact<PM, From & { _etag: string | undefined }> extends true ?
      & (abstract new(
        impl: Repository<T, PM, Evt, ItemType>
      ) => RepositoryBaseC2<T, PM, Evt, ItemType>)
      & Tag<Service, Service>
      & Repos<
        T,
        PM,
        Evt,
        ItemType
      >
    : never =>
  {
    const mkRepo = makeRepo<PM, Evt>()(
      itemType,
      schema,
      jitM ? (pm) => jitM(pm as unknown as From) : (pm) => pm as any,
      (e, _etag) => ({ ...e, _etag })
    )
    abstract class Cls extends RepositoryBaseC2<T, PM, Evt, ItemType> {
      constructor(
        impl: Repository<T, PM, Evt, ItemType>
      ) {
        super(itemType, impl)
      }
      static readonly make = mkRepo.make
      static readonly makeWith = ((a: any, b: any) => mkRepo.make(a).map(b)) as any

      static readonly where = makeWhere<PM>()
      static readonly query = QueryBuilder.make<PM>()

      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }
    return assignTag<Service>()(Cls) as any // impl is missing, but its marked protected
  }
}
