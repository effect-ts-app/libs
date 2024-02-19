/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import {
  AnyPureDSL,
  byIdAndSaveWithPure,
  get,
  queryEffect,
  queryOneEffect,
  type Repository,
  saveAllWithEffectInt,
  saveManyWithPure_,
  saveManyWithPureBatched_,
  saveWithPure_
} from "./Repository.js"
import { StoreMaker } from "./Store.js"
import type { Filter, FilterArgs, FilterFunc, PersistenceModelType, StoreConfig, Where } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import { flatMapOption } from "@effect-app/core/Effect"
import type { Opt } from "@effect-app/core/Option"
import { makeFilters } from "@effect-app/infra/filter"
import { S } from "effect-app"
import type { FixEnv } from "effect-app/Pure"
import { type InvalidStateError, NotFoundError, type OptimisticConcurrencyException } from "../errors.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"
import * as Q from "./Store/filterApi/query.js"

export interface Mapped1<PM extends { id: string }, X, R> {
  all: Effect<X[], ParseResult.ParseError, R>
  save: (...xes: readonly X[]) => Effect<void, OptimisticConcurrencyException | ParseResult.ParseError, R>
  query: (
    b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>
  ) => Effect<X[], ParseResult.ParseError, R>
  find: (id: PM["id"]) => Effect<Option<X>, ParseResult.ParseError, R>
}

// TODO: auto use project, and select fields from the From side of schema only
export interface Mapped2<PM extends { id: string }, X, R> {
  all: Effect<X[], ParseResult.ParseError, R>
  query: (
    b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>
  ) => Effect<X[], ParseResult.ParseError, R>
}

export interface Mapped<PM extends { id: string }, OriginalFrom> {
  <X, R>(schema: S.Schema<X, OriginalFrom, R>): Mapped1<PM, X, R>
  // TODO: constrain on From having to contain only fields that fit OriginalFrom
  <X, From, R>(schema: S.Schema<X, From, R>): Mapped2<PM, X, R>
}

export interface MM<Repo, PM extends { id: string }, OriginalFrom> {
  <X, R>(schema: S.Schema<X, OriginalFrom, R>): Effect<Mapped1<PM, X, R>, never, Repo>
  // TODO: constrain on From having to contain only fields that fit OriginalFrom
  <X, From, R>(schema: S.Schema<X, From, R>): Effect<Mapped2<PM, X, R>, never, Repo>
}

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
  abstract readonly find: (id: T["id"]) => Effect<Opt<T>>
  abstract readonly all: Effect<T[]>
  abstract readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException>
  abstract readonly utils: {
    parseMany: (a: readonly PM[]) => Effect<readonly T[]>
    all: Effect<PM[]>
    filter: FilterFunc<PM>
    // count: (filter?: Filter<PM>) => Effect<never, never, NonNegativeInt>
  }
  abstract readonly changeFeed: PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void>

  abstract readonly mapped: Mapped<PM, Omit<PM, "_etag">>
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
    this.saveAndPublish = this.impl.saveAndPublish
    this.removeAndPublish = this.impl.removeAndPublish
    this.find = this.impl.find
    this.all = this.impl.all
    this.utils = this.impl.utils
    this.changeFeed = this.impl.changeFeed
    this.mapped = this.impl.mapped
  }
  // makes super calls a compiler error, as it should
  override saveAndPublish
  override removeAndPublish
  override find
  override all
  override utils
  override changeFeed
  override mapped
}

const anyQb = Q.QueryBuilder.make<any>()

export class RepositoryBaseC3<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC2<T, PM, Evt, ItemType> {
  get(id: T["id"]) {
    return this
      .find(id)
      .flatMap((_) => _.encaseInEffect(() => new NotFoundError<ItemType>({ type: this.itemType, id })))
  }

  readonly log = (evt: Evt) => AnyPureDSL.log(evt)

  removeById(id: T["id"]) {
    return this.get(id).andThen((_) => this.removeAndPublish([_]))
  }

