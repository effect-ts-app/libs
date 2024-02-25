/* eslint-disable @typescript-eslint/no-explicit-any */
// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import { toNonEmptyArray } from "@effect-app/core/Array"
import { NonNegativeInt } from "@effect-app/schema"
import { Effect, ReadonlyArray } from "effect-app"
import type { NonEmptyArray, NonEmptyReadonlyArray, Option } from "effect-app"
import { type FixEnv, type PureEnv, runTerm } from "effect-app/Pure"
import type { InvalidStateError, OptimisticConcurrencyException } from "../../errors.js"
import { NotFoundError } from "../../errors.js"
import type { Filter, PersistenceModelType } from "../../services/Store.js"
import type { RepositoryBaseC } from "../RepositoryBase.js"
import type { QueryBuilder } from "../Store/filterApi/query.js"
import { AnyPureDSL } from "./dsl.js"

/**
 * @tsplus fluent Repository get
 */
export function get<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  id: T["id"]
) {
  return self
    .find(id)
    .pipe(Effect.flatMap((_) => Effect.mapError(_, () => new NotFoundError<ItemType>({ type: self.itemType, id }))))
}

/**
 * @tsplus getter Repository log
 */
export function log<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(_: RepositoryBaseC<T, PM, Evt, ItemType>) {
  return (evt: Evt) => AnyPureDSL.log(evt)
}

/**
 * TODO: project inside the db.
 * @tsplus fluent Repository projectEffect
 */
export function projectEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = PM
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
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
export function projectEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  U extends keyof PM,
  S = PM
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: Effect<
    {
      filter?: QueryBuilder<PM> | undefined
      collect?: ((t: PM) => Option<S>) | undefined
      limit?: number | undefined
      skip?: number | undefined
    },
    E,
    R
  >
): Effect<Pick<PM, U>[], E, R>
export function projectEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  U extends keyof PM,
  S = Pick<PM, U>
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
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
    self
      .utils
      .filter(f)
      .pipe(Effect.map((_) => f.collect ? ReadonlyArray.filterMap(_, f.collect) : _ as unknown as S[])))
}

/**
 * TODO: project inside the db.
 * @tsplus fluent Repository project
 */
export function project<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = PM
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: {
    filter?: Filter<PM>
    collect?: (t: PM) => Option<S>
    limit?: number
    skip?: number
  }
): Effect<S[]>
export function project<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  U extends keyof PM
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: {
    filter?: QueryBuilder<PM>
    select: NonEmptyReadonlyArray<U>
    limit?: number
    skip?: number
  }
): Effect<Pick<PM, U>[]>
export function project<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  U extends keyof PM,
  S = Pick<PM, U>
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: {
    filter?: Filter<PM>
    select?: NonEmptyReadonlyArray<U>
    collect?: (t: Pick<PM, U>) => Option<S>
    limit?: number
    skip?: number
  }
): Effect<S[]> {
  return projectEffect(self, Effect.sync(() => map))
}

/**
 * TODO: count inside the db.
 * @tsplus fluent Repository project
 */
export function count<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  filter?: Filter<PM>
) {
  return projectEffect(self, Effect.sync(() => ({ filter })))
    .pipe(Effect.map((_) => NonNegativeInt(_.length)))
}

/**
 * @tsplus fluent Repository queryEffect
 */
export function queryEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
) {
  return Effect.flatMap(map, (f) =>
    (f.filter ? self.utils.filter(f) : self.utils.all)
      .pipe(
        Effect.flatMap((_) => self.utils.parseMany(_)),
        Effect.map((_) => f.collect ? ReadonlyArray.filterMap(_, f.collect) : _ as unknown[] as S[])
      ))
}

/**
 * @tsplus fluent Repository queryOneEffect
 */
