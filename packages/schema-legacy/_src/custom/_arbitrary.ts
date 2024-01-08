// tracing: off

import type * as fc from "fast-check"

import * as S from "./_schema.js"
import { hasContinuation, SchemaContinuationSymbol } from "./_schema.js"

/**
 * @tsplus type ets/Schema/Arbitrary/Gen
 */
export type Gen<T> = { (_: typeof fc): fc.Arbitrary<T> }

export const interpreters: ((schema: S.SchemaAny) => Option<() => Gen<unknown>>)[] = [
  Option.partial((miss) => (schema: S.SchemaAny): () => Gen<unknown> => {
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
  })
]

const cache = new WeakMap()

function for_<ParserInput, To, ConstructorInput, From, Api>(
  schema: S.Schema<ParserInput, To, ConstructorInput, From, Api>
): Gen<To> {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    const arb: Gen<unknown> = (__) => for_(schema.self())(__)
    cache.set(schema, arb)
    return arb as Gen<To>
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
      return arb as Gen<To>
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
    return arb as Gen<To>
  }
  throw new Error(`Missing arbitrary integration for: ${schema.constructor}`)
}

export { for_ as for }
