/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// import type { ParserEnv } from "@effect-app/schema/custom/Parser"
import {
  AnyPureDSL,
  byIdAndSaveWithPure,
  get,
  type Repository,
  saveAllWithEffectInt,
  saveManyWithPure_,
  saveManyWithPureBatched_,
  saveWithPure_
} from "./Repository.js"
import { StoreMaker } from "./Store.js"
import type { FilterArgs, PersistenceModelType, StoreConfig } from "./Store.js"
import type {} from "effect/Equal"
import type {} from "effect/Hash"
import { toNonEmptyArray } from "@effect-app/core/Array"
import { flatMapOption } from "@effect-app/core/Effect"
import type { ParseResult, Schema } from "@effect-app/schema"
import { NonNegativeInt } from "@effect-app/schema"
import type { Context, NonEmptyArray, NonEmptyReadonlyArray } from "effect-app"
import { Chunk, Effect, flow, Option, pipe, PubSub, ReadonlyArray, S, Unify } from "effect-app"
import { runTerm } from "effect-app/Pure"
import type { FixEnv, PureEnv } from "effect-app/Pure"
import { assignTag } from "effect-app/service"
import type { NoInfer } from "effect/Types"
import { type InvalidStateError, NotFoundError, type OptimisticConcurrencyException } from "../errors.js"
import type { FieldValues } from "../filter/types.js"
import { make as makeQuery } from "./query.js"
import type { QAll, Query, QueryEnd, QueryProjection, QueryWhere } from "./query.js"
import * as Q from "./query.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"
import type * as QB from "./Store/filterApi/query.js"

export interface Mapped1<PM extends { id: string }, X, R> {
  all: Effect<X[], ParseResult.ParseError, R>
  save: (...xes: readonly X[]) => Effect<void, OptimisticConcurrencyException | ParseResult.ParseError, R>
  query: (
    b: (fn: QB.FilterTest<PM>, fields: QB.Filter<PM, never>) => QB.QueryBuilder<PM>
  ) => Effect<X[], ParseResult.ParseError, R>
  find: (id: PM["id"]) => Effect<Option<X>, ParseResult.ParseError, R>
}

// TODO: auto use project, and select fields from the From side of schema only
export interface Mapped2<PM extends { id: string }, X, R> {
  all: Effect<X[], ParseResult.ParseError, R>
  query: (
    b: (fn: QB.FilterTest<PM>, fields: QB.Filter<PM, never>) => QB.QueryBuilder<PM>
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
  abstract readonly changeFeed: PubSub.PubSub<[T[], "save" | "remove"]>
  abstract readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void>

  abstract readonly query: {
    <A, R, From extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Query<Omit<PM, "_etag">>
      ) => QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R
    >
    <R = never, TType extends "one" | "many" = "many">(
      q: (initial: Query<Omit<PM, "_etag">>) => QAll<Omit<PM, "_etag">, T, R, TType>
    ): Effect.Effect<TType extends "many" ? readonly T[] : T, TType extends "many" ? never : NotFoundError<ItemType>, R>
    // <R = never>(q: QAll<Omit<PM, "_etag">, T, R>): Effect.Effect<readonly T[], never, R>
    // <A, R, From extends FieldValues>(
    //   q: QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    // ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
  }