  // TODO: project inside the db.
  projectEffect<
    R,
    E,
    S = PM
  >(
    map: Effect<
      {
        filter?: Filter<PM> | undefined
        collect?: ((t: PM) => Option<S>) | undefined
        limit?: number | undefined
        skip?: number | undefined
      },
      E,
      R
    >
  ): Effect<S[], E, R>
  projectEffect<
    R,
    E,
    U extends keyof PM,
    S = PM
  >(
    map: Effect<
      {
        filter?: Q.QueryBuilder<PM> | undefined
        collect?: ((t: PM) => Option<S>) | undefined
        limit?: number | undefined
        skip?: number | undefined
      },
      E,
      R
    >
  ): Effect<Pick<PM, U>[], E, R>
  projectEffect<
    R,
    E,
    U extends keyof PM,
    S = Pick<PM, U>
  >(
    map: Effect<
      {
        filter?: Filter<PM> | undefined
        select?: NonEmptyReadonlyArray<U> | undefined
        collect?: ((t: PM) => Option<S>) | undefined
        limit?: number | undefined
        skip?: number | undefined
      },
      E,
      R
    >
  ): Effect<S[], E, R> {
    // TODO: a projection that gets sent to the db instead.
    return map.flatMap((f) =>
      this
        .utils
        .filter(f)
        .map((_) => f.collect ? _.filterMap(f.collect) : _ as unknown as S[])
    )
  }

  project<S = PM>(
    map: {
      filter?: Filter<PM>
      collect?: (t: PM) => Option<S>
      limit?: number
      skip?: number
    }
  ): Effect<S[]>
  project<U extends keyof PM>(
    map: {
      filter?: Q.QueryBuilder<PM>
      select: NonEmptyReadonlyArray<U>
      limit?: number
      skip?: number
    }
  ): Effect<Pick<PM, U>[]>
  project<
    U extends keyof PM,
    S = Pick<PM, U>
  >(
    map: {
      filter?: Filter<PM>
      select?: NonEmptyReadonlyArray<U>
      collect?: (t: Pick<PM, U>) => Option<S>
      limit?: number
      skip?: number
    }
  ): Effect<S[]> {
    return this.projectEffect(Effect.sync(() => map))
  }

  count(filter?: Filter<PM>) {
    return this
      .projectEffect(Effect.sync(() => ({ filter })))
      .map((_) => NonNegativeInt(_.length))
  }

  queryEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
  ) {
    return map.flatMap((f) =>
      (f.filter ? this.utils.filter(f) : this.utils.all)
        .flatMap((_) => this.utils.parseMany(_))
        .map((_) => f.collect ? _.filterMap(f.collect) : _ as any as S[])
    )
  }

  queryOneEffect<R, E>(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM> }, E, R>
  ): Effect<T, E | NotFoundError<ItemType>, R>
  queryOneEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect: (t: T) => Option<S> }, E, R>
  ): Effect<S, E | NotFoundError<ItemType>, R>
  queryOneEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S> }, E, R>
  ): Effect<S, E | NotFoundError<ItemType>, R> {
    return map.flatMap((f) =>
      (f.filter ? this.utils.filter({ filter: f.filter, limit: 1 }) : this.utils.all)
        .flatMap((_) => this.utils.parseMany(_))
        .flatMap((_) =>
          (f.collect ? _.filterMap(f.collect) : _ as any as S[])
            .toNonEmpty
            .encaseInEffect(() => new NotFoundError<ItemType>({ type: this.itemType, id: f.filter }))
            .map((_) => _[0])
        )
    )
  }

  queryLegacy<S = T>(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: { filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
  ) {
    return this.queryEffect(Effect.sync(() => map))
  }

  query(
    b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>
  ) {
    return this.queryEffect(Effect.sync(() => ({ filter: anyQb((_, fields) => b(_, fields as any)) })))
  }

  queryOne<S = T>(
    map: { filter?: Filter<PM>; collect: (t: T) => Option<S> }
  ): Effect<S, NotFoundError<ItemType>>
  queryOne(
    map: { filter?: Filter<PM> }
  ): Effect<T, NotFoundError<ItemType>>
  queryOne<S = T>(
    map: { filter?: Filter<PM>; collect?: (t: T) => Option<S> }
  ) {
    return this.queryOneEffect(Effect.sync(() => map))
  }

  queryAndSaveOnePureEffect<
    R,
    E,
    S extends T = T
  >(
    map: Effect<{ filter: Filter<PM>; collect: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
  ): <R2, A, E2, S2 extends T>(
    pure: Effect<A, E2, FixEnv<R2, Evt, S, S2>>
  ) => Effect<
    A,
    InvalidStateError | OptimisticConcurrencyException | E | E2 | NotFoundError<ItemType>,
    | R
    | Exclude<R2, {
      env: PureEnv<Evt, S, S2>
    }>
  >
  queryAndSaveOnePureEffect<
    R,
    E
  >(
    map: Effect<{ filter: Filter<PM> }, E, R>
  ): <R2, A, E2, T2 extends T>(
    pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
  ) => Effect<
    A,
    InvalidStateError | OptimisticConcurrencyException | E | E2 | NotFoundError<ItemType>,
    | R
    | Exclude<R2, {
      env: PureEnv<Evt, T, T2>
    }>
  >
  queryAndSaveOnePureEffect(
    map: any
  ) {
    return (pure: any) =>
      queryOneEffect(this, map)
        .flatMap((_) => saveWithPure_(this, _, pure))
  }

  queryAndSaveOnePure<
    S extends T = T
  >(
    map: { filter: Filter<PM>; collect: (t: T) => Option<S>; limit?: number; skip?: number }
  ): <R2, A, E2, S2>(pure: Effect<A, E2, FixEnv<R2, Evt, S, S2>>) => Effect<
    A,
    InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
    Exclude<R2, {
      env: PureEnv<Evt, S, S2>
    }>
  >
  queryAndSaveOnePure(
    map: { filter: Filter<PM> }
  ): <R2, A, E2, T2>(pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>) => Effect<
    A,
    InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
    Exclude<R2, {
      env: PureEnv<Evt, T, T2>
    }>
  >
  queryAndSaveOnePure<S = T>(
    map: { filter: Filter<PM>; collect: (t: T) => Option<S> }
  ) {
    return this.queryAndSaveOnePureEffect(Effect.sync(() => map))
  }

  queryAndSavePureEffect<
    R,
    E,
    S extends T = T
  >(
    map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
  ) {
    return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, S[], S2[]>>) =>
      queryEffect(this, map)
        .flatMap((_) => this.saveManyWithPure_(_, pure))
  }

  queryAndSavePure<
    S extends T = T
  >(
    map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
  ) {
    return this.queryAndSavePureEffect(Effect.sync(() => map))
  }

  get saveManyWithPure() {
    return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>) =>
    (items: Iterable<S1>) => saveManyWithPure_(this, items, pure)
  }

  byIdAndSaveWithPure(id: T["id"]) {
    return <R, A, E, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, T, S2>>) =>
      get(this, id).flatMap((item) => saveWithPure_(this, item, pure))
  }

  /**
   * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
   */
  get handleByIdAndSaveWithPure() {
    return <Req extends { id: T["id"] }, Context, R, A, E, S2 extends T>(
      pure: (req: Req, ctx: Context) => Effect<A, E, FixEnv<R, Evt, T, S2>>
    ) =>
    (req: Req, ctx: Context) => byIdAndSaveWithPure(this, req.id)(pure(req, ctx))
  }

  saveManyWithPure_<
    R,
    A,
    E,
    S1 extends T,
    S2 extends T
  >(
    items: Iterable<S1>,
    pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>
  ) {
    return saveAllWithEffectInt(
      this,
      pure.runTerm([...items])
    )
  }

  saveWithPure_<
    R,
    A,
    E,
    S1 extends T,
    S2 extends T
  >(
    item: S1,
    pure: Effect<A, E, FixEnv<R, Evt, S1, S2>>
  ) {
    return saveAllWithEffectInt(
      this,
      pure
        .runTerm(item)
        .map(([item, events, a]) => [[item], events, a])
    )
  }

  saveAllWithEffectInt<
    P extends T,
    R,
    E,
    A
  >(
    gen: Effect<readonly [Iterable<P>, Iterable<Evt>, A], E, R>
  ) {
    return gen
      .flatMap(
        ([items, events, a]) => this.saveAndPublish(items, events).map(() => a)
      )
  }

  queryAndSavePureEffectBatched<
    R,
    E,
    S extends T = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>,
    batchSize = 100
  ) {
    return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, S[], S2[]>>) =>
      queryEffect(this, map)
        .flatMap((_) => this.saveManyWithPureBatched_(_, pure, batchSize))
  }

  queryAndSavePureBatched<
    S extends T = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number },
    batchSize = 100
  ) {
    return this.queryAndSavePureEffectBatched(Effect.sync(() => map), batchSize)
  }

  saveManyWithPureBatched(batchSize = 100) {
    return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>) =>
    (items: Iterable<S1>) => saveManyWithPureBatched_(this, items, pure, batchSize)
  }

  saveManyWithPureBatched_<
    R,
    A,
    E,
    S1 extends T,
    S2 extends T
  >(
    items: Iterable<S1>,
    pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>,
    batchSize = 100
  ) {
    return items
      .chunk(batchSize)
      .forEachEffect((batch) =>
        saveAllWithEffectInt(
          this,
          pure.runTerm(batch)
        )
      )
  }

  readonly save = (...items: NonEmptyArray<T>) => this.saveAndPublish(items)

  readonly saveWithEvents = (
    events: Iterable<Evt>
  ) =>
  (...items: NonEmptyArray<T>) => this.saveAndPublish(items, events)
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
    schema: S.Schema<T, From, R>,
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
          makeInitial?: Effect<readonly T[], E, RInitial>
          config?: Omit<StoreConfig<PM>, "partitionValue"> & {
            partitionValue?: (a: PM) => string
          }
        }
        : {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
          makeInitial?: Effect<readonly T[], E, RInitial>
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

        const all = allE.flatMap((_) =>
          _.forEachEffect((_) => decode(_), { concurrency: "inherit", batching: true }).orDie
        )

        const structSchema = schema as unknown as { struct: typeof schema }
        const i = ("struct" in structSchema ? structSchema["struct"] : schema).pipe((_) =>
          _.ast._tag === "Union"
            // we need to get the TypeLiteral, incase of class it's behind a transform...
            ? S.union(..._.ast.types.map((_) =>
              (S.make(_._tag === "Transform" ? _.from : _) as unknown as Schema<T, From>)
                .pipe(S.pick("id"))
            ))
            : _
                .ast
                ._tag === "Transform"
            ? (S
              .make(
                _
                  .ast
                  .from
              ) as unknown as Schema<T, From>)
              .pipe(S
                .pick("id"))
            : _
              .pipe(S
                .pick("id"))
        )
        const encodeId = flow(i.encode, Effect.provide(rctx))
        function findEId(id: From["id"]) {
          return store
            .find(id)
            .flatMap((item) =>
              Do(($) => {
                const { set } = $(cms)
                return item.map((_) => mapReverse(_, set))
              })
            )
        }
        function findE(id: T["id"]) {
          return encodeId({ id })
            .orDie
            .map((_) => _.id)
            .flatMap(findEId)
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

        const saveAll = (a: Iterable<T>) =>
          a.toChunk.forEachEffect((_) => encode(_), { concurrency: "inherit", batching: true }).orDie.andThen(saveAllE)

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
            const items = yield* $(it.forEachEffect((_) => encode(_), { concurrency: "inherit", batching: true }).orDie)
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
            parseMany: (items) =>
              cms.flatMap((cm) =>
                items
                  .forEachEffect((_) => decode(mapReverse(_, cm.set)), { concurrency: "inherit", batching: true })
                  .orDie
              ),
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
          mapped: <A, R>(schema: S.Schema<A, any, R>) => {
            // const enc = S.encode(schema)
            const dec = S.decode(schema)
            const encMany = S.encode(S.array(schema))
            const decMany = S.decode(S.array(schema))
            return {
              all: cms
                .flatMap((cm) => r.utils.all.map((_) => _.map((_) => mapReverse(_, cm.set))))
                .flatMap(decMany)
                .map((_) => _ as any[]),
              find: (id: PM["id"]) => flatMapOption(findE(id), dec),
              query: (b: any) =>
                r
                  .utils
                  .filter({ filter: b })
                  .flatMap(decMany)
                  .map((_) => _ as any[]),
              save: (...xes: any[]) => encMany(xes).flatMap((_) => saveAllE(_ as any))
            }
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
      Where: where,
      Query: Q.QueryBuilder.make<PM>()
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
    schema: S.Schema<T, E, R>,
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
      makeInitial?: Effect<readonly T[], EInitial, RInitial>,
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
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
  ): Effect<Repository<T, PM, Evt, ItemType>, E, StoreMaker | ContextMapContainer | R | RInitial | R2>
  makeWith<Out, RInitial = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<PM>, "partitionValue"> & {
          partitionValue?: (a: PM) => string
        }
      },
    f: (r: Repository<T, PM, Evt, ItemType>) => Out
  ): Effect<Out, E, StoreMaker | ContextMapContainer | R | RInitial | R2>
  /** @deprecated use `query` instead */
  readonly Where: ReturnType<typeof makeWhere<PM>>
  readonly Query: ReturnType<typeof Q.QueryBuilder.make<PM>>
  readonly type: Repository<T, PM, Evt, ItemType>
}

