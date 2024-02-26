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
import { toNonEmptyArray } from "@effect-app/core/Array"
import { flatMapOption } from "@effect-app/core/Effect"
import { makeFilters } from "@effect-app/infra/filter"
import type { ParseResult, Schema } from "@effect-app/schema"
import { NonNegativeInt } from "@effect-app/schema"
import type { Context, NonEmptyArray, NonEmptyReadonlyArray } from "effect-app"
import { Chunk, Effect, flow, Option, pipe, PubSub, ReadonlyArray, S } from "effect-app"
import { runTerm } from "effect-app/Pure"
import type { FixEnv, PureEnv } from "effect-app/Pure"
import { assignTag } from "effect-app/service"
import { type InvalidStateError, NotFoundError, type OptimisticConcurrencyException } from "../errors.js"
import type { FieldValues } from "../filter/types.js"
import { make as makeQuery, page, query } from "./query.js"
import type { QAll, Query, QueryEnd, QueryProjection, QueryWhere } from "./query.js"
import * as Q2 from "./query.js"
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
  abstract readonly find: (id: T["id"]) => Effect<Option<T>>
  abstract readonly all: Effect<T[]>
  abstract readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException>
  abstract readonly utils: {
    parseMany: (a: readonly PM[]) => Effect<readonly T[]>
    parseMany2: <A, R>(
      a: readonly PM[],
      schema: S.Schema<A, Omit<PM, "_etag">, R>
    ) => Effect<readonly A[], S.ParseResult.ParseError, R>
    all: Effect<PM[]>
    filter: FilterFunc<PM>
    // count: (filter?: Filter<PM>) => Effect<never, never, NonNegativeInt>
  }
  abstract readonly changeFeed: PubSub.PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void>

  /** @deprecated use q2 */
  abstract readonly mapped: Mapped<PM, Omit<PM, "_etag">>
  abstract readonly q2: {
    <A, R, From extends FieldValues>(
      q: (initial: Query<Omit<PM, "_etag">>) => QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
    <R = never>(
      q: (initial: Query<Omit<PM, "_etag">>) => QAll<Omit<PM, "_etag">, T, R>
    ): Effect.Effect<readonly T[], never, R>

    <A, R, From extends FieldValues>(
      q: QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
    <R = never>(q: QAll<Omit<PM, "_etag">, T, R>): Effect.Effect<readonly T[], never, R>
  }
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
    this.q2 = this.impl.q2
  }
  // makes super calls a compiler error, as it should
  override saveAndPublish
  override removeAndPublish
  override find
  override all
  override utils
  override changeFeed
  override mapped
  override q2
}

const anyQb = Q.QueryBuilder.make<any>()

export class RepositoryBaseC3<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC2<T, PM, Evt, ItemType> {
  get(id: T["id"]) {
    return Effect.andThen(
      this
        .find(id),
      (_) => Effect.mapError(_, () => new NotFoundError<ItemType>({ type: this.itemType, id }))
    )
  }

  readonly log = (evt: Evt) => AnyPureDSL.log(evt)

  removeById(id: T["id"]) {
    return Effect.andThen(this.get(id), (_) => this.removeAndPublish([_]))
  }

  count(filter?: Filter<PM>) {
    return Effect.map(
      this.projectEffect(Effect.sync(() => ({ filter }))),
      (_) => NonNegativeInt(_.length)
    )
  }

  readonly save = (...items: NonEmptyArray<T>) => this.saveAndPublish(items)

  readonly saveWithEvents = (events: Iterable<Evt>) => (...items: NonEmptyArray<T>) =>
    this.saveAndPublish(items, events)

