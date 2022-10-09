// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import { makeAnnotation } from "../_schema/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import * as Th from "../These/index.js"
import { unknownArray } from "./unknownArray.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const fromChunkIdentifier = makeAnnotation<{ self: S.SchemaAny }>()

export function fromChunk<
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  readonly ParserInput[],
  Chunk<ParsedShape>,
  Iterable<ParsedShape>,
  readonly Encoded[],
  { self: Api }
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const parse = Parser.for(self)
  const refinement = (_: unknown): _ is Chunk<ParsedShape> =>
    Chunk.isChunk(_) && _.forAll(guard)
  const encode = Encoder.for(self)

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.array(arb(_)).map(Chunk.from)),
    S.parser((i: readonly ParserInput[], env) => {
      const parseEl = env?.cache ? env.cache.getOrSetParser(parse) : parse
      const b = Chunk.builder<ParsedShape>()
      const e = Chunk.builder<S.OptionalIndexE<number, ParserError>>()
      let j = 0
      let err = false
      let warn = false
      for (const a of i) {
        const res = Th.result(parseEl(a))
        if (res._tag === "Right") {
          if (!err) {
            b.append(res.right.get(0))
            const w = res.right.get(1)
            if (w._tag === "Some") {
              warn = true
              e.append(S.optionalIndexE(j, w.value))
            }
          }
        } else {
          err = true
          e.append(S.optionalIndexE(j, res.left))
        }
        j++
      }
      if (err) {
        return Th.fail(S.chunkE(e.build()))
      }
      if (warn) {
        return Th.warn(b.build(), S.chunkE(e.build()))
      }
      return Th.succeed(b.build())
    }),
    S.constructor((i: Iterable<ParsedShape>) => Th.succeed(Chunk.from(i))),
    S.encoder((_) => _.map(encode).toArray as readonly Encoded[]),
    S.mapApi(() => ({ self: self.Api })),
    withDefaults,
    S.annotate(fromChunkIdentifier, { self })
  )
}

export const chunkIdentifier = makeAnnotation<{ self: S.SchemaAny }>()

export function chunk<ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  unknown,
  Chunk<ParsedShape>,
  Iterable<ParsedShape>,
  readonly Encoded[],
  { self: Api }
> {
  const encodeSelf = Encoder.for(self)
  return pipe(
    unknownArray[">>>"](fromChunk(self)),
    S.encoder((_) => _.map(encodeSelf).toArray),
    withDefaults,
    S.annotate(chunkIdentifier, { self })
  )
}
