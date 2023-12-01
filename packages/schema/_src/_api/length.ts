import { pipe } from "@effect-app/core/Function"
import * as MO from "../_schema.js"
import type { NonEmptyBrand } from "../custom.js"

export const maxLengthIdentifier = MO.makeAnnotation<{ maxLength: number }>()

export function maxLength<Brand>(maxLength: number) {
  return <
    ParserInput,
    To extends { length: number },
    ConstructorInput,
    From,
    Api
  >(
    self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): MO.Schema<ParserInput, To & Brand, ConstructorInput, From, Api> =>
    pipe(
      self,
      MO.refine(
        (n): n is To & Brand => n.length <= maxLength,
        (n) => MO.leafE(MO.customE(n, `at most a size of ${maxLength}`))
      ),
      MO.annotate(maxLengthIdentifier, { maxLength })
    )
}

export const minLengthIdentifier = MO.makeAnnotation<{ minLength: number }>()

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
    self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): MO.Schema<
    ParserInput,
    To & Brand & NonEmptyBrand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      MO.refine(
        (n): n is To & Brand & NonEmptyBrand => n.length >= minLength,
        (n) => MO.leafE(MO.customE(n, `at least a length of ${minLength}`))
      ),
      MO.annotate(minLengthIdentifier, { minLength })
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
    self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): MO.Schema<
    ParserInput,
    To & Brand & NonEmptyBrand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      MO.refine(
        (n): n is To & Brand & NonEmptyBrand => n.size >= minLength,
        (n) => MO.leafE(MO.customE(n, `at least a size of ${minLength}`))
      ),
      MO.annotate(minLengthIdentifier, { minLength })
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
    self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
  ): MO.Schema<
    ParserInput,
    To & Brand,
    ConstructorInput,
    From,
    Api
  > =>
    pipe(
      self,
      MO.refine(
        (n): n is To & Brand => n.size <= maxLength,
        (n) => MO.leafE(MO.customE(n, `at most a size of ${maxLength}`))
      ),
      MO.annotate(maxLengthIdentifier, { maxLength })
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
    self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
  ) => {
    if (minLength < 1) {
      throw new Error("Must be at least 1")
    }
    // Combinging refinements into 1 to reduce complexity and improve performance
    return pipe(
      self,
      MO.refine(
        (n): n is To & Brand & NonEmptyBrand => n.length >= minLength && n.length <= maxLength,
        (n) => MO.leafE(MO.customE(n, `at least a length of ${minLength} and at most ${maxLength}`))
      ),
      MO.annotate(minLengthIdentifier, { minLength }),
      MO.annotate(maxLengthIdentifier, { maxLength })
      /*minLength<Brand>(min), maxLength<Brand>(max)*/
    )
  }
}