export type GetRepoType<T> = T extends { type: infer R } ? R : never

export interface RepoFunctions<T extends { id: unknown }, PM extends { id: string }, Evt, ItemType, Service> {
  all: Effect<readonly T[], never, Service>
  find: (id: T["id"]) => Effect<Option<T>, never, Service>
  removeById: (id: T["id"]) => Effect<void, NotFoundError<ItemType>, Service>
  saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException, Service>
  removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, never, Service>
  save: (...items: T[]) => Effect<void, InvalidStateError | OptimisticConcurrencyException, Service>
  get: (id: T["id"]) => Effect<T, NotFoundError<ItemType>, Service>

  query: (b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>) => Effect<T[], never, never>
  queryLegacy: <S = T>(map: {
    filter?: Filter<PM>
    collect?: (t: T) => Option<S>
    limit?: number
    skip?: number
  }) => Effect<S[], never, never>

  mapped: MM<Service, PM, Omit<PM, "_etag">>
}

const makeRepoFunctions = (tag: any) => {
  const { all } = Effect.serviceConstants(tag) as any
  const { find, get, query, queryLegacy, removeAndPublish, removeById, save, saveAndPublish } = Effect.serviceFunctions(
    tag
  ) as any

  const mapped = (s: any) => tag.map((_: any) => _.mapped(s))

  return { all, find, removeById, saveAndPublish, removeAndPublish, save, get, query, queryLegacy, mapped }
}

