/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect, Option, PubSub, S } from "effect-app"
import type { InvalidStateError, NotFoundError, OptimisticConcurrencyException } from "effect-app/client"
import type { NonNegativeInt } from "effect-app/Schema/numbers"
import type { FieldValues, ResolveFirstLevel } from "../filter/types.js"
import type { QAll, Query, QueryProjection } from "../query.js"
import type { Mapped } from "./legacy.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T,
  Encoded extends FieldValues,
  Evt,
  ItemType extends string,
  IdKey extends keyof T,
  RSchema,
  RPublish
> {
  readonly itemType: ItemType
  readonly idKey: IdKey
  readonly find: (id: T[IdKey]) => Effect<Option<T>, never, RSchema>
  readonly all: Effect<T[], never, RSchema>
  readonly saveAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, InvalidStateError | OptimisticConcurrencyException, RSchema | RPublish>
  readonly changeFeed: PubSub.PubSub<[T[], "save" | "remove"]>
  readonly removeAndPublish: (
    items: Iterable<T>,
    events?: Iterable<Evt>
  ) => Effect<void, never, RSchema | RPublish>

  readonly query: {
    // ending with projection
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many"
    >(
      q: (
        initial: Query<Encoded>
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (
        _: $A
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (
        _: $B
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (
        _: $C
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (
        _: $D
      ) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (_: $G) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never,
      $H = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (_: $G) => $H,
      q9: (_: $H) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >
    <
      A,
      R,
      From extends FieldValues,
      TType extends "one" | "many" | "count" = "many",
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never,
      $H = never,
      $I = never
    >(
      q1: (
        initial: Query<Encoded>
      ) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (_: $G) => $H,
      q9: (_: $H) => $I,
      q10: (_: $I) => QueryProjection<Encoded extends From ? From : never, A, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly A[] : TType extends "count" ? NonNegativeInt : A,
      | (TType extends "many" ? never : NotFoundError<ItemType>)
      | (TType extends "count" ? never : S.ParseResult.ParseError),
      R | RSchema
    >

    // ending with generic query
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded
    >(
      q: (initial: Query<Encoded>) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (
        _: $A
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (
        _: $A
      ) => $B,
      q3: (
        _: $B
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (
        _: $C
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (
        _: $D
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (
        _: $E
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (
        _: $F
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (
        _: $G
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never,
      $H = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (_: $G) => $H,
      q9: (
        _: $H
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
    <
      R = never,
      TType extends "one" | "many" = "many",
      EncodedRefined extends Encoded = Encoded,
      $A = never,
      $B = never,
      $C = never,
      $D = never,
      $E = never,
      $F = never,
      $G = never,
      $H = never,
      $I = never
    >(
      q1: (initial: Query<Encoded>) => $A,
      q2: (_: $A) => $B,
      q3: (_: $B) => $C,
      q4: (_: $C) => $D,
      q5: (_: $D) => $E,
      q6: (_: $E) => $F,
      q7: (_: $F) => $G,
      q8: (_: $G) => $H,
      q9: (_: $H) => $I,
      q10: (
        _: $I
      ) => QAll<Encoded, EncodedRefined, RefineTHelper<T, EncodedRefined>, R, TType>
    ): Effect.Effect<
      TType extends "many" ? readonly RefineTHelper<T, EncodedRefined>[] : RefineTHelper<T, EncodedRefined>,
      TType extends "many" ? never : NotFoundError<ItemType>,
      R | RSchema
    >
  }

  /** @deprecated use query */
  readonly mapped: Mapped<Encoded>
}

type NullableRefined<T, EncodedRefined> = {
  [k in keyof T]: k extends keyof EncodedRefined ? [null] extends [T[k]] ? [null] extends [EncodedRefined[k]] ? T[k]
      : Exclude<T[k], null>
    : T[k]
    : T[k]
}

type ExtractTagged<T, EncodedRefined> = EncodedRefined extends { _tag: string }
  ? T extends { _tag: string } ? Extract<T, { _tag: EncodedRefined["_tag"] }>
  : T
  : T

type ExtractIded<T, EncodedRefined> = EncodedRefined extends { id: string }
  ? T extends { id: string } ? Extract<T, { id: EncodedRefined["id"] }>
  : T
  : T

export type RefineTHelper<T, EncodedRefined> = ResolveFirstLevel<
  NullableRefined<
    ExtractIded<ExtractTagged<T, EncodedRefined>, EncodedRefined>,
    EncodedRefined
  >
>