  readonly q2AndSaveOnePure = <A, E2, R2, T2 extends T>(
    q: (q: Query<Omit<PM, "_etag">>) => Query<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">>,
    pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
  ) =>
    this.q2(flow(q, page({ limit: 1 }))).pipe(
      Effect.map(ReadonlyArray.toNonEmptyArray),
      Effect.flatMap(Effect.mapError(() => new NotFoundError({ type: this.itemType, id: q }))),
      Effect.andThen((_) => saveWithPure_(this, _[0], pure))
    )

  readonly q2AndSavePure = <A, E2, R2, T2 extends T>(
    q: (q: Query<Omit<PM, "_etag">>) => Query<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">>,
    pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
    batchSize?: number
  ) =>
    this.q2(flow(q, page({ limit: 1 }))).pipe(
      Effect.andThen((_) =>
        batchSize === undefined
          ? saveManyWithPure_(this, _, pure)
          : saveManyWithPureBatched_(this, _, pure, batchSize)
      )
    )

  /**
   * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
   */
  readonly handleByIdAndSaveWithPure = <Req extends { id: T["id"] }, Context, R, A, E, S2 extends T>(
    pure: (req: Req, ctx: Context) => Effect<A, E, FixEnv<R, Evt, T, S2>>
  ) =>
  (req: Req, ctx: Context) => byIdAndSaveWithPure(this, req.id)(pure(req, ctx))

  saveManyWithPure = <
    R,
    A,
    E,
    S1 extends T,
    S2 extends T
  >(
    items: Iterable<S1>,
    pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
  ) =>
    saveAllWithEffectInt(
      this,
      runTerm(pure, [...items])
    )

  byIdAndSaveWithPure: {
    <R, A, E, S2 extends T>(
      id: T["id"],
      pure: Effect<A, E, FixEnv<R, Evt, T, S2>>
    ): Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | NotFoundError<ItemType> | E,
      Exclude<R, {
        env: PureEnv<Evt, T, S2>
      }>
    >
  } = (id, pure): any => get(this, id).pipe(Effect.flatMap((item) => saveWithPure_(this, item, pure)))

