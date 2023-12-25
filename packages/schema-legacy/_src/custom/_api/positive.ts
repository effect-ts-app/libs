// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const minIdentifier = S.makeAnnotation<
  { self: S.SchemaAny; minimum: number; minimumExclusive: boolean; type: "float" | "int" }
>()

export function min<Brand>(min: number, minimumExclusive = false, type: "float" | "int" = "float") {
  return <
    ParserInput,
    To extends number,
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    ParserInput,
    To & Brand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        minimumExclusive
          ? (n): n is To & Brand => n > min
          : (n): n is To & Brand => n >= min,
        (n) => S.leafE(S.customE(n, `a ${type} ${minimumExclusive ? "larger than" : "at least"} ${min}`))
      ),
      withDefaults,
      S.annotate(minIdentifier, { self, minimum: min, minimumExclusive, type })
    )
}

export const maxIdentifier = S.makeAnnotation<
  { self: S.SchemaAny; maximum: number; maximumExclusive: boolean; type: "float" | "int" }
>()

export function max<Brand>(max: number, maximumExclusive = false, type: "float" | "int" = "float") {
  return <
    ParserInput,
    To extends number,
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    ParserInput,
    To & Brand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        maximumExclusive
          ? (n): n is To & Brand => n < max
          : (n): n is To & Brand => n <= max,
        (n) => S.leafE(S.customE(n, `a ${type} ${maximumExclusive ? "smaller than" : "at most"} ${max}`))
      ),
      withDefaults,
      S.annotate(maxIdentifier, { self, maximum: max, maximumExclusive, type })
    )
}

export const rangeIdentifier = S.makeAnnotation<
  {
    self: S.SchemaAny
    minimum: number
    minimumExclusive: boolean
    maximum: number
    maximumExclusive: boolean
    type: "float" | "int"
  }
>()

export function range<Brand>(
  min: { value: number; exclusive?: boolean },
  max: { value: number; exclusive?: boolean },
  type: "float" | "int" = "float"
) {
  const isMin = min.exclusive
    ? (n: number) => n > min.value
    : (n: number) => n >= min.value
  const isMax = max.exclusive
    ? (n: number) => n < max.value
    : (n: number) => n <= max.value
  return <
    ParserInput,
    To extends number,
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    ParserInput,
    To & Brand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is To & Brand => isMin(n) && isMax(n),
        (n) =>
          S.leafE(
            S.customE(
              n,
              `a ${type} ${min.exclusive ? "larger than" : "at least"} ${min.value} and ${
                max.exclusive ? "smaller than" : "at most"
              } ${max.value}`
            )
          )
      ),
      withDefaults,
      S.annotate(rangeIdentifier, {
        self,
        type,
        minimum: min.value,
        minimumExclusive: !!max.exclusive,
        maximum: max.value,
        maximumExclusive: !!max.exclusive
      })
    )
}

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export function positive(type: "float" | "int") {
  return <
    ParserInput,
    To extends number,
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    ParserInput,
    To & PositiveBrand,
    ConstructorInput,
    From,
    Api
  > => min<PositiveBrand>(0, false, type)(self)
}

export interface PositiveExcludeZeroBrand extends PositiveBrand {
  readonly PositiveExcludeZero: unique symbol
}

export type PositiveExcludeZero = number & PositiveExcludeZeroBrand

export function positiveExcludeZero(type: "float" | "int") {
  return <
    ParserInput,
    To extends number,
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    ParserInput,
    To & PositiveExcludeZeroBrand,
    ConstructorInput,
    From,
    Api
  > => min<PositiveExcludeZeroBrand>(0, true, type)(self)
}
