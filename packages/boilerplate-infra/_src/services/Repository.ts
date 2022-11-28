// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import type { InvalidStateError, OptimisticConcurrencyException } from "../errors.js"
import { NotFoundError } from "../errors.js"
import type { RequestContext } from "../lib/RequestContext.js"
import { ContextMap} from "../services/Store.js";
import type { Filter } from "../services/Store.js"
import type { FixEnv, PureLogT} from "@effect-ts-app/boilerplate-prelude/_ext/Pure";
import { Pure } from "@effect-ts-app/boilerplate-prelude/_ext/Pure"
import type { ParserEnv } from "@effect-ts-app/schema/custom/Parser"

/**
 * @tsplus type Repository
 */
export interface Repository<T extends { id: Id }, PM extends { id: string }, Evt, Id extends string, ItemType extends string> {
  itemType: ItemType
  find: (id: Id) => Effect<ContextMap | RequestContext, never, Maybe<T>>
  all: Effect<ContextMap, never, Chunk<T>>
  save: (
    items: Collection<T>,
    events?: Collection<Evt>
  ) => Effect<ContextMap | RequestContext, InvalidStateError | OptimisticConcurrencyException, void>
  utils: {
    mapReverse: (
      pm: PM,
      setEtag: (id: string, eTag: string | undefined) => void
    ) => unknown, // TODO
    parse: (a: unknown, env?: ParserEnv | undefined) => T,
    all: Effect<never, never, Chunk<PM>>,
    filter: (filter: Filter<PM>, cursor?: { limit?: number, skip?: number}) => Effect<never, never, Chunk<PM>>
  }
}

export interface PureDSL<S, S2, W> {
  get: ReturnType<typeof Pure.get<S>>, set: typeof Pure.set<S2>, log: (...w: W[]) => PureLogT<W>
}

export const AnyPureDSL: PureDSL<any, any, any> = { get: Pure.get(), set: Pure.set, log: (...evt: any[]) => Pure.logMany(evt) }

/**
 * @tsplus fluent Repository get
 */
export function get<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  id: Id
) {
  return self.find(id).flatMap(_ => _.encaseInEffect(() => new NotFoundError(self.itemType, id)))
}

/**
 * @tsplus fluent Repository filter
 */
export function filter<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
>(self: Repository<T, PM, Evt, Id, ItemType>, filter: Predicate<T>) {
  return self.all.map(_ => _.filter(filter))
}

/**
 * @tsplus fluent Repository filterAll
 */
export function filterAll<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S extends T,
>(self: Repository<T, PM, Evt, Id, ItemType>, map: (items: Chunk<T>) => Chunk<S>) {
  return self.all.map(map)
}


/**
 * @tsplus fluent Repository collect
 */
export function collect<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S extends T,
>(self: Repository<T, PM, Evt, Id, ItemType>, collect: (item: T) => Maybe<S>) {
  return self.all.map(_ => _.collect(collect))
}

/**
 * @tsplus getter Repository log
 */
export function log<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string
>(_: Repository<T, PM, Evt, Id, ItemType>) {
  return (evt: Evt) => AnyPureDSL.log(evt)
}

/**
 * TODO: project inside the db.
 * @tsplus fluent Repository projectEffect
 */
export function projectEffect<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S,
  R,
  E
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  map: Effect<R, E, { filter?: Filter<PM>; collect: (t: PM) => Maybe<S>; limit?: number; skip?: number }>
) {
  // TODO: a projection that gets sent to the db instead.
  return map.flatMap(f =>
    (f.filter ? self.utils.filter(f.filter, { limit: f.limit, skip: f.skip}) : self.utils.all)
      .map(_ => _.collect(f.collect))
  )
}

/**
 * TODO: project inside the db.
 * @tsplus fluent Repository project
 */
export function project<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  map: { filter?: Filter<PM>; collect: (t: PM) => Maybe<S>; limit?: number; skip?: number }
) {
  return self.projectEffect(Effect(map))
}


/**
 * @tsplus fluent Repository queryEffect
 */