export function queryOneEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<{ filter?: Filter<PM> }, E, R>
): Effect<T, E | NotFoundError<ItemType>, R>
export function queryOneEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<{ filter?: Filter<PM>; collect: (t: T) => Option<S> }, E, R>
): Effect<S, E | NotFoundError<ItemType>, R>
export function queryOneEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<{ filter?: Filter<PM>; collect?: (t: T) => Option<S> }, E, R>
): Effect<S, E | NotFoundError<ItemType>, R> {
  return Effect.flatMap(map, (f) =>
    (f.filter ? self.utils.filter({ filter: f.filter, limit: 1 }) : self.utils.all)
      .pipe(
        Effect.flatMap((_) => self.utils.parseMany(_)),
        Effect
          .flatMap((_) =>
            toNonEmptyArray(
              f.collect
                ? ReadonlyArray.filterMap(_, f.collect)
                : _ as unknown[] as S[]
            )
              .pipe(
                Effect.mapError(() => new NotFoundError<ItemType>({ type: self.itemType, id: f.filter })),
                Effect
                  .map((_) => _[0])
              )
          )
      ))
}

/**
 * @tsplus fluent Repository query
 */
export function query<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
) {
  return queryEffect(self, Effect.sync(() => map))
}

/**
 * @tsplus fluent Repository queryOne
 */
export function queryOne<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter?: Filter<PM>; collect: (t: T) => Option<S> }
): Effect<S, NotFoundError<ItemType>>
export function queryOne<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter?: Filter<PM> }
): Effect<T, NotFoundError<ItemType>>
export function queryOne<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter?: Filter<PM>; collect?: (t: T) => Option<S> }
) {
  return queryOneEffect(self, Effect.sync(() => map))
}

/**
 * @tsplus fluent Repository queryAndSaveOnePureEffect
 */
export function queryAndSaveOnePureEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
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
export function queryAndSaveOnePureEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
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
export function queryAndSaveOnePureEffect(
  self: any,
  map: any
) {
  return (pure: any) =>
    queryOneEffect(self, map)
      .pipe(Effect.flatMap((_) => saveWithPure_(self, _, pure)))
}

/**
 * @tsplus fluent Repository queryAndSaveOnePure
 */
export function queryAndSaveOnePure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter: Filter<PM>; collect: (t: T) => Option<S>; limit?: number; skip?: number }
): <R2, A, E2, S2>(pure: Effect<A, E2, FixEnv<R2, Evt, S, S2>>) => Effect<
  A,
  InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
  Exclude<R2, {
    env: PureEnv<Evt, S, S2>
  }>
>
export function queryAndSaveOnePure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter: Filter<PM> }
): <R2, A, E2, T2>(pure: Effect<A, E2, FixEnv<R2, Evt, T, T2>>) => Effect<
  A,
  InvalidStateError | OptimisticConcurrencyException | E2 | NotFoundError<ItemType>,
  Exclude<R2, {
    env: PureEnv<Evt, T, T2>
  }>
>
export function queryAndSaveOnePure(
  self: any,
  map: { filter: Filter<any>; collect?: any }
) {
  return queryAndSaveOnePureEffect(self, Effect.sync(() => map))
}

/**
 * @tsplus fluent Repository queryAndSavePureEffect
 */
export function queryAndSavePureEffect<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>
) {
  return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, S[], S2[]>>) =>
    queryEffect(self, map)
      .pipe(Effect.flatMap((_) => saveManyWithPure_(self, _, pure)))
}

/**
 * @tsplus fluent Repository queryAndSavePure
 */
export function queryAndSavePure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
) {
  return queryAndSavePureEffect(self, Effect.sync(() => map))
}

/**
 * @tsplus getter Repository saveManyWithPure
 */
export function saveManyWithPure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>) =>
  (items: Iterable<S1>) => saveManyWithPure_(self, items, pure)
}

/**
 * @tsplus fluent Repository byIdAndSaveWithPure
 */
export function byIdAndSaveWithPure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>, id: T["id"]) {
  return <R, A, E, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, T, S2>>) =>
    get(self, id).pipe(Effect.flatMap((item) => saveWithPure_(self, item, pure)))
}

/**
 * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
 * @tsplus getter Repository handleByIdAndSaveWithPure
 */