  /** @deprecated use query */
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
    this.changeFeed = this.impl.changeFeed
    this.mapped = this.impl.mapped
    this.query = this.impl.query
  }
  // makes super calls a compiler error, as it should
  override saveAndPublish
  override removeAndPublish
  override find
  override all
  override changeFeed
  override mapped
  override query
}

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

  readonly save = (...items: NonEmptyArray<T>) => this.saveAndPublish(items)

  readonly saveWithEvents = (events: Iterable<Evt>) => (...items: NonEmptyArray<T>) =>
    this.saveAndPublish(items, events)

  readonly queryAndSavePure: {
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => QueryEnd<Omit<PM, "_etag">, "one">,
      pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | NotFoundError<ItemType> | E2,
      Exclude<R2, {
        env: PureEnv<Evt, T, T2>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => Query<Omit<PM, "_etag">> | QueryWhere<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E2,
      Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => Query<Omit<PM, "_etag">> | QueryWhere<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
      batched: "batched" | number
    ): Effect.Effect<
      A[],
      InvalidStateError | OptimisticConcurrencyException | E2,
      Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
  } = (q, pure, batched?) =>
    this.query(q).pipe(
      Effect.andThen((_) =>
        Array.isArray(_)
          ? batched === undefined
            ? saveManyWithPure_(this, _, pure as any)
            : saveManyWithPureBatched_(this, _, pure as any, batched as any)
          : saveWithPure_(this, _ as any, pure as any)
      )
    ) as any

  /**
   * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
   */
  readonly handleByIdAndSaveWithPure = <Req extends { id: T["id"] }, Context, R, A, E, S2 extends T>(
    pure: (req: Req, ctx: Context) => Effect<A, E, FixEnv<R, Evt, T, S2>>
  ) =>
  (req: Req, ctx: Context) => byIdAndSaveWithPure(this, req.id)(pure(req, ctx))

  saveManyWithPure: {
    <R, A, E, S1 extends T, S2 extends T>(
      items: Iterable<S1>,
      pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E,
      Exclude<R, {
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
      Exclude<R, {
        env: PureEnv<Evt, readonly S1[], readonly S2[]>
      }>
    >
  } = (items, pure, batch?: "batched" | number) =>
    batch
      ? Effect.forEach(
        ReadonlyArray.chunk_(items, batch === "batched" ? 100 : batch),
        (batch) =>
          saveAllWithEffectInt(
            this,
            runTerm(pure, batch)
          )
      )
      : saveAllWithEffectInt(
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
          const encodeMany = flow(S.encode(S.array(schema)), Effect.provide(rctx), Effect.withSpan("encodeMany"))
          const decode = flow(S.decode(schema), Effect.provide(rctx))
          const decodeMany = flow(
            S.decode(S.array(schema)),
            Effect.provide(rctx),
            Effect.withSpan("decodeMany")
          )

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

          const allE = cms
            .pipe(Effect.flatMap((cm) => Effect.map(store.all, (_) => _.map((_) => mapReverse(_, cm.set)))))

          const all = Effect
            .flatMap(
              allE,
              (_) => decodeMany(_).pipe(Effect.orDie)
            )
            .pipe(Effect.map((_) => _ as T[]))

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
            encodeMany(Array.from(a))
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
              const items = yield* $(encodeMany(it).pipe(Effect.orDie))
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

          const parseMany = (items: readonly PM[]) =>
            Effect
              .flatMap(cms, (cm) =>
                decodeMany(items.map((_) => mapReverse(_, cm.set)))
                  .pipe(Effect.orDie, Effect.withSpan("parseMany")))
          const parseMany2 = <A, R>(
            items: readonly PM[],
            schema: S.Schema<A, Omit<PM, "_etag">, R>
          ) =>
            Effect
              .flatMap(cms, (cm) =>
                S
                  .decode(S.array(schema))(
                    items.map((_) => mapReverse(_, cm.set) as unknown as Omit<PM, "_etag">)
                  )
                  .pipe(Effect.orDie, Effect.withSpan("parseMany2")))
          const filter = <U extends keyof PM = keyof PM>(args: FilterArgs<PM, U>) =>
            store
              .filter(args)
              .pipe(Effect.tap((items) =>
                args.select
                  ? Effect.unit
                  : Effect.map(cms, ({ set }) => items.forEach((_) => set((_ as PM).id, (_ as PM)._etag)))
              ))

          // TODO: For raw we should use S.from, and drop the R...
          const query: {
            <
              A,
              R,
              From extends FieldValues
            >(
              q: QueryProjection<PM extends From ? From : never, A, R>
            ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
            <
              A,
              R
            >(
              q: QAll<NoInfer<PM>, A, R>
            ): Effect.Effect<readonly A[], never, R>
          } = (<
            A,
            R
          >(q: QAll<PM, A, R>) => {
            const a = Q.toFilter(q)
            const eff = a.mode === "raw"
              ? filter(a)
                // TODO: mapFrom but need to support per field and dependencies
                .pipe(Effect.andThen(flow(S.decode(S.array(S.from(a.schema ?? schema))), Effect.provide(rctx))))
              : Effect.flatMap(
                filter(a),
                (_) =>
                  Unify
                    .unify(
                      a.schema
                        ? parseMany2(
                          _,
                          a.schema as any
                        )
                        : parseMany(_)
                    )
              )
            return pipe(
              a.ttype === "one"
                ? Effect.andThen(
                  eff,
                  flow(
                    toNonEmptyArray,
                    Effect.mapError(() => new NotFoundError({ id: "query", /* TODO */ type: name })),
                    Effect.map((_) => _[0])
                  )
                )
                : a.ttype === "count"
                ? Effect
                  .andThen(eff, (_) => NonNegativeInt(_.length))
                  .pipe(Effect.catchTag("ParseError", (e) => Effect.die(e)))
                : eff,
              Effect.withSpan("Repository.query [effect-app/infra]", {
                attributes: {
                  "repository.model_name": name,
                  query: { ...a, schema: a.schema ? "__SCHEMA__" : a.schema }
                }
              })
            )
          }) as any

          const r: Repository<T, PM, Evt, ItemType> = {
            changeFeed,
            itemType: name,
            find,
            all,
            saveAndPublish,
            removeAndPublish,
            query: (q: any) => query(typeof q === "function" ? q(makeQuery()) : q) as any,

            /**
             * @internal
             */
            mapped: <A, R>(schema: S.Schema<A, any, R>) => {
              const dec = S.decode(schema)
              const encMany = S.encode(S.array(schema))
              const decMany = S.decode(S.array(schema))
              return {
                all: allE.pipe(
                  Effect.flatMap(decMany),
                  Effect.map((_) => _ as any[])
                ),
                find: (id: PM["id"]) => flatMapOption(findE(id), dec),
                query: (b: any) =>
                  filter({ filter: b })
                    .pipe(
                      Effect.flatMap(decMany),
                      Effect.map((_) => _ as any[])
                    ),
                save: (...xes: any[]) => Effect.flatMap(encMany(xes), (_) => saveAllE(_))
              }
            }
          }
          return r
        })
        .pipe(Effect
          // .withSpan("Repository.make [effect-app/infra]", { attributes: { "repository.model_name": name } })
          .withLogSpan("Repository.make: " + name))
    }

    return {
      make,
      Q: Q.make<Omit<PM, "_etag">>()
    }
  }
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
  readonly Q: ReturnType<typeof Q.make<PM>>
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

  queryAndSavePure: {
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => QueryEnd<Omit<PM, "_etag">, "one">,
      pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | NotFoundError<ItemType> | E2,
      | Service
      | Exclude<R2, {
        env: PureEnv<Evt, T, T2>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => Query<Omit<PM, "_etag">> | QueryWhere<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E2,
      | Service
      | Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
    <A, E2, R2, T2 extends T>(
      q: (
        q: Query<Omit<PM, "_etag">>
      ) => Query<Omit<PM, "_etag">> | QueryWhere<Omit<PM, "_etag">> | QueryEnd<Omit<PM, "_etag">, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
      batchSize: number
    ): Effect.Effect<
      A[],
      InvalidStateError | OptimisticConcurrencyException | E2,
      | Service
      | Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
  }

  readonly query: {
    <A, R, From extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Query<Omit<PM, "_etag">>
      ) => QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      Service | R
    >
    <R = never, TType extends "one" | "many" = "many">(
      q: (initial: Query<Omit<PM, "_etag">>) => QAll<Omit<PM, "_etag">, T, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly T[] : T,
      TType extends "many" ? never : NotFoundError<ItemType>,
      Service | R
    >
    // <R = never>(q: QAll<Omit<PM, "_etag">, T, R>): Effect.Effect<readonly T[], never, Service | R>
    // <A, R, From extends FieldValues>(
    //   q: QueryProjection<Omit<PM, "_etag"> extends From ? From : never, A, R>
    // ): Effect.Effect<readonly A[], S.ParseResult.ParseError, Service | R>
  }

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

  saveManyWithPure: {
    <R, A, E, S1 extends T, S2 extends T>(
      items: Iterable<S1>,
      pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
    ): Effect.Effect<
      A,
      InvalidStateError | OptimisticConcurrencyException | E,
      Exclude<R, {
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
      Exclude<R, {
        env: PureEnv<Evt, readonly S1[], readonly S2[]>
      }>
    >
  }

  /** @experimental */
  mapped: MM<Service, PM, Omit<PM, "_etag">>

  use: <X>(
    body: (_: Service) => X
  ) => X extends Effect<infer A, infer E, infer R> ? Effect<A, E, R | Service> : Effect<X, never, Service>
}

const makeRepoFunctions = (tag: any) => {
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
    mapped,
    queryAndSavePure,
    saveManyWithPure,
    use: (body: any) => Effect.andThen(tag, body)
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

      static readonly Q = Q.make<From>()
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

      static readonly Q = Q.make<From>()

      static readonly type: Repository<T, PM, Evt, ItemType> = undefined as any
    }
    return assignTag<Service>()(Object.assign(Cls, makeRepoFunctions(Cls))) as any // impl is missing, but its marked protected
  }
}
