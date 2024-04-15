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
import type { NonEmptyArray, NonEmptyReadonlyArray } from "effect-app"
import {
  Chunk,
  Context,
  Effect,
  Exit,
  flow,
  Option,
  pipe,
  PubSub,
  ReadonlyArray,
  Request,
  RequestResolver,
  S,
  Unify
} from "effect-app"
import { runTerm } from "effect-app/Pure"
import type { FixEnv, PureEnv } from "effect-app/Pure"
import type { NoInfer } from "effect/Types"
import { type InvalidStateError, NotFoundError, type OptimisticConcurrencyException } from "../errors.js"
import type { FieldValues } from "../filter/types.js"
import { make as makeQuery } from "./query.js"
import type { QAll, Query, QueryEnd, QueryProjection, QueryWhere } from "./query.js"
import * as Q from "./query.js"
import { ContextMapContainer } from "./Store/ContextMapContainer.js"

export interface Mapped1<A, Encoded extends { id: string }, R> {
  all: Effect<A[], ParseResult.ParseError, R>
  save: (...xes: readonly A[]) => Effect<void, OptimisticConcurrencyException | ParseResult.ParseError, R>
  // query: (
  //   b: (fn: QB.FilterTest<Encoded>, fields: QB.Filter<Encoded, never>) => QB.QueryBuilder<Encoded>
  // ) => Effect<A[], ParseResult.ParseError, R>
  find: (id: Encoded["id"]) => Effect<Option<A>, ParseResult.ParseError, R>
}

// TODO: auto use project, and select fields from the From side of schema only
export interface Mapped2<A, R> {
  all: Effect<A[], ParseResult.ParseError, R>
  // query: (
  //   b: (fn: QB.FilterTest<Encoded>, fields: QB.Filter<Encoded, never>) => QB.QueryBuilder<Encoded>
  // ) => Effect<A[], ParseResult.ParseError, R>
}

export interface Mapped<Encoded extends { id: string }> {
  <A, R>(schema: S.Schema<A, Encoded, R>): Mapped1<A, Encoded, R>
  // TODO: constrain on Encoded2 having to contain only fields that fit Encoded
  <A, Encoded2, R>(schema: S.Schema<A, Encoded2, R>): Mapped2<A, R>
}

export interface MM<Repo, Encoded extends { id: string }> {
  <A, R>(schema: S.Schema<A, Encoded, R>): Effect<Mapped1<A, Encoded, R>, never, Repo>
  // TODO: constrain on Encoded2 having to contain only fields that fit Encoded
  <A, Encoded2, R>(schema: S.Schema<A, Encoded2, R>): Effect<Mapped2<A, R>, never, Repo>
}

/**
 * @tsplus type Repository
 */
export abstract class RepositoryBaseC<
  T extends { id: unknown },
  Encoded extends { id: string },
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
    <A, R, Encoded2 extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Query<Encoded>
      ) => QueryProjection<Encoded extends Encoded2 ? Encoded2 : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R
    >
    <R = never, TType extends "one" | "many" = "many">(
      q: (initial: Query<Encoded>) => QAll<Encoded, T, R, TType>
    ): Effect.Effect<TType extends "many" ? readonly T[] : T, TType extends "many" ? never : NotFoundError<ItemType>, R>
    // <R = never>(q: QAll<Encoded, T, R>): Effect.Effect<readonly T[], never, R>
    // <A, R, Encoded2 extends FieldValues>(
    //   q: QueryProjection<Encoded extends Encoded2 ? Encoded2 : never, A, R>
    // ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
  }

  /** @deprecated use query */
  abstract readonly mapped: Mapped<Encoded>
}

export abstract class RepositoryBaseC1<
  T extends { id: unknown },
  Encoded extends { id: string },
  Evt,
  ItemType extends string
> extends RepositoryBaseC<T, Encoded, Evt, ItemType> {
  constructor(
    public readonly itemType: ItemType
  ) {
    super()
  }
}