export function queryEffect<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  R,
  E,
  S,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter?: Filter<PM>; collect: (t: T) => Maybe<S>; limit?: number; skip?: number }>
) {
  return map.flatMap(f =>
    (f.filter ? self.utils.filter(f.filter, { limit: f.limit, skip: f.skip}) : self.utils.all)
      .flatMap(items =>
        Do($ => {
          const { set } = $(Effect.service(ContextMap))
          return items.map(_ => self.utils.mapReverse(_, set))
        })
      )
      .map(_ => _.map(_ => self.utils.parse(_)))
      .map(_ => _.collect(f.collect))
  )
}

/**
 * @tsplus fluent Repository queryOneEffect
 */
export function queryOneEffect<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  R,
  E,
  S,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter?: Filter<PM>; collect: (t: T) => Maybe<S> }>
) {
  return map.flatMap(f =>
    (f.filter ? self.utils.filter(f.filter, { limit: 1 }) : self.utils.all)
      .flatMap(items =>
        Do($ => {
          const { set } = $(Effect.service(ContextMap))
          return items.map(_ => self.utils.mapReverse(_, set))
        })
      )
      .map(_ => _.map(_ => self.utils.parse(_)))
      .flatMap(_ => _.collect(f.collect).toNonEmptyArray.encaseInEffect(() => new NotFoundError(self.itemType, JSON.stringify(f.filter))).map(_ => _[0]))
  )
}

/**
 * @tsplus fluent Repository query
 */
export function query<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter?: Filter<PM>; collect: (t: T) => Maybe<S>; limit?: number; skip?: number }
) {
  return self.queryEffect(Effect(map))
}

/**
 * @tsplus fluent Repository queryOne
 */
export function queryOne<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter?: Filter<PM>; collect: (t: T) => Maybe<S> }
) {
  return self.queryOneEffect(Effect(map))
}

/**
 * @tsplus fluent Repository queryAndSavePureEffect
 */
export function queryAndSavePureEffect<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  R,
  E,
  S extends T = T,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: Effect<R, E, { filter: Filter<PM>; collect: (t: T) => Maybe<S>; limit?: number; skip?: number }>
) {
  return <R2, A, E2, S2 extends T>(pure: Effect<FixEnv<R2, Evt, Chunk<S>, Collection<S2>>, E2, A>) =>
    queryEffect(self, map)
      .flatMap(_ => self.saveManyWithPure_(_, pure))
}

/**
 * @tsplus fluent Repository queryAndSavePure
 */
export function queryAndSavePure<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
  S extends T = T,
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  // TODO: think about collectPM, collectE, and collect(Parsed)
  map: { filter: Filter<PM>; collect: (t: T) => Maybe<S>; limit?: number; skip?: number }
) {
  return self.queryAndSavePureEffect(Effect(map))
}

/**
 * @tsplus getter Repository saveManyWithPure
 */
export function saveManyWithPure<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string
>(self: Repository<T, PM, Evt, Id, ItemType>) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<FixEnv<R, Evt, Chunk<S1>, Collection<S2>>, E, A>) =>
    (items: Collection<S1>) => saveManyWithPure_(self, items, pure)
}

/**
 * @tsplus fluent Repository byIdAndSaveWithPure
 */
export function byIdAndSaveWithPure<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string
>(self: Repository<T, PM, Evt, Id, ItemType>, id: Id) {
  return <R, A, E, S2 extends T>(pure: Effect<FixEnv<R, Evt, T, S2>, E, A>) => get(self, id).flatMap(item => saveWithPure_(self, item, pure))
}

/**
 * NOTE: it's not as composable, only useful when the request is simple, and only this part needs request args.
 * @tsplus getter Repository handleByIdAndSaveWithPure
 */
export function handleByIdAndSaveWithPure<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  Evt,
  ItemType extends string,
>(self: Repository<T, PM, Evt, Id, ItemType>) {
  return <Req extends { id: Id }, Context, R, A, E, S2 extends T>(pure: (req: Req, ctx: Context) => Effect<FixEnv<R, Evt, T, S2>, E, A>) => (req: Req, ctx: Context) => byIdAndSaveWithPure(self, req.id)(pure(req, ctx))
}

/**
 * @tsplus fluent Repository saveManyWithPure_
 */
export function saveManyWithPure_<
  Id extends string,
  R,
  T extends { id: Id },
  PM extends { id: string },
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  items: Collection<S1>,
  pure: Effect<FixEnv<R, Evt, Chunk<S1>, Collection<S2>>, E, A>
) {
  return saveAllWithEffectInt(
    self,
    pure.runTerm(items.toChunk)
  )
}

