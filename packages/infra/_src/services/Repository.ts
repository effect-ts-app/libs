/* eslint-disable @typescript-eslint/no-explicit-any */
// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import type { FixEnv, PureLogT } from "@effect-app/prelude/Pure"
import { Pure } from "@effect-app/prelude/Pure"
import { NotFoundError } from "../errors.js"
import type { Filter, PersistenceModelType } from "../services/Store.js"
import type { RepositoryBaseC } from "./RepositoryBase.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T extends { id: string },
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  id: T["id"]
) {
  return self.find(id).flatMap((_) => _.encaseInEffect(() => new NotFoundError({ type: self.itemType, id })))
}

/**
 * @tsplus getter Repository log
 */
export function log<
  T extends { id: string },
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  U extends keyof PM = never,
  S = U extends never ? PM : Pick<PM, U>
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: Effect<
    R,
    E,
    {
      filter?: Filter<PM>
      select?: readonly U[]
      collect?: (t: U extends never ? PM : Pick<PM, U>) => Option<S>
      limit?: number
      skip?: number
    }
  >
) {
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  U extends keyof PM = never,
  S = U extends never ? PM : Pick<PM, U>
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  map: {
    filter?: Filter<PM>
    select?: readonly U[]
    collect?: (t: U extends never ? PM : Pick<PM, U>) => Option<S>
    limit?: number
    skip?: number
  }
) {
  return self.projectEffect(Effect(map))
}

/**
 * TODO: count inside the db.
 * @tsplus fluent Repository project
 */
export function count<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  filter?: Filter<PM>
) {
  return self
    .projectEffect(Effect({ filter }))
    .map((_) => PositiveInt(_.length))
}

/**
 * @tsplus fluent Repository queryEffect
 */
export function queryEffect<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }>
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter?: Filter<PM>; collect?: (t: T) => Option<S> }>
) {
  return map.flatMap((f) =>
    (f.filter ? self.utils.filter({ filter: f.filter, limit: 1 }) : self.utils.all)
      .flatMap((_) => self.utils.parseMany(_))
      .flatMap((_) =>
        (f.collect ? _.filterMap(f.collect) : _ as any as S[])
          .toNonEmpty
          .encaseInEffect(() => new NotFoundError({ type: self.itemType, id: JSON.stringify(f.filter) }))
          .map((_) => _[0])
      )
  )
}

/**
 * @tsplus fluent Repository query
 */
export function query<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter?: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
) {
  return self.queryEffect(Effect(map))
}

/**
 * @tsplus fluent Repository queryOne
 */
export function queryOne<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter?: Filter<PM>; collect?: (t: T) => Option<S> }
) {
  return self.queryOneEffect(Effect(map))
}

/**
 * @tsplus fluent Repository queryAndSavePureEffect
 */
export function queryAndSavePureEffect<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }>
) {
  return <R2, A, E2, S2 extends T>(pure: Effect<FixEnv<R2, Evt, S[], S2[]>, E2, A>) =>
    queryEffect(self, map)
      .flatMap((_) => self.saveManyWithPure_(_, pure))
}

/**
 * @tsplus fluent Repository queryAndSavePure
 */
export function queryAndSavePure<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }
) {
  return self.queryAndSavePureEffect(Effect(map))
}

/**
 * @tsplus getter Repository saveManyWithPure
 */
export function saveManyWithPure<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>) =>
  (items: Iterable<S1>) => saveManyWithPure_(self, items, pure)
}

/**
 * @tsplus fluent Repository byIdAndSaveWithPure
 */
export function byIdAndSaveWithPure<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>, id: T["id"]) {
  return <R, A, E, S2 extends T>(pure: Effect<FixEnv<R, Evt, T, S2>, E, A>) =>
    get(self, id).flatMap((item) => saveWithPure_(self, item, pure))
}

/**
 * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
 * @tsplus getter Repository handleByIdAndSaveWithPure
 */
export function handleByIdAndSaveWithPure<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>) {
  return <Req extends { id: T["id"] }, Context, R, A, E, S2 extends T>(
    pure: (req: Req, ctx: Context) => Effect<FixEnv<R, Evt, T, S2>, E, A>
  ) =>
  (req: Req, ctx: Context) => byIdAndSaveWithPure(self, req.id)(pure(req, ctx))
}

/**
 * @tsplus fluent Repository saveManyWithPure_
 */
export function saveManyWithPure_<
  Id extends string,
  R,
  T extends { id: Id },
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
  pure: Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>
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
  Id extends string,
  R,
  T extends { id: Id },
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
  pure: Effect<FixEnv<R, Evt, S1, S2>, E, A>
) {
  return saveAllWithEffectInt(
    self,
    pure
      .runTerm(item)
      .map(([item, events, a]) => [[item], events, a])
  )
}

