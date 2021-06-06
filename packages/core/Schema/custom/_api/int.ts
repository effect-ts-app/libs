// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import { brand } from "./brand"
import { fromNumber, number, stringNumberFromString } from "./number"
import { string } from "./string"
import type { DefaultSchema } from "./withDefaults"

export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand

export const intFromNumberIdentifier = S.makeAnnotation<{}>()

export const intFromNumber: DefaultSchema<
  number,
  S.RefinementE<S.LeafE<S.InvalidIntegerE>>,
  Int,
  number,
  S.RefinementE<S.LeafE<S.InvalidIntegerE>>,
  number,
  {}
> = pipe(
  fromNumber,
  S.arbitrary((_) => _.integer()),
  S.refine(
    (n): n is Int => Number.isInteger(n),
    (n) => S.leafE(S.invalidIntegerE(n))
  ),
  S.encoder((_) => _ as number),
  S.mapConstructorError((_) => Chunk.unsafeHead(_.errors).error),
  S.mapParserError((_) => Chunk.unsafeHead(_.errors).error),
  S.mapApi(() => ({})),
  brand<Int>(),
  S.annotate(intFromNumberIdentifier, {})
)

export const stringIntFromStringIdentifier = S.makeAnnotation<{}>()

export const stringIntFromString: DefaultSchema<
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.InvalidIntegerE>>>
    | S.PrevE<S.LeafE<S.ParseNumberE>>
  >,
  Int,
  number,
  S.RefinementE<S.LeafE<S.InvalidIntegerE>>,
  string,
  S.ApiSelfType<Int>
> = pipe(
  stringNumberFromString[">>>"](intFromNumber),
  brand<Int>(),
  S.annotate(stringIntFromStringIdentifier, {})
)

export const stringIntIdentifier = S.makeAnnotation<{}>()

export const stringInt: DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.ParseStringE>>>
    | S.NextE<
        S.CompositionE<
          | S.NextE<S.RefinementE<S.LeafE<S.InvalidIntegerE>>>
          | S.PrevE<S.LeafE<S.ParseNumberE>>
        >
      >
  >,
  Int,
  number,
  S.RefinementE<S.LeafE<S.InvalidIntegerE>>,
  string,
  S.ApiSelfType<Int>
> = pipe(
  string[">>>"](stringIntFromString),
  brand<Int>(),
  S.annotate(stringIntIdentifier, {})
)

export const intIdentifier = S.makeAnnotation<{}>()

export const int: DefaultSchema<
  unknown,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.InvalidIntegerE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.ParseNumberE>>>
  >,
  Int,
  number,
  S.RefinementE<S.LeafE<S.InvalidIntegerE>>,
  number,
  S.ApiSelfType<Int>
> = pipe(number[">>>"](intFromNumber), brand<Int>(), S.annotate(intIdentifier, {}))