/**
 * @tsplus fluent Repository saveWithPure_
 */
export function saveWithPure_<
  Id extends string,
  R,
  T extends { id: Id },
  PM extends { id: string },
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  item: S1,
  pure: Effect<FixEnv<R, Evt, S1, S2>, E, A>
) {
  return saveAllWithEffectInt(
    self,
    pure.runTerm(item)
    .map(([item, events, a]) => [[item], events, a])
  )
}

function saveAllWithEffectInt<
  Id extends string,
  T extends { id: Id },
  PM extends { id: string },
  P extends T,
  Evt,
  ItemType extends string,
  R,
  E,
  A
>(
  self: Repository<T, PM, Evt, Id, ItemType>,
  gen: Effect<R, E, readonly [Collection<P>, Collection<Evt>, A]>
) {
  return gen
    .flatMap(
      ([items, events, a]) =>
        self.save(items, events)
          .map(() => a)
    )
}

const anyDSL = makeDSL<any, any, any>()

export type AllDSL<T, Evt> =
  (<R, A, E, S1 extends T, S2 extends T>(pure: (dsl: PureDSL<Chunk<S1>, Collection<S2>, Evt>) => Effect<R, E, A>) => Effect<FixEnv<R, Evt, Chunk<S1>, Collection<S2>>, E, A>)
    & AllDSLExt<T, Evt>

  
/**
 * @tsplus type DSLExt
 */
export interface AllDSLExt<T, Evt>  {
  modify: <R, E, A, S1 extends T, S2 extends T>(pure: (items: Chunk<S1>, dsl: PureDSL<Chunk<S1>, Collection<S2>, Evt>) => Effect<R, E, A>) => Effect<FixEnv<R, Evt, Chunk<S1>, Collection<S2>>, E, A>;
  update: <R, E, S1 extends T, S2 extends T>(pure: (items: Chunk<S1>, log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<R, E, Collection<S2>>) => Effect<FixEnv<R, Evt, Chunk<S1>, Collection<S2>>, E, Collection<S2>>;
}

export function makeAllDSL<T, Evt>() {
  const dsl: AllDSL<T, Evt> = anyDSL
  return dsl
}

export type OneDSL<T, Evt> =
(<R, A, E, S1 extends T, S2 extends T>(pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, A>) => Effect<FixEnv<R, Evt, S1, S2>, E, A>)
& OneDSLExt<T, Evt>


/**
 * @tsplus type DSLExt
 */
export interface OneDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(pure: (items: S1, dsl: PureDSL<S1, S2, Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, A>) => Effect<FixEnv<R, Evt, S1, S2> | PureEnvEnv<Evt, S1, S1>, E, A>;
  update: <R, E, S1 extends T, S2 extends T>(pure: (items: S1, log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<FixEnv<R, Evt, S1, S2>, E, S2>) => Effect<FixEnv<R, Evt, S1, S2>, E, S2>;
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
export function updateWith<T, Evt, S1 extends T, S2 extends T>(self: AllDSL<T, Evt>, upd: (item: Chunk<S1>) => Collection<S2>) {
  return self.update((_: Chunk<S1>) => Effect(upd(_)))
}

export function makeOneDSL<T, Evt>(): OneDSL<T, Evt>  {
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
    return dsl.get.flatMap(items => pure(items, dsl)) as any
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
    return dsl.get.flatMap(items => pure(items, dsl.log).tap(dsl.set)) as any
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
    withDSL, {
      modify,
      update,
    }
  )
}

export interface DSLExt<S1, S2, Evt> extends ReturnType<typeof makeDSL<S1, S2, Evt>> { }


export function ifAny<T, R, E, A>(fn: (items: NonEmptyArray<T>) => Effect<R, E, A>) {
  return (items: Collection<T>) => Effect(items.toNonEmptyArray).flatMapMaybe(fn)
}

/**
 * @tsplus fluent Collection ifAny
 */
export function ifAny_<T, R, E, A>(items: Collection<T>, fn: (items: NonEmptyArray<T>) => Effect<R, E, A>) {
  return Effect(items.toNonEmptyArray).flatMapMaybe(fn)
}