  saveWithPure<
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
      runTerm(pure, item)
        .pipe(Effect.map(([item, events, a]) => [[item], events, a]))
    )
  }

  /** @deprecated use q2 */
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
  /** @deprecated use q2 */
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
  /** @deprecated use q2 */
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
    return Effect.flatMap(map, (f) =>
      Effect.map(
        this
          .utils
          .filter(f),
        (_) => f.collect ? ReadonlyArray.filterMap(_, f.collect) : _ as unknown as S[]
      ))
  }

  /** @deprecated use q2 */
  project<S = PM>(
    map: {
      filter?: Filter<PM>
      collect?: (t: PM) => Option<S>
      limit?: number
      skip?: number
    }
  ): Effect<S[]>
  /** @deprecated use q2 */
  project<U extends keyof PM>(
    map: {
      filter?: Q.QueryBuilder<PM>
      select: NonEmptyReadonlyArray<U>
      limit?: number
      skip?: number
    }
  ): Effect<Pick<PM, U>[]>
  /** @deprecated use q2 */
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

  /** @deprecated use q2 */
  queryEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
  ) {
    return Effect.flatMap(map, (f) =>
      (f.filter ? this.utils.filter(f) : this.utils.all)
        .pipe(
          Effect.flatMap((_) => this.utils.parseMany(_)),
          Effect.map((_) => f.collect ? ReadonlyArray.filterMap(_, f.collect) : _ as unknown[] as S[])
        ))
  }

  /** @deprecated use q2 */
  queryOneEffect<R, E>(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM> }, E, R>
  ): Effect<T, E | NotFoundError<ItemType>, R>
  /** @deprecated use q2 */
  queryOneEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect: (t: T) => Option<S> }, E, R>
  ): Effect<S, E | NotFoundError<ItemType>, R>
  /** @deprecated use q2 */
  queryOneEffect<
    R,
    E,
    S = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S> }, E, R>
  ): Effect<S, E | NotFoundError<ItemType>, R> {
    return Effect.flatMap(map, (f) =>
      (f.filter ? this.utils.filter({ filter: f.filter, limit: 1 }) : this.utils.all)
        .pipe(
          Effect.flatMap((_) => this.utils.parseMany(_)),
          Effect
            .flatMap((_) =>
              toNonEmptyArray(
                f.collect
                  ? ReadonlyArray.filterMap(_, f.collect)
                  : _ as unknown[] as S[]
              )
                .pipe(
                  Effect.mapError(() => new NotFoundError<ItemType>({ type: this.itemType, id: f.filter })),
                  Effect.map((_) => _[0])
                )
            )
        ))
  }

  /** @deprecated use q2 */
  queryLegacy<S = T>(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: { filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
  ) {
    return this.queryEffect(Effect.sync(() => map))
  }

  /** @deprecated use q2 */
  query(
    b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>
  ) {
    return this.queryEffect(Effect.sync(() => ({ filter: anyQb((_, fields) => b(_, fields as any)) })))
  }

  /** @deprecated use q2 */
  queryOne<S = T>(
    map: { filter?: Filter<PM>; collect: (t: T) => Option<S> }
  ): Effect<S, NotFoundError<ItemType>>
  /** @deprecated use q2 */
  queryOne(
    map: { filter?: Filter<PM> }
  ): Effect<T, NotFoundError<ItemType>>
  /** @deprecated use q2 */
  queryOne<S = T>(
    map: { filter?: Filter<PM>; collect?: (t: T) => Option<S> }
  ) {
    return this.queryOneEffect(Effect.sync(() => map))
  }

  /** @deprecated */
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
  /** @deprecated */
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
  /** @deprecated */
  queryAndSaveOnePureEffect(
    map: any
  ) {
    return (pure: any) => Effect.flatMap(queryOneEffect(this, map), (_) => saveWithPure_(this, _, pure))
  }
  /** @deprecated */
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
  /** @deprecated */
  queryAndSaveOnePure(
    map: { filter: Filter<PM> }
  ): <R2, A, E2, T2>(pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>) => Effect<
    A,
    InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
    Exclude<R2, {
      env: PureEnv<Evt, T, T2>
    }>
  >
  /** @deprecated */
  queryAndSaveOnePure<S = T>(
    map: { filter: Filter<PM>; collect: (t: T) => Option<S> }
  ) {
    return this.queryAndSaveOnePureEffect(Effect.sync(() => map))
  }
  /** @deprecated */
  queryAndSavePureEffect<
    R,
    E,
    S extends T = T
  >(
    map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
  ) {
    return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, readonly S[], readonly S2[]>>) =>
      Effect.flatMap(queryEffect(this, map), (_) => this.saveManyWithPure(_, pure))
  }
  /** @deprecated */
  queryAndSavePure<
    S extends T = T
  >(
    map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
  ) {
    return this.queryAndSavePureEffect(Effect.sync(() => map))
  }

  /** @deprecated use q2 */
  queryAndSavePureEffectBatched<
    R,
    E,
    S extends T = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>,
    batchSize = 100
  ) {
    return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, readonly S[], readonly S2[]>>) =>
      Effect.flatMap(queryEffect(this, map), (_) => this.saveManyWithPureBatched(_, pure, batchSize))
  }

  /** @deprecated use q2 */
  queryAndSavePureBatched<
    S extends T = T
  >(
    // TODO: think about collectPM, collectE, and collect(Parsed)
    map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number },
    batchSize = 100
  ) {
    return this.queryAndSavePureEffectBatched(Effect.sync(() => map), batchSize)
  }

  /** @deprecated use q2 */
  saveManyWithPureBatched<
    R,
    A,
    E,
    S1 extends T,
    S2 extends T
  >(
    items: Iterable<S1>,
    pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>,
    batchSize = 100
  ) {
    return Effect.forEach(
      ReadonlyArray.chunk_(items, batchSize),
      (batch) =>
        saveAllWithEffectInt(
          this,
          runTerm(pure, batch)
        )
    )
  }
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
      return Effect
        .gen(function*($) {
          const rctx = yield* $(Effect.context<R>())
          const encode = flow(S.encode(schema), Effect.provide(rctx))
          const decode = flow(S.decode(schema), Effect.provide(rctx))

          const store = yield* $(mkStore(args.makeInitial, args.config))
          const { get } = yield* $(ContextMapContainer)
          const cms = Effect.andThen(get, (_) => ({
            get: (id: string) => _.get(`${name}.${id}`),
            set: (id: string, etag: string | undefined) => _.set(`${name}.${id}`, etag)
          }))

          const pubCfg = yield* $(Effect.context<R2>())
          const pub = "publishEvents" in args
            ? flow(args.publishEvents, Effect.provide(pubCfg))
            : () => Effect.unit
          const changeFeed = yield* $(PubSub.unbounded<[T[], "save" | "remove"]>())

          const allE = store.all.pipe(Effect.flatMap((items) =>
            Effect.gen(function*($) {
              const { set } = yield* $(cms)
              return items.map((_) => mapReverse(_, set))
            })
          ))

          const all = Effect.flatMap(
            allE,
            (_) => Effect.forEach(_, (_) => decode(_), { concurrency: "inherit", batching: true }).pipe(Effect.orDie)
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
          const encodeId = flow(S.encode(i), Effect.provide(rctx))
          function findEId(id: From["id"]) {
            return Effect.flatMap(
              store.find(id),
              (item) =>
                Effect.gen(function*($) {
                  const { set } = yield* $(cms)
                  return item.pipe(Option.map((_) => mapReverse(_, set)))
                })
            )
          }
          function findE(id: T["id"]) {
            return pipe(
              encodeId({ id }),
              Effect.orDie,
              Effect.map((_) => _.id),
              Effect.flatMap(findEId)
            )
          }

          function find(id: T["id"]) {
            return Effect.flatMapOption(findE(id), (_) => Effect.orDie(decode(_)))
          }

          const saveAllE = (a: Iterable<From>) =>
            Effect
              .flatMapOption(
                Effect
                  .sync(() => toNonEmptyArray([...a])),
                (a) =>
                  Effect.gen(function*($) {
                    const { get, set } = yield* $(cms)
                    const items = a.map((_) => mapToPersistenceModel(_, get))
                    const ret = yield* $(store.batchSet(items))
                    ret.forEach((_) => set(_.id, _._etag))
                  })
              )
              .pipe(Effect.asUnit)

          const saveAll = (a: Iterable<T>) =>
            Effect
              .forEach(
                Array.from(a),
                (_) => encode(_),
                { concurrency: "inherit", batching: true }
              )
              .pipe(
                Effect.orDie,
                Effect.andThen(saveAllE)
              )

          const saveAndPublish = (items: Iterable<T>, events: Iterable<Evt> = []) => {
            const it = Chunk.fromIterable(items)
            return saveAll(it)
              .pipe(
                Effect.andThen(Effect.sync(() => toNonEmptyArray([...events]))),
                // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
                (_) => Effect.flatMapOption(_, pub),
                Effect.andThen(changeFeed.publish([Chunk.toArray(it), "save"])),
                Effect.asUnit
              )
          }

          function removeAndPublish(a: Iterable<T>, events: Iterable<Evt> = []) {
            return Effect.gen(function*($) {
              const { get, set } = yield* $(cms)
              const it = [...a]
              const items = yield* $(
                Effect.forEach(it, (_) => encode(_), { concurrency: "inherit", batching: true }).pipe(Effect.orDie)
              )
              // TODO: we should have a batchRemove on store so the adapter can actually batch...
              for (const e of items) {
                yield* $(store.remove(mapToPersistenceModel(e, get)))
                set(e.id, undefined)
              }
              yield* $(
                Effect
                  .sync(() => toNonEmptyArray([...events]))
                  // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
                  .pipe((_) => Effect.flatMapOption(_, pub))
              )

              yield* $(changeFeed.publish([it, "remove"]))
            })
          }

          const r: Repository<T, PM, Evt, ItemType> = {
            /**
             * @internal
             */
            utils: {
              parseMany: (items) =>
                Effect.flatMap(cms, (cm) =>
                  Effect
                    .forEach(items, (_) => decode(mapReverse(_, cm.set)), { concurrency: "inherit", batching: true })
                    .pipe(Effect.orDie)),
              parseMany2: (items, schema) =>
                Effect.flatMap(cms, (cm) =>
                  Effect
                    .forEach(items, (_) => S.decode(schema)(mapReverse(_, cm.set) as any), {
                      concurrency: "inherit",
                      batching: true
                    })
                    .pipe(Effect.orDie)),
              filter: <U extends keyof PM = keyof PM>(args: FilterArgs<PM, U>) =>
                store
                  .filter(args)
                  .pipe(Effect.tap((items) =>
                    args.select
                      ? Effect.unit
                      : Effect.map(cms, ({ set }) => items.forEach((_) => set((_ as PM).id, (_ as PM)._etag)))
                  )),
              all: Effect.tap(
                store.all,
                (items) => Effect.map(cms, ({ set }) => items.forEach((_) => set(_.id, _._etag)))
              )
            },
            mapped: <A, R>(schema: S.Schema<A, any, R>) => {
              // const enc = S.encode(schema)
              const dec = S.decode(schema)
              const encMany = S.encode(S.array(schema))
              const decMany = S.decode(S.array(schema))
              return {
                all: cms
                  .pipe(
                    Effect.flatMap((cm) => Effect.map(r.utils.all, (_) => _.map((_) => mapReverse(_, cm.set)))),
                    Effect.flatMap(decMany),
                    Effect.map((_) => _ as any[])
                  ),
                find: (id: PM["id"]) => flatMapOption(findE(id), dec),
                query: (b: any) =>
                  r
                    .utils
                    .filter({ filter: b })
                    .pipe(
                      Effect.flatMap(decMany),
                      Effect.map((_) => _ as any[])
                    ),
                save: (...xes: any[]) => Effect.flatMap(encMany(xes), (_) => saveAllE(_))
              }
            },
            changeFeed,
            itemType: name,
            find,
            all,
            saveAndPublish,
            removeAndPublish,
            q2: (q: any) => query(r, typeof q === "function" ? q(makeQuery()) : q) as any
          }
          return r
        })
        .pipe(Effect
          // .withSpan("Repository.make [effect-app/infra]", { attributes: { "repository.model_name": name } })
          .withLogSpan("Repository.make: " + name))
    }

    return {
      make,
      Where: where,
      Query: Q.QueryBuilder.make<PM>(),
      Q2: Q2.make<Omit<PM, "_etag">>()
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
  return get(self, id).pipe(Effect.flatMap((_) => self.removeAndPublish([_])))
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
        S.encode(schema)(t).pipe(
          Effect.orDie,
          Effect.map((_) => mapToPersistenceModel(_, getEtag))
        )
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
      return Effect.gen(function*($) {
        const { make } = yield* $(StoreMaker)

        const store = yield* $(
          make<PM, string, R | RInitial, EInitial>(
            pluralize(name),
            makeInitial
              ? makeInitial
                .pipe(
                  Effect.flatMap(Effect.forEach(encodeToPM())),
                  Effect.withSpan("Repository.makeInitial [effect-app/infra]", {
                    attributes: { "repository.model_name": name }
                  })
                )
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
  /** @deprecated use `Q2` instead */
  readonly Where: ReturnType<typeof makeWhere<PM>>
  /** @deprecated use `Q2` instead */
  readonly Query: ReturnType<typeof Q.QueryBuilder.make<PM>>
  readonly Q2: ReturnType<typeof Q2.make<PM>>
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

  /** @deprecated use q2 */
  query: (b: (fn: Q.FilterTest<PM>, fields: Q.Filter<PM, never>) => Q.QueryBuilder<PM>) => Effect<T[], never, Service>
  queryLegacy: <S = T>(map: {
    filter?: Filter<PM>
    collect?: (t: T) => Option<S>
    limit?: number
    skip?: number
  }) => Effect<S[], never, Service>

  /** @deprecated use q2 */
  mapped: MM<Service, PM, Omit<PM, "_etag">>

  byIdAndSaveWithPure: {
    <R, A, E, S2 extends T>(
      id: T["id"],
      pure: Effect<A, E, FixEnv<R, Evt, T, S2>>
    ): Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E | NotFoundError<ItemType>,
      | Service
      | Exclude<R, {
        env: PureEnv<Evt, T, S2>
      }>
    >
  }

  q2AndSaveOnePure: {
    <
      R2,
      A,
      E2,
      T2 extends T
    >(
      q: (initial: Query<Omit<PM, "_etag">>) =>
        | Query<Omit<PM, "_etag">>
        | QueryWhere<Omit<PM, "_etag">>,
      pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
    ): Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
      | Service
      | Exclude<R2, {
        env: PureEnv<Evt, T, T2>
      }>
    >
  }
  q2AndSavePure: {
    <
      R2,
      A,
      E2,
      T2 extends T
    >(
      q: (initial: Query<Omit<PM, "_etag">>) =>
        | Query<Omit<PM, "_etag">>
        | QueryWhere<Omit<PM, "_etag">>,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>
    ): Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E2,
      | Service
      | Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
  }

  readonly q2: {
    <A, R, From extends FieldValues>(
      q: (initial: Query<Omit<PM, "_etag">>) => QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    ): Effect.Effect<readonly A[], S.ParseResult.ParseError, Service | R>
    <R = never>(
      q: (initial: Query<Omit<PM, "_etag">>) => QAll<Omit<PM, "_etag">, T, R>
    ): Effect.Effect<readonly T[], never, Service | R>

    <A, R, From extends FieldValues>(
      q: QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    ): Effect.Effect<readonly A[], S.ParseResult.ParseError, Service | R>
    <R = never>(q: QAll<Omit<PM, "_etag">, T, R>): Effect.Effect<readonly T[], never, Service | R>
  }
}

const makeRepoFunctions = (tag: any) => {
  const { all } = Effect.serviceConstants(tag) as any
  const {
    byIdAndSaveWithPure,
    find,
    get,
    q2,
    q2AndSaveOnePure,
    q2AndSavePure,
    query,
    queryLegacy,
    removeAndPublish,
    removeById,
    save,
    saveAndPublish
  } = Effect.serviceFunctions(tag) as any

  const mapped = (s: any) => tag.map((_: any) => _.mapped(s))

  return {
    all,
    byIdAndSaveWithPure,
    find,
    removeById,
    saveAndPublish,
    removeAndPublish,
    save,
    get,
    query,
    queryLegacy,
    q2,
    mapped,
    q2AndSaveOnePure,
    q2AndSavePure
  }
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
      & Context.Tag<Service, Service>
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
      static readonly makeWith = ((a: any, b: any) => Effect.map(mkRepo.make(a), b)) as any

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
      & Context.Tag<Service, Service>
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
      static readonly makeWith = ((a: any, b: any) => Effect.map(mkRepo.make(a), b)) as any

      static readonly Where = makeWhere<PM>()
      static readonly Query = Q.QueryBuilder.make<PM>()

      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }
    return assignTag<Service>()(Object.assign(Cls, makeRepoFunctions(Cls))) as any // impl is missing, but its marked protected
  }
}
