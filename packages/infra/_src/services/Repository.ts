/* eslint-disable @typescript-eslint/no-explicit-any */
// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import type { FixEnv, PureLogT } from "@effect-app/prelude/Pure"
import { Pure } from "@effect-app/prelude/Pure"
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"
import { NotFoundError } from "../errors.js"
import type { Filter, PersistenceModelType } from "../services/Store.js"
import type { RepositoryBaseC } from "./RepositoryBase.js"
import type { QueryBuilder } from "./Store/filterApi/query.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC<T, PM, Evt, ItemType> {}

export interface PureDSL<S, S2, W> {
  get: ReturnType<typeof Pure.get<S>>
  set: typeof Pure.set<S2>
  log: (...w: W[]) => PureLogT<W>
}

export const AnyPureDSL: PureDSL<any, any, any> = {
  get: Pure.get(),
  set: Pure.set,
  log: (...evt: any[]) => Pure.logMany(evt)
}

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
    .flatMap((_) => _.encaseInEffect(() => new NotFoundError<ItemType>({ type: self.itemType, id })))
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
  return map.flatMap((f) =>
    self
      .utils
      .filter(f)
      .map((_) => f.collect ? _.filterMap(f.collect) : _ as unknown as S[])
  )
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
  return self.projectEffect(Effect.sync(() => map))
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
  return self
    .projectEffect(Effect.sync(() => ({ filter })))
    .map((_) => NonNegativeInt(_.length))
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
  return map.flatMap((f) =>
    (f.filter ? self.utils.filter(f) : self.utils.all)
      .flatMap((_) => self.utils.parseMany(_))
      .map((_) => f.collect ? _.filterMap(f.collect) : _ as any as S[])
  )
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
  return map.flatMap((f) =>
    (f.filter ? self.utils.filter({ filter: f.filter, limit: 1 }) : self.utils.all)
      .flatMap((_) => self.utils.parseMany(_))
      .flatMap((_) =>
        (f.collect ? _.filterMap(f.collect) : _ as any as S[])
          .toNonEmpty
          .encaseInEffect(() => new NotFoundError<ItemType>({ type: self.itemType, id: f.filter }))
          .map((_) => _[0])
      )
  )
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
  return self.queryEffect(Effect.sync(() => map))
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
  return self.queryOneEffect(Effect.sync(() => map))
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
      .flatMap((_) => saveWithPure_(self, _, pure))
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
      .flatMap((_) => self.saveManyWithPure_(_, pure))
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
  return self.queryAndSavePureEffect(Effect.sync(() => map))
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
    get(self, id).flatMap((item) => saveWithPure_(self, item, pure))
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
    pure.runTerm([...items])
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
    pure
      .runTerm(item)
      .map(([item, events, a]) => [[item], events, a])
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
  return gen
    .flatMap(
      ([items, events, a]) => self.saveAndPublish(items, events).map(() => a)
    )
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
      .flatMap((_) => self.saveManyWithPureBatched_(_, pure, batchSize))
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
  return self.queryAndSavePureEffectBatched(Effect.sync(() => map), batchSize)
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
  return items
    .chunk(batchSize)
    .forEachEffect((batch) =>
      saveAllWithEffectInt(
        self,
        pure.runTerm(batch)
      )
    )
}

const anyDSL = makeDSL<any, any, any>()

export type AllDSL<T, Evt> =
  & (<R, A, E, S1 extends T, S2 extends T>(
    pure: (dsl: PureDSL<S1[], S2[], Evt>) => Effect<A, E, R>
  ) => Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>)
  & AllDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface AllDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1[], dsl: PureDSL<S1[], S2[], Evt>) => Effect<A, E, R>
  ) => Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1[], log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<S2[], E, R>
  ) => Effect<S2[], E, FixEnv<R, Evt, S1[], S2[]>>
}

export function makeAllDSL<T, Evt>() {
  const dsl: AllDSL<T, Evt> = anyDSL
  return dsl
}

export type OneDSL<T, Evt> =
  & (<R, A, E, S1 extends T, S2 extends T>(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<A, E, FixEnv<R, Evt, S1, S2>>)
  & OneDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface OneDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1, dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<A, E, FixEnv<R, Evt, S1, S2> | PureEnvEnv<Evt, S1, S1>>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1, log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<S2, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<S2, E, FixEnv<R, Evt, S1, S2>>
}

/**
 * @tsplus fluent DSLExt updateWith
 */
export function updateWithOne<T, Evt, S1 extends T, S2 extends T>(self: OneDSL<T, Evt>, upd: (item: S1) => S2) {
  return self.update((_: S1) => Effect.sync(() => upd(_)))
}

/**
 * @tsplus fluent DSLExt updateWith
 */
export function updateWith<T, Evt, S1 extends T, S2 extends T>(
  self: AllDSL<T, Evt>,
  upd: (item: S1[]) => S2[]
) {
  return self.update((_: S1[]) => Effect.sync(() => upd(_)))
}

export function makeOneDSL<T, Evt>(): OneDSL<T, Evt> {
  return anyDSL
}

export function makeDSL<S1, S2, Evt>() {
  const dsl: PureDSL<S1, S2, Evt> = AnyPureDSL

  function modify<
    R,
    E,
    A
  >(
    pure: (
      items: S1,
      dsl: PureDSL<S1, S2, Evt>
    ) => Effect<A, E, R>
  ): Effect<A, E, FixEnv<R, Evt, S1, S2>> {
    return dsl.get.flatMap((items) => pure(items, dsl)) as any
  }

  function update<
    R,
    E
  >(
    pure: (
      items: S1,
      log: (...evt: Evt[]) => PureLogT<Evt>
    ) => Effect<S2, E, R>
  ): Effect<S2, E, FixEnv<R, Evt, S1, S2>> {
    return dsl.get.flatMap((items) => pure(items, dsl.log).tap(dsl.set)) as any
  }

  function withDSL<
    R,
    A,
    E
  >(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, R>
  ): Effect<A, E, FixEnv<R, Evt, S1, S2>> {
    return pure(AnyPureDSL) as any
  }

  return Object.assign(
    withDSL,
    {
      modify,
      update
    }
  )
}

export interface DSLExt<S1, S2, Evt> extends ReturnType<typeof makeDSL<S1, S2, Evt>> {}

export function ifAny<T, R, E, A>(fn: (items: NonEmptyReadonlyArray<T>) => Effect<A, E, R>) {
  return (items: Iterable<T>) => Effect.sync(() => items.toNonEmptyArray).flatMapOpt(fn)
}

/**
 * @tsplus fluent Iterable ifAny
 */
export function ifAny_<T, R, E, A>(items: Iterable<T>, fn: (items: NonEmptyReadonlyArray<T>) => Effect<A, E, R>) {
  return Effect.sync(() => items.toNonEmptyArray).flatMapOpt(fn)
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
