// tracing: off

import type { Schema, SchemaAny } from "../../_schema/index.js"
import * as S from "../../_schema/index.js"
import { hasContinuation, SchemaContinuationSymbol } from "../../_schema/index.js"
import type * as T from "../../These/index.js"
import * as Th from "../../These/index.js"

export interface ParserEnv {
  cache?: {
    getOrSet: <I, E, A>(i: I, parser: Parser<I, E, A>) => T.These<E, A>
    getOrSetParser: <I, E, A>(parser: Parser<I, E, A>) => (i: I) => Th.These<E, A>
    getOrSetParsers: <
      Parsers extends Record<string, Parser<unknown, unknown, unknown>>
    >(
      parsers: Parsers
    ) => { [k in keyof Parsers]: (u: unknown) => Th.These<unknown, unknown> }
  }
  lax?: boolean
}
/**
 * @tsplus type ets/Schema/Parser
 */
export type Parser<I, E, A> = {
  (u: I, env?: ParserEnv): T.These<E, A>
}

export const interpreters: ((
  schema: SchemaAny
) => Maybe<() => Parser<unknown, unknown, unknown>>)[] = [
  Maybe.partial(
    (miss) =>
      (schema: S.SchemaAny): (() => Parser<unknown, unknown, unknown>) => {
        if (schema instanceof S.SchemaNamed) {
          return () => {
            const self = parserFor(schema.self)
            return (u, env) =>
              Th.mapError_(self(u, env), (e) => S.namedE(schema.name, e))
          }
        }
        if (schema instanceof S.SchemaMapParserError) {
          return () => {
            const self = parserFor(schema.self)
            return (u, env) => Th.mapError_(self(u, env), schema.mapError)
          }
        }
        if (schema instanceof S.SchemaIdentity) {
          return () => (u) => Th.succeed(u)
        }
        if (schema instanceof S.SchemaPipe) {
          return () => {
            const self = parserFor(schema.self)
            const that = parserFor(schema.that)
            return (u, env) =>
              Th.chain_(
                pipe(
                  self(u, env),
                  Th.mapError((e) => S.compositionE(Chunk.single(S.prevE(e))))
                ),
                (a, w) =>
                  pipe(
                    that(a, env),
                    Th.foldM(
                      (a) => (w._tag === "Some" ? Th.warn(a, w.value) : Th.succeed(a)),
                      (a, e) =>
                        w._tag === "Some"
                          ? Th.warn(
                              a,
                              S.compositionE(w.value.errors.append(S.nextE(e)))
                            )
                          : Th.warn(a, e),
                      (e) =>
                        w._tag === "None"
                          ? Th.fail(S.compositionE(Chunk.single(S.nextE(e))))
                          : Th.fail(S.compositionE(w.value.errors.append(S.nextE(e))))
                    )
                  )
              )
          }
        }
        if (schema instanceof S.SchemaParser) {
          return () => schema.parser
        }
        if (schema instanceof S.SchemaRefinement) {
          return () => {
            const self = parserFor(schema.self)
            return (u, env) =>
              env?.lax
                ? // refinements can really pile up
                  self(u, env)
                : Th.chain_(
                    pipe(
                      self(u, env),
                      Th.mapError((e) => S.compositionE(Chunk.single(S.prevE(e))))
                    ),
                    (
                      a,
                      w
                    ): Th.These<
                      S.CompositionE<
                        S.PrevE<unknown> | S.NextE<S.RefinementE<unknown>>
                      >,
                      unknown
                    > =>
                      schema.refinement(a)
                        ? w._tag === "None"
                          ? Th.succeed(a)
                          : Th.warn(a, w.value)
                        : Th.fail(
                            S.compositionE(
                              w._tag === "None"
                                ? Chunk.single(S.nextE(S.refinementE(schema.error(a))))
                                : w.value.errors.append(
                                    S.nextE(S.refinementE(schema.error(a)))
                                  )
                            )
                          )
                  )
          }
        }
        return miss()
      }
  ),
]

const cache = new WeakMap()

function parserFor<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  schema: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): Parser<ParserInput, any, ParsedShape> {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    let x: Parser<unknown, unknown, unknown>
    const parser: Parser<unknown, unknown, unknown> = (__, env) => {
      if (!x) {
        x = parserFor(schema.self())
      }
      return x(__, env)
    }
    cache.set(schema, parser)
    return parser as Parser<ParserInput, any, ParsedShape>
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      let x: Parser<unknown, unknown, unknown>
      const parser: Parser<unknown, unknown, unknown> = (__, env) => {
        if (!x) {
          x = _.value()
        }
        return x(__, env)
      }
      return parser as Parser<ParserInput, any, ParsedShape>
    }
  }
  if (hasContinuation(schema)) {
    let x: Parser<unknown, unknown, unknown>
    const parser: Parser<unknown, unknown, unknown> = (__, env) => {
      if (!x) {
        x = parserFor(schema[SchemaContinuationSymbol])
      }
      return x(__, env)
    }
    cache.set(schema, parser)
    return parser as Parser<ParserInput, any, ParsedShape>
  }
  throw new Error(`Missing parser integration for: ${schema.constructor}`)
}

export { parserFor as for }
