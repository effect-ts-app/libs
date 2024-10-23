/* eslint-disable @typescript-eslint/no-explicit-any */
// Update = Must return updated items
// Modify = Must `set` updated items, and can return anything.
import { Array, Effect } from "effect-app"
import { type FixEnv, runTerm } from "effect-app/Pure"
import type { Repository } from "./service.js"

export function saveManyWithPure_<
  R,
  T,
  Encoded extends { id: string },
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string,
  IdKey extends keyof T
>(
  self: Repository<T, Encoded, Evt, ItemType, IdKey>,
  items: Iterable<S1>,
  pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>
) {
  return saveAllWithEffectInt(
    self,
    runTerm(pure, [...items])
  )
}

export function saveWithPure_<
  R,
  T,
  Encoded extends { id: string },
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string,
  IdKey extends keyof T
>(
  self: Repository<T, Encoded, Evt, ItemType, IdKey>,
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
  T,
  Encoded extends { id: string },
  P extends T,
  Evt,
  ItemType extends string,
  IdKey extends keyof T,
  R,
  E,
  A
>(
  self: Repository<T, Encoded, Evt, ItemType, IdKey>,
  gen: Effect<readonly [Iterable<P>, Iterable<Evt>, A], E, R>
) {
  return Effect.flatMap(gen, ([items, events, a]) => self.saveAndPublish(items, events).pipe(Effect.map(() => a)))
}

export function saveManyWithPureBatched_<
  R,
  T,
  Encoded extends { id: string },
  A,
  E,
  Evt,
  S1 extends T,
  S2 extends T,
  ItemType extends string,
  IdKey extends keyof T
>(
  self: Repository<T, Encoded, Evt, ItemType, IdKey>,
  items: Iterable<S1>,
  pure: Effect<A, E, FixEnv<R, Evt, readonly S1[], readonly S2[]>>,
  batchSize = 100
) {
  return Effect.forEach(
    Array.chunk_(items, batchSize),
    (batch) =>
      saveAllWithEffectInt(
        self,
        runTerm(pure, batch)
      )
  )
}
