import type { ParseResult } from "effect"
import type { Effect, Option, PubSub } from "effect-app"
import type { InvalidStateError, NotFoundError, OptimisticConcurrencyException } from "effect-app/client"
import type { NonNegativeInt } from "effect-app/Schema/numbers"
import type { FieldValues } from "../../filter/types.js"
import type { QAll, Query, QueryProjection } from "../query.js"
import type { Mapped } from "./legacy.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T,
  Encoded extends { id: string },
  Evt,
  ItemType extends string,
  IdKey extends keyof T,
  R
> {
  readonly itemType: ItemType
  readonly idKey: IdKey
  readonly find: (id: T[IdKey]) => Effect<Option<T>, never, R>
  readonly all: Effect<T[], never, R>
  readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException, R>
  readonly changeFeed: PubSub.PubSub<[T[], "save" | "remove"]>
  readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, never, R>

  readonly query: {
    <A, R, Encoded2 extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Query<Encoded>
      ) => QueryProjection<Encoded extends Encoded2 ? Encoded2 : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : ParseResult.ParseError),
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
  readonly mapped: Mapped<Encoded>
}
