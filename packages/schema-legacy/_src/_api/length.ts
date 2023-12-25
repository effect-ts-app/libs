import { pipe } from "@effect-app/core/Function"
import * as S from "../_schema.js"
import type { NonEmptyBrand } from "../custom.js"

export const maxLengthIdentifier = S.makeAnnotation<{ maxLength: number }>()

export function maxLength<Brand>(maxLength: number) {
  return <
    ParserInput,
    To extends { length: number },
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): S.Schema<ParserInput, To & Brand, ConstructorInput, From, Api> =>
    pipe(
      self,
      S.refine(
        (n): n is To & Brand => n.length <= maxLength,
        (n) => S.leafE(S.customE(n, `at most a size of ${maxLength}`))
      ),
      S.annotate(maxLengthIdentifier, { maxLength })
    )
}

export const minLengthIdentifier = S.makeAnnotation<{ minLength: number }>()

export function minLength<Brand>(minLength: number) {
  if (minLength < 1) {
    throw new Error("Must be at least 1")
  }
  return <
    ParserInput,
    To extends { length: number },
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): S.Schema<
    ParserInput,
    To & Brand & NonEmptyBrand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is To & Brand & NonEmptyBrand => n.length >= minLength,
        (n) => S.leafE(S.customE(n, `at least a length of ${minLength}`))
      ),
      S.annotate(minLengthIdentifier, { minLength })
    )
}

export function minSize<Brand>(minLength: number) {
  if (minLength < 1) {
    throw new Error("Must be at least 1")
  }
  return <
    ParserInput,
    To extends { size: number },
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): S.Schema<
    ParserInput,
    To & Brand & NonEmptyBrand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is To & Brand & NonEmptyBrand => n.size >= minLength,
        (n) => S.leafE(S.customE(n, `at least a size of ${minLength}`))
      ),
      S.annotate(minLengthIdentifier, { minLength })
    )
}

export function maxSize<Brand>(maxLength: number) {
  if (maxLength < 1) {
    throw new Error("Must be at least 1")
  }
  return <
    ParserInput,
    To extends { size: number },
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): S.Schema<
    ParserInput,
    To & Brand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is To & Brand => n.size <= maxLength,
        (n) => S.leafE(S.customE(n, `at most a size of ${maxLength}`))
      ),
      S.annotate(maxLengthIdentifier, { maxLength })
    )
}

export function constrained<Brand>(minLength: number, maxLength: number) {
  return <
    ParserInput,
    To extends { length: number },
    ConstructorInput,
    From,
    Api
  >(
    self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
  ) => {
    if (minLength < 1) {
      throw new Error("Must be at least 1")
    }
    // Combinging refinements into 1 to reduce complexity and improve performance
    return pipe(
      self,
      S.refine(
        (n): n is To & Brand & NonEmptyBrand => n.length >= minLength && n.length <= maxLength,
        (n) => S.leafE(S.customE(n, `at least a length of ${minLength} and at most ${maxLength}`))
      ),
      S.annotate(minLengthIdentifier, { minLength }),
      S.annotate(maxLengthIdentifier, { maxLength })
      /*minLength<Brand>(min), maxLength<Brand>(max)*/
    )
  }
}