export const RepositoryBaseImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = never
  >() =>
  <ItemType extends string, R, From extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<T, From, R>,
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
      & RepoFunctions<T, PM, Evt, ItemType, Service>
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

      static readonly Where = makeWhere<PM>()
      static readonly Query = Q.QueryBuilder.make<PM>()
      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }

    return assignTag<Service>()(Object.assign(Cls, makeRepoFunctions(Cls))) as any
  }
}

export const RepositoryDefaultImpl = <Service>() => {
  return <
    PM extends { id: string; _etag: string | undefined },
    Evt = never
  >() =>
  <ItemType extends string, R, From extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<T, From, R>,
    jitM?: (pm: From) => From
  ): Exact<PM, From & { _etag: string | undefined }> extends true ?
      & (abstract new(
        impl: Repository<T, PM, Evt, ItemType>
      ) => RepositoryBaseC3<T, PM, Evt, ItemType>)
      & Tag<Service, Service>
      & Repos<
        T,
        PM,
        R,
        Evt,
        ItemType
      >
      & RepoFunctions<T, PM, Evt, ItemType, Service>
    : never =>
  {
    const mkRepo = makeRepo<PM, Evt>()(
      itemType,
      schema,
      jitM ? (pm) => jitM(pm as unknown as From) : (pm) => pm as any,
      (e, _etag) => ({ ...e, _etag })
    )
    abstract class Cls extends RepositoryBaseC3<T, PM, Evt, ItemType> {
      constructor(
        impl: Repository<T, PM, Evt, ItemType>
      ) {
        super(itemType, impl)
      }
      static readonly make = mkRepo.make
      static readonly makeWith = ((a: any, b: any) => mkRepo.make(a).map(b)) as any

      static readonly Where = makeWhere<PM>()
      static readonly Query = Q.QueryBuilder.make<PM>()

      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }
    return assignTag<Service>()(Object.assign(Cls, makeRepoFunctions(Cls))) as any // impl is missing, but its marked protected
  }
}