export class RepositoryBaseC2<
  T extends { id: unknown },
  Encoded extends { id: string },
  Evt,
  ItemType extends string
> extends RepositoryBaseC1<T, Encoded, Evt, ItemType> {
  constructor(
    itemType: ItemType,
    protected readonly impl: Repository<T, Encoded, Evt, ItemType>
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
  Encoded extends { id: string },
  Evt,
  ItemType extends string
> extends RepositoryBaseC2<T, Encoded, Evt, ItemType> {
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
        q: Query<Encoded>
      ) => QueryEnd<Encoded, "one">,
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
        q: Query<Encoded>
      ) =>
        | Query<Encoded>
        | QueryWhere<Encoded>
        | QueryEnd<Encoded, "many">,
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
        q: Query<Encoded>
      ) =>
        | Query<Encoded>
        | QueryWhere<Encoded>
        | QueryEnd<Encoded, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
      batch: "batched" | number
    ): Effect.Effect<
      A[],
      InvalidStateError | OptimisticConcurrencyException | E2,
      Exclude<R2, {
        env: PureEnv<Evt, readonly T[], readonly T2[]>
      }>
    >
  } = (q, pure, batch?: "batched" | number) =>
    this.query(q).pipe(
      Effect.andThen((_) =>
        Array.isArray(_)
          ? batch === undefined
            ? saveManyWithPure_(this, _, pure as any)
            : saveManyWithPureBatched_(this, _, pure as any, batch === "batched" ? 100 : batch)
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

/**
 * A base implementation to create a repository.
 */
export function makeRepo<
  Evt = never
>() {
  return <
    ItemType extends string,
    R,
    Encoded extends { id: string },
    T extends { id: unknown }
  >(
    name: ItemType,
    schema: S.Schema<T, Encoded, R>,
    mapFrom: (pm: Encoded) => Encoded,
    mapTo: (e: Encoded, etag: string | undefined) => PersistenceModelType<Encoded>
  ) => {
    type PM = PersistenceModelType<Encoded>
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
      return mapFrom(e as unknown as Encoded)
    }

    const mkStore = makeStore<Encoded>()(name, schema, mapTo)

    function make<RInitial = never, E = never, R2 = never>(
      args: [Evt] extends [never] ? {
          makeInitial?: Effect<readonly T[], E, RInitial>
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
          }
        }
        : {
          publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
          makeInitial?: Effect<readonly T[], E, RInitial>
          config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
            partitionValue?: (a: Encoded) => string
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

          const fieldsSchema = schema as unknown as { fields: any }
          const i = ("fields" in fieldsSchema ? S.struct(fieldsSchema["fields"]) as unknown as typeof schema : schema)
            .pipe((_) =>
              _.ast._tag === "Union"
                // we need to get the TypeLiteral, incase of class it's behind a transform...
                ? S.union(..._.ast.types.map((_) =>
                  (S.make(_._tag === "Transformation" ? _.from : _) as unknown as Schema<T, Encoded>)
                    .pipe(S.pick("id"))
                ))
                : _
                    .ast
                    ._tag === "Transformation"
                ? (S
                  .make(
                    _
                      .ast
                      .from
                  ) as unknown as Schema<T, Encoded>)
                  .pipe(S
                    .pick("id"))
                : _
                  .pipe(S
                    .pick("id"))
            )
          const encodeId = flow(S.encode(i), Effect.provide(rctx))
          function findEId(id: Encoded["id"]) {
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

          const saveAllE = (a: Iterable<Encoded>) =>
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
            return Effect
              .suspend(() => {
                const it = Chunk.fromIterable(items)
                return saveAll(it)
                  .pipe(
                    Effect.andThen(Effect.sync(() => toNonEmptyArray([...events]))),
                    // TODO: for full consistency the events should be stored within the same database transaction, and then picked up.
                    (_) => Effect.flatMapOption(_, pub),
                    Effect.andThen(changeFeed.publish([Chunk.toArray(it), "save"])),
                    Effect.asUnit
                  )
              })
              .pipe(Effect.withSpan("saveAndPublish"))
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
            schema: S.Schema<A, Encoded, R>
          ) =>
            Effect
              .flatMap(cms, (cm) =>
                S
                  .decode(S.array(schema))(
                    items.map((_) => mapReverse(_, cm.set))
                  )
                  .pipe(Effect.orDie, Effect.withSpan("parseMany2")))
          const filter = <U extends keyof Encoded = keyof Encoded>(args: FilterArgs<Encoded, U>) =>
            store
              .filter(args)
              .pipe(Effect.tap((items) =>
                args.select
                  ? Effect.unit
                  : Effect.map(cms, ({ set }) => items.forEach((_) => set((_ as Encoded).id, (_ as PM)._etag)))
              ))

          // TODO: For raw we should use S.from, and drop the R...
          const query: {
            <A, R, From extends FieldValues>(
              q: QueryProjection<Encoded extends From ? From : never, A, R>
            ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
            <A, R>(q: QAll<NoInfer<Encoded>, A, R>): Effect.Effect<readonly A[], never, R>
          } = (<A, R>(q: QAll<Encoded, A, R>) => {
            const a = Q.toFilter(q)
            const eff = a.mode === "project"
              ? filter(a)
                // TODO: mapFrom but need to support per field and dependencies
                .pipe(Effect.andThen(flow(S.decode(S.array(a.schema ?? schema)), Effect.provide(rctx))))
              : a.mode === "collect"
              ? filter(a)
                // TODO: mapFrom but need to support per field and dependencies
                .pipe(
                  Effect.flatMap(flow(
                    S.decode(S.array(a.schema)),
                    Effect.map(ReadonlyArray.getSomes),
                    Effect.provide(rctx)
                  ))
                )
              : Effect.flatMap(
                filter(a),
                (_) =>
                  Unify.unify(
                    a.schema
                      // TODO: partial may not match?
                      ? parseMany2(_ as any, a.schema as any)
                      : parseMany(_ as any)
                  )
              )
            return pipe(
              a.ttype === "one"
                ? Effect.andThen(
                  eff,
                  flow(
                    ReadonlyArray.head,
                    Effect.mapError(() => new NotFoundError({ id: "query", /* TODO */ type: name }))
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
                  query: { ...a, schema: a.schema ? "__SCHEMA__" : a.schema, filter: a.filter?.build() }
                }
              })
            )
          }) as any

          const r: Repository<T, Encoded, Evt, ItemType> = {
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
                find: (id: Encoded["id"]) => flatMapOption(findE(id), dec),
                // query: (q: any) => {
                //   const a = Q.toFilter(q)

                //   return filter(a)
                //     .pipe(
                //       Effect.flatMap(decMany),
                //       Effect.map((_) => _ as any[]),
                //       Effect.withSpan("Repository.mapped.query [effect-app/infra]", {
                //         attributes: {
                //           "repository.model_name": name,
                //           query: { ...a, schema: a.schema ? "__SCHEMA__" : a.schema, filter: a.filter.build() }
                //         }
                //       })
                //     )
                // },
                save: (...xes: any[]) =>
                  Effect.flatMap(encMany(xes), (_) => saveAllE(_)).pipe(Effect.withSpan("mapped.save"))
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
      Q: Q.make<Encoded>()
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
  Encoded extends { id: string }
>() {
  return <
    ItemType extends string,
    R,
    E extends { id: string },
    T extends { id: unknown }
  >(
    name: ItemType,
    schema: S.Schema<T, E, R>,
    mapTo: (e: E, etag: string | undefined) => Encoded
  ) => {
    function encodeToEncoded() {
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
    ): Encoded {
      return mapTo(e, getEtag(e.id))
    }

    function makeStore<RInitial = never, EInitial = never>(
      makeInitial?: Effect<readonly T[], EInitial, RInitial>,
      config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
        partitionValue?: (a: Encoded) => string
      }
    ) {
      return Effect.gen(function*($) {
        const { make } = yield* $(StoreMaker)

        const store = yield* $(
          make<Encoded, string, R | RInitial, EInitial>(
            pluralize(name),
            makeInitial
              ? makeInitial
                .pipe(
                  Effect.flatMap(Effect.forEach(encodeToEncoded())),
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
  Encoded extends { id: string },
  R,
  Evt,
  ItemType extends string
> {
  make<RInitial = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
      }
  ): Effect<Repository<T, Encoded, Evt, ItemType>, E, StoreMaker | ContextMapContainer | R | RInitial | R2>
  makeWith<Out, RInitial = never, E = never, R2 = never>(
    args: [Evt] extends [never] ? {
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
      }
      : {
        publishEvents: (evt: NonEmptyReadonlyArray<Evt>) => Effect<void, never, R2>
        makeInitial?: Effect<readonly T[], E, RInitial>
        config?: Omit<StoreConfig<Encoded>, "partitionValue"> & {
          partitionValue?: (a: Encoded) => string
        }
      },
    f: (r: Repository<T, Encoded, Evt, ItemType>) => Out
  ): Effect<Out, E, StoreMaker | ContextMapContainer | R | RInitial | R2>
  readonly Q: ReturnType<typeof Q.make<Encoded>>
  readonly type: Repository<T, Encoded, Evt, ItemType>
}

export type GetRepoType<T> = T extends { type: infer R } ? R : never

export interface RepoFunctions<T extends { id: unknown }, Encoded extends { id: string }, Evt, ItemType, Service> {
  itemType: ItemType
  T: T
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
        q: Query<Encoded>
      ) => QueryEnd<Encoded, "one">,
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
        q: Query<Encoded>
      ) =>
        | Query<Encoded>
        | QueryWhere<Encoded>
        | QueryEnd<Encoded, "many">,
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
        q: Query<Encoded>
      ) =>
        | Query<Encoded>
        | QueryWhere<Encoded>
        | QueryEnd<Encoded, "many">,
      pure: Effect<A, E2, FixEnv<R2, Evt, readonly T[], readonly T2[]>>,
      batch: "batched" | number
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
        initial: Query<Encoded>
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      Service | R
    >
    <R = never, TType extends "one" | "many" = "many">(
      q: (initial: Query<Encoded>) => QAll<Encoded, T, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly T[] : T,
      TType extends "many" ? never : NotFoundError<ItemType>,
      Service | R
    >
    // <R = never>(q: QAll<Encoded, T, R>): Effect.Effect<readonly T[], never, Service | R>
    // <A, R, From extends FieldValues>(
    //   q: QueryProjection<Encoded extends From ? From : never, A, R>
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
  mapped: MM<Service, Encoded>

  use: <X>(
    body: (_: Service) => X
  ) => X extends Effect<infer A, infer E, infer R> ? Effect<A, E, R | Service> : Effect<X, never, Service>
}

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

  const mapped = (s: any) => tag.map((_: any) => _.mapped(s))

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

export const RepositoryBaseImpl = <Service>() => {
  return <
    Evt = never
  >() =>
  <ItemType extends string, R, Encoded extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, R>,
    jitM?: (pm: Encoded) => Encoded
  ):
    & (abstract new() => RepositoryBaseC1<T, Encoded, Evt, ItemType>)
    & Context.Tag<Service, Service>
    & Repos<
      T,
      Encoded,
      R,
      Evt,
      ItemType
    >
    & RepoFunctions<T, Encoded, Evt, ItemType, Service> =>
  {
    const mkRepo = makeRepo<Evt>()(
      itemType,
      schema,
      jitM ? (pm) => jitM(pm as unknown as Encoded) : (pm) => pm as any,
      (e, _etag) => ({ ...e, _etag })
    )
    abstract class Cls extends RepositoryBaseC1<T, Encoded, Evt, ItemType> {
      constructor() {
        super(itemType)
      }
      static readonly make = mkRepo.make
      static readonly makeWith = ((a: any, b: any) => Effect.map(mkRepo.make(a), b)) as any

      static readonly Q = Q.make<Encoded>()
      static readonly type: Repository<T, Encoded, Evt, ItemType> = undefined as any
    }
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    return Context.assignTag<Service>(undefined, creationError)(
      Object.assign(Cls, makeRepoFunctions(Cls, itemType))
    ) as any
  }
}

export const RepositoryDefaultImpl = <Service, Evt = never>() => {
  return <ItemType extends string, R, Encoded extends { id: string }, T extends { id: unknown }>(
    itemType: ItemType,
    schema: S.Schema<T, Encoded, R>,
    jitM?: (pm: Encoded) => Encoded
  ):
    & (abstract new(
      impl: Repository<T, Encoded, Evt, ItemType>
    ) => RepositoryBaseC3<T, Encoded, Evt, ItemType>)
    & Context.Tag<Service, Service>
    & Repos<
      T,
      Encoded,
      R,
      Evt,
      ItemType
    >
    & RepoFunctions<T, Encoded, Evt, ItemType, Service> =>
  {
    const mkRepo = makeRepo<Evt>()(
      itemType,
      schema,
      jitM ? (pm) => jitM(pm) : (pm) => pm,
      (e, _etag) => ({ ...e, _etag })
    )
    abstract class Cls extends RepositoryBaseC3<T, Encoded, Evt, ItemType> {
      constructor(
        impl: Repository<T, Encoded, Evt, ItemType>
      ) {
        super(itemType, impl)
      }
      static readonly make = mkRepo.make
      static readonly makeWith = ((a: any, b: any) => Effect.map(mkRepo.make(a), b)) as any

      static readonly Q = Q.make<Encoded>()

      static readonly type: Repository<T, Encoded, Evt, ItemType> = undefined as any
    }
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    return Context.assignTag<Service>(undefined, creationError)(
      Object.assign(Cls, makeRepoFunctions(Cls, itemType))
    ) as any // impl is missing, but its marked protected
  }
}

// TODO: integrate with repo
export const makeRequest = <
  ItemType extends string,
  T extends { id: unknown },
  Encoded extends { id: string } & FieldValues,
  Evt,
  Service
>(repo: Context.Tag<Service, Service> & RepoFunctions<T, Encoded, Evt, ItemType, Service>) => {
  type Req =
    & Request.Request<T, NotFoundError<ItemType>>
    & { _tag: `Get${ItemType}`; id: T["id"] }
  const _request = Request.tagged<Req>(`Get${repo.itemType}`)

  const requestResolver = RequestResolver
    .makeBatched((requests: Req[]) =>
      (repo
        .query(Q.where("id", "in", requests.map((_) => _.id)) as any) as Effect<readonly T[], never, Service>) // TODO
        .pipe(
          Effect.andThen((items) =>
            Effect.forEach(requests, (r) =>
              Request.complete(
                r,
                ReadonlyArray
                  .findFirst(items, (_) => _.id === r.id)
                  .pipe(Option.match({
                    onNone: () => Exit.fail(new NotFoundError({ type: repo.itemType, id: r.id })),
                    onSome: Exit.succeed
                  }))
              ), { discard: true })
          ),
          Effect
            .catchAllCause((cause) =>
              Effect.forEach(requests, Request.complete(Exit.failCause(cause)), { discard: true })
            )
        )
    )
    .pipe(
      RequestResolver.batchN(20),
      RequestResolver.contextFromServices(repo)
    )

  return (id: T["id"]) => Effect.request(_request({ id }), requestResolver)
}
