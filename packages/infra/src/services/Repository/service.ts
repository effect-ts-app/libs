import type { Effect, Option, PubSub, S } from "effect-app"
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
  IdKey extends keyof T
> {
  readonly itemType: ItemType
  readonly idKey: IdKey
  readonly find: (id: T[IdKey]) => Effect<Option<T>>
  readonly all: Effect<T[]>
  readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException>
  readonly changeFeed: PubSub.PubSub<[T[], "save" | "remove"]>
  readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void>

  readonly query: {
    <A, R, From extends FieldValues, TType extends "one" | "many" | "count" = "many">(
      q: (
        initial: Query<Encoded>
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded
    >(
      q: (initial: Query<Encoded>) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R
    >
  }
  /** @deprecated use query */
  readonly mapped: Mapped<Encoded>
}

type RefineTHelper<T, EncodedRefined> = EncodedRefined extends { _tag: any }
  ? T extends { _tag: any } ? Extract<T, { _tag: EncodedRefined["_tag"] }>
  : T
  : T
