// tracing: off

import type * as fc from "fast-check"

import * as S from "../../_schema/index.js"
import { hasContinuation, SchemaContinuationSymbol } from "../../_schema/index.js"

/**
 * @tsplus type ets/Schema/Arbitrary/Gen
 */
export type Gen<T> = { (_: typeof fc): fc.Arbitrary<T> }

export const interpreters: ((schema: S.SchemaAny) => Maybe<() => Gen<unknown>>)[] = [
  Maybe.partial((miss) => (schema: S.SchemaAny): (() => Gen<unknown>) => {
    if (schema instanceof S.SchemaIdentity) {
      return () => (_) => _.anything().filter(schema.guard)
    }
    if (schema instanceof S.SchemaArbitrary) {
      return () => schema.arbitrary
    }
    if (schema instanceof S.SchemaRefinement) {
      return () => {
        const self = for_(schema.self)
        return (_) => self(_).filter(schema.refinement)
      }
    }
    return miss()
  }),
]

const cache = new WeakMap()

function for_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  schema: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): Gen<ParsedShape> {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    const arb: Gen<unknown> = (__) => for_(schema.self())(__)
    cache.set(schema, arb)
    return arb as Gen<ParsedShape>
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      let x: Gen<unknown>
      const arb: Gen<unknown> = (__) => {
        if (!x) {
          x = _.value()
        }
        return x(__)
      }
      cache.set(schema, arb)
      return arb as Gen<ParsedShape>
    }
  }
  if (hasContinuation(schema)) {
    let x: Gen<unknown>
    const arb: Gen<unknown> = (__) => {
      if (!x) {
        x = for_(schema[SchemaContinuationSymbol])
      }
      return x(__)
    }
    cache.set(schema, arb)
    return arb as Gen<ParsedShape>
  }
  throw new Error(`Missing arbitrary integration for: ${schema.constructor}`)
}

export { for_ as for }
