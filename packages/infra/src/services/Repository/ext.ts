/* eslint-disable @typescript-eslint/no-explicit-any */
// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import { Effect, ReadonlyArray } from "effect-app"
import type { NonEmptyArray } from "effect-app"
import { type FixEnv, runTerm } from "effect-app/Pure"
import { NotFoundError } from "../../errors.js"
import type { PersistenceModelType } from "../../services/Store.js"
import type { RepositoryBaseC } from "../RepositoryBase.js"
import { AnyPureDSL } from "./dsl.js"
import type { Repository } from "./service.js"

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
  pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
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
 * @tsplus fluent Repository saveManyWithPureBatched
 */
export function saveManyWithPureBatched<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
>(self: RepositoryBaseC<T, PM, Evt, ItemType>, batchSize = 100) {
  return <R, A, E, S1 extends T, S2 extends T>(pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>) =>
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
  pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>,
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