export function handleByIdAndSaveWithPure<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>) {
  return <Req extends { id: T["id"] }, Context, R, A, E, S2 extends T>(
    pure: (req: Req, ctx: Context) => Effect<A, E, FixEnv<R, Evt, T, S2>>
  ) =>
  (req: Req, ctx: Context) => byIdAndSaveWithPure(self, req.id)(pure(req, ctx))
}

/**
 * @tsplus fluent Repository saveManyWithPure_
 */
export function saveManyWithPure_<
  R,
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  items: Iterable<S1>,
  pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>
) {
  return saveAllWithEffectInt(
    self,
    runTerm(pure, [...items])
  )
}

/**
 * @tsplus fluent Repository saveWithPure_
 */
export function saveWithPure_<
  R,
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  item: S1,
  pure: Effect<A, E, FixEnv<R, Evt, S1, S2>>
) {
  return saveAllWithEffectInt(
    self,
    runTerm(pure, item)
      .pipe(Effect
        .map(([item, events, a]) => [[item], events, a]))
  )
}

export function saveAllWithEffectInt<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  P extends T,
  Evt,
  ItemType extends string,
  R,
  E,
  A
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  gen: Effect<readonly [Iterable<P>, Iterable<Evt>, A], E, R>
) {
  return Effect.flatMap(gen, ([items, events, a]) => self.saveAndPublish(items, events).pipe(Effect.map(() => a)))
}

/**
 * @tsplus fluent Repository queryAndSavePureEffectBatched
 */
export function queryAndSavePureEffectBatched<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<{ filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }, E, R>,
  batchSize = 100
) {
  return <R2, A, E2, S2 extends T>(pure: Effect<A, E2, FixEnv<R2, Evt, S[], S2[]>>) =>
    queryEffect(self, map)
      .pipe(Effect.flatMap((_) => saveManyWithPureBatched_(self, _, pure, batchSize)))
}

/**
 * @tsplus fluent Repository queryAndSavePureBatched
 */
export function queryAndSavePureBatched<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number },
  batchSize = 100
) {
  return queryAndSavePureEffectBatched(self, Effect.sync(() => map), batchSize)
}

/**
 * @tsplus fluent Repository saveManyWithPureBatched
 */
export function saveManyWithPureBatched<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>, batchSize = 100) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>) =>
  (items: Iterable<S1>) => saveManyWithPureBatched_(self, items, pure, batchSize)
}

/**
 * @tsplus fluent Repository saveManyWithPureBatched_
 */
export function saveManyWithPureBatched_<
  R,
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  items: Iterable<S1>,
  pure: Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>,
  batchSize = 100
) {
  return Effect.forEach(
    ReadonlyArray.chunk_(items, batchSize),
    (batch) =>
      saveAllWithEffectInt(
        self,
        runTerm(pure, batch)
      )
  )
}

/**
 * @tsplus getter Repository save
 */
export function save<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>
) {
  return (...items: NonEmptyArray<T>) => self.saveAndPublish(items)
}

/**
 * @tsplus getter Repository saveWithEvents
 */
export function saveWithEvents<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>
) {
  return (events: Iterable<Evt>) => (...items: NonEmptyArray<T>) => self.saveAndPublish(items, events)
}

/**
 * @tsplus fluent Repository updateWithEffect
 */
export function itemUpdateWithEffect<
  R,
  E,
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  repo: RepositoryBaseC<T, PM, Evt, ItemType>,
  id: T["id"],
  mod: (item: T) => Effect<T, E, R>
) {
  return get(repo, id).pipe(Effect.andThen(mod), Effect.andThen(save(repo)))
}

/**
 * @tsplus fluent Repository update
 */
export function itemUpdate<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  repo: RepositoryBaseC<T, PM, Evt, ItemType>,
  id: T["id"],
  mod: (item: T) => T
) {
  return itemUpdateWithEffect(
    repo,
    id,
    (item) => Effect.sync(() => mod(item))
  )
}