export function saveAllWithEffectInt<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  P extends T,
  Evt,
  ItemType extends string,
  R,
  E,
  A
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  gen: Effect<R, E, readonly [Iterable<P>, Iterable<Evt>, A]>
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter: Filter<PM>; collect?: (t: T) => Option<S>; limit?: number; skip?: number }>,
  batchSize = 100
) {
  return <R2, A, E2, S2 extends T>(pure: Effect<FixEnv<R2, Evt, S[], S2[]>, E2, A>) =>
    queryEffect(self, map)
      .flatMap((_) => self.saveManyWithPureBatched_(_, pure, batchSize))
}

/**
 * @tsplus fluent Repository queryAndSavePureBatched
 */
export function queryAndSavePureBatched<
  T extends { id: string },
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
  return self.queryAndSavePureEffectBatched(Effect(map), batchSize)
}

/**
 * @tsplus fluent Repository saveManyWithPureBatched
 */
export function saveManyWithPureBatched<
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>, batchSize = 100) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>) =>
  (items: Iterable<S1>) => saveManyWithPureBatched_(self, items, pure, batchSize)
}

/**
 * @tsplus fluent Repository saveManyWithPureBatched_
 */
export function saveManyWithPureBatched_<
  Id extends string,
  R,
  T extends { id: Id },
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
  pure: Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>,
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
    pure: (dsl: PureDSL<S1[], S2[], Evt>) => Effect<R, E, A>
  ) => Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>)
  & AllDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface AllDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1[], dsl: PureDSL<S1[], S2[], Evt>) => Effect<R, E, A>
  ) => Effect<FixEnv<R, Evt, S1[], S2[]>, E, A>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1[], log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<R, E, S2[]>
  ) => Effect<FixEnv<R, Evt, S1[], S2[]>, E, S2[]>
}

export function makeAllDSL<T, Evt>() {
  const dsl: AllDSL<T, Evt> = anyDSL
  return dsl
}

export type OneDSL<T, Evt> =
  & (<R, A, E, S1 extends T, S2 extends T>(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, A>
  ) => Effect<FixEnv<R, Evt, S1, S2>, E, A>)
  & OneDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface OneDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1, dsl: PureDSL<S1, S2, Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, A>
  ) => Effect<FixEnv<R, Evt, S1, S2> | PureEnvEnv<Evt, S1, S1>, E, A>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1, log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, S2>
  ) => Effect<FixEnv<R, Evt, S1, S2>, E, S2>
}

/**
 * @tsplus fluent DSLExt updateWith
 */
export function updateWithOne<T, Evt, S1 extends T, S2 extends T>(self: OneDSL<T, Evt>, upd: (item: S1) => S2) {
  return self.update((_: S1) => Effect(upd(_)))
}

/**
 * @tsplus fluent DSLExt updateWith
 */
export function updateWith<T, Evt, S1 extends T, S2 extends T>(
  self: AllDSL<T, Evt>,
  upd: (item: S1[]) => S2[]
) {
  return self.update((_: S1[]) => Effect(upd(_)))
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
    ) => Effect<R, E, A>
  ): Effect<FixEnv<R, Evt, S1, S2>, E, A> {
    return dsl.get.flatMap((items) => pure(items, dsl)) as any
  }

  function update<
    R,
    E
  >(
    pure: (
      items: S1,
      log: (...evt: Evt[]) => PureLogT<Evt>
    ) => Effect<R, E, S2>
  ): Effect<FixEnv<R, Evt, S1, S2>, E, S2> {
    return dsl.get.flatMap((items) => pure(items, dsl.log).tap(dsl.set)) as any
  }

  function withDSL<
    R,
    A,
    E
  >(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<R, E, A>
  ): Effect<FixEnv<R, Evt, S1, S2>, E, A> {
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

export function ifAny<T, R, E, A>(fn: (items: NonEmptyReadonlyArray<T>) => Effect<R, E, A>) {
  return (items: Iterable<T>) => Effect(items.toNonEmptyArray).flatMapOpt(fn)
}

/**
 * @tsplus fluent Iterable ifAny
 */
export function ifAny_<T, R, E, A>(items: Iterable<T>, fn: (items: NonEmptyReadonlyArray<T>) => Effect<R, E, A>) {
  return Effect(items.toNonEmptyArray).flatMapOpt(fn)
}

/**
 * @tsplus getter Repository save
 */
export function save<
  T extends { id: string },
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
  T extends { id: string },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(
  self: RepositoryBaseC<T, PM, Evt, ItemType>
) {
  return (events: Iterable<Evt>) => (...items: NonEmptyArray<T>) => self.saveAndPublish(items, events)
}
