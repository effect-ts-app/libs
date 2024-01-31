/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import type { Repository } from "./Repository.js"
import { StoreMaker } from "./Store.js"
import type { Filter, FilterArgs, FilterFunc, PersistenceModelType, StoreConfig, Where } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import type { Opt } from "@effect-app/core/Option"
import { makeFilters } from "@effect-app/infra/filter"
import { S } from "@effect-app/prelude"
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"
import { QueryBuilder } from "./Store/filterApi/query.js"

/**
 * @tsplus type Repository
 */
export abstract class RepositoryBaseC<
  T extends { id: unknown },
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
    // count: (filter?: Filter<PM>) => Effect<never, never, NonNegativeInt>
  }
  abstract readonly changeFeed: PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<never, never, void>
}

export abstract class RepositoryBaseC1<
  T extends { id: unknown },
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
  T extends { id: unknown },
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
    R,
    From extends { id: string },
    T extends { id: unknown }
  >(
    name: ItemType,
    schema: S.Schema<R, From, T>,
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

    function make<RInitial = never, E = never, R2 = never>(
      args: [Evt] extends [never] ? {
          makeInitial?: Effect<RInitial, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
        : {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
          makeInitial?: Effect<RInitial, E, readonly T[]>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
    ) {
      return Do(($) => {
        const rctx = $(Effect.context<R>())
        const encode = flow(schema.encode, Effect.provide(rctx))
        const decode = flow(schema.decode, Effect.provide(rctx))

        const store = $(mkStore(args.makeInitial, args.config))
        const { get } = $(ContextMapContainer)
        const cms = get.andThen((_) => ({
          get: (id: string) => _.get(`${name}.${id}`),
          set: (id: string, etag: string | undefined) => _.set(`${name}.${id}`, etag)
        }))

        const pubCfg = $(Effect.context<R2>())
        const pub = "publishEvents" in args ? flow(args.publishEvents, (_) => _.provide(pubCfg)) : () => Effect.unit
        const changeFeed = $(PubSub.unbounded<[T[], "save" | "remove"]>())

        const allE = store.all.flatMap((items) =>
          Do(($) => {
            const { set } = $(cms)
            return items.map((_) => mapReverse(_, set))
          })
        )

        const all = allE.flatMap((_) => _.forEachEffect((_) => decode(_)).orDie)

        const structSchema = schema as unknown as { struct: typeof schema }
        const i = ("struct" in structSchema ? structSchema["struct"] : schema).pipe((_) =>
          _.ast._tag === "Union"
            // we need to get the TypeLiteral, incase of class it's behind a transform...
            ? S.union(..._.ast.types.map((_) =>
              (S.make(_._tag === "Transform" ? _.from : _) as unknown as Schema<
                never,
                From,
                T
              >)
                .pipe(S.pick("id"))
            ))
            : _.pipe(S.pick("id"))
        )
        const encodeId = flow(i.encode, Effect.provide(rctx))
        function findE(_id: T["id"]) {
          return encodeId({ id: _id })
            .map((_) => _.id)
            .orDie
            .andThen((id) =>
              store
                .find(id as unknown as string)
            )
            .flatMap((items) =>
              Do(($) => {
                const { set } = $(cms)
                return items.map((_) => mapReverse(_, set))
              })
            )
        }

        function find(id: T["id"]) {
          return findE(id).flatMapOpt((_) => decode(_).orDie)
        }

        const saveAllE = (a: Iterable<From>) =>
          Effect
            .sync(() => a.toNonEmptyArray)
            .flatMapOpt((a) =>
              Do(($) => {
                const { get, set } = $(cms)
                const items = a.map((_) => mapToPersistenceModel(_, get))
                const ret = $(store.batchSet(items))
                ret.forEach((_) => set(_.id, _._etag))
              })
            )
            .asUnit

        const saveAll = (a: Iterable<T>) => a.toChunk.forEachEffect((_) => encode(_)).orDie.andThen(saveAllE)

        const saveAndPublish = (items: Iterable<T>, events: Iterable<Evt> = []) => {
          const it = items.toChunk
          return saveAll(it)
            .andThen(Effect.sync(() => events.toNonEmptyArray))
            // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
            .flatMapOpt(pub)
            .andThen(changeFeed
              .publish([it.toArray, "save"]))
            .asUnit
        }

        function removeAndPublish(a: Iterable<T>, events: Iterable<Evt> = []) {
          return Effect.gen(function*($) {
            const { get, set } = yield* $(cms)
            const it = a.toChunk
            const items = yield* $(it.forEachEffect((_) => encode(_)).orDie)
            // TODO: we should have a batchRemove on store so the adapter can actually batch...
            for (const e of items) {
              yield* $(store.remove(mapToPersistenceModel(e, get)))
              set(e.id, undefined)
            }
            yield* $(
              Effect
                .sync(() => events.toNonEmptyArray)
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
            parseMany: (items) => cms.flatMap((cm) => items.forEachEffect((_) => decode(mapReverse(_, cm.set))).orDie),
            filter: <U extends keyof PM = keyof PM>(args: FilterArgs<PM, U>) =>
              store
                .filter(args)
                .tap((items) =>
                  args.select
                    ? Effect.unit
                    : cms.map(({ set }) => items.forEach((_) => set((_ as PM).id, (_ as PM)._etag)))
                ),
            all: store.all.tap((items) => cms.map(({ set }) => items.forEach((_) => set(_.id, _._etag))))
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
  T extends { id: unknown },
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
    R,
    E extends { id: string },
    T extends { id: unknown }
  >(
    name: ItemType,
    schema: S.Schema<R, E, T>,
    mapTo: (e: E, etag: string | undefined) => PM
  ) => {
    function encodeToPM() {
      const getEtag = () => undefined
      return (t: T) =>
        schema
          .encode(t)
          .orDie
          .map((_) => mapToPersistenceModel(_, getEtag))
    }

    function mapToPersistenceModel(
      e: E,
      getEtag: (id: string) => string | undefined
    ): PM {
      return mapTo(e, getEtag(e.id))
    }

    function makeStore<RInitial = never, EInitial = never>(
      makeInitial?: Effect<RInitial, EInitial, readonly T[]>,
      config?: Omit<StoreConfig<PM>, "partitionValue"> & {
        partitionValue?: (a: PM) => string
      }
    ) {
      return Do(($) => {
        const { make } = $(StoreMaker)

        const store = $(
          make<PM, string, R | RInitial, EInitial>(
            pluralize(name),
            makeInitial
              ? (makeInitial
                .flatMap((_) => _.forEachEffect(encodeToPM())))
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
  T extends { id: unknown },
  PM extends { id: string; _etag: string | undefined },
  R,
  Evt,
  ItemType extends string
> {
  make<RInitial = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<RInitial, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
        makeInitial?: Effect<RInitial, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
  ): Effect<
    StoreMaker | ContextMapContainer | R | RInitial | R2,
    E,
    Repository<T, PM, Evt, ItemType>
  >
  makeWith<Out, RInitial = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<RInitial, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<R2, never, void>
        makeInitial?: Effect<RInitial, E, readonly T[]>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      },
    f: (r: Repository<T, PM, Evt, ItemType>) => Out
  ): Effect<
    StoreMaker | ContextMapContainer | R | RInitial | R2,
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
  <ItemType extends string, R, From extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<R, From, T>,
    jitM?: (pm: From) => From
  ): Exact<PM, From & { _etag: string | undefined }> extends true ?
      & (abstract new() => RepositoryBaseC1<T, PM, Evt, ItemType>)
      & Tag<Service, Service>
      & Repos<
        T,
        PM,
        R,
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
  <ItemType extends string, R, From extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<R, From, T>,
    jitM?: (pm: From) => From
  ): Exact<PM, From & { _etag: string | undefined }> extends true ?
      & (abstract new(
        impl: Repository<T, PM, Evt, ItemType>
      ) => RepositoryBaseC2<T, PM, Evt, ItemType>)
      & Tag<Service, Service>
      & Repos<
        T,
        PM,
        R,
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
