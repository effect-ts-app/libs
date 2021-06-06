// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as O from "@effect-ts/core/Option"

import type { Schema, SchemaAny } from "../../_schema"
import * as S from "../../_schema"
import { hasContinuation, SchemaContinuationSymbol } from "../../_schema"
import type * as T from "../../These"
import * as Th from "../../These"

export type Parser<I, E, A> = {
  (u: I): T.These<E, A>
}

export const interpreters: ((
  schema: SchemaAny
) => O.Option<() => Parser<unknown, unknown, unknown>>)[] = [
  O.partial((miss) => (schema: S.SchemaAny): (() => Parser<
    unknown,
    unknown,
    unknown
  >) => {
    if (schema instanceof S.SchemaNamed) {
      return () => {
        const self = parserFor(schema.self)
        return (u) => Th.mapError_(self(u), (e) => S.namedE(schema.name, e))
      }
    }
    if (schema instanceof S.SchemaMapParserError) {
      return () => {
        const self = parserFor(schema.self)
        return (u) => Th.mapError_(self(u), schema.mapError)
      }
    }
    if (schema instanceof S.SchemaIdentity) {
      return () => (u) => Th.succeed(u)
    }
    if (schema instanceof S.SchemaPipe) {
      return () => {
        const self = parserFor(schema.self)
        const that = parserFor(schema.that)
        return (u) =>
          Th.chain_(
            self(u)["|>"](Th.mapError((e) => S.compositionE(Chunk.single(S.prevE(e))))),
            (a, w) =>
              that(a)["|>"](
                Th.foldM(
                  (a) => (w._tag === "Some" ? Th.warn(a, w.value) : Th.succeed(a)),
                  (a, e) =>
                    w._tag === "Some"
                      ? Th.warn(
                          a,
                          S.compositionE(Chunk.append_(w.value.errors, S.nextE(e)))
                        )
                      : Th.warn(a, e),
                  (e) =>
                    w._tag === "None"
                      ? Th.fail(S.compositionE(Chunk.single(S.nextE(e))))
                      : Th.fail(
                          S.compositionE(Chunk.append_(w.value.errors, S.nextE(e)))
                        )
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
        return (u) =>
          Th.chain_(
            self(u)["|>"](Th.mapError((e) => S.compositionE(Chunk.single(S.prevE(e))))),
            (
              a,
              w
            ): Th.These<
              S.CompositionE<S.PrevE<unknown> | S.NextE<S.RefinementE<unknown>>>,
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
                        : Chunk.append_(
                            w.value.errors,
                            S.nextE(S.refinementE(schema.error(a)))
                          )
                    )
                  )
          )
      }
    }
    return miss()
  })
]

const cache = new WeakMap()

function parserFor<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  schema: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): Parser<ParserInput, ParserError, ParsedShape> {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    const parser: Parser<unknown, unknown, unknown> = (__) =>
      parserFor(schema.self())(__)
    cache.set(schema, parser)
    return parser as Parser<ParserInput, ParserError, ParsedShape>
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      let x: Parser<unknown, unknown, unknown>
      const parser: Parser<unknown, unknown, unknown> = (__) => {
        if (!x) {
          x = _.value()
        }
        return x(__)
      }
      return parser as Parser<ParserInput, ParserError, ParsedShape>
    }
  }
  if (hasContinuation(schema)) {
    let x: Parser<unknown, unknown, unknown>
    const parser: Parser<unknown, unknown, unknown> = (__) => {
      if (!x) {
        x = parserFor(schema[SchemaContinuationSymbol])
      }
      return x(__)
    }
    cache.set(schema, parser)
    return parser as Parser<ParserInput, ParserError, ParsedShape>
  }
  throw new Error(`Missing parser integration for: ${schema.constructor}`)
}

export { parserFor as for }
