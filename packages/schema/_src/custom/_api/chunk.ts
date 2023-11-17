// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import { makeAnnotation } from "../_schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import * as Th from "../These.js"
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
  const refinement = (_: unknown): _ is Chunk<ParsedShape> => Chunk.isChunk(_) && _.every(guard)
  const encode = Encoder.for(self)

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.array(arb(_)).map(Chunk.fromIterable)),
    S.parser((i: readonly ParserInput[], env) => {
      const parseEl = env?.cache ? env.cache.getOrSetParser(parse) : parse
      const b: ParsedShape[] = []
      const e: S.OptionalIndexE<number, ParserError[]>[] = []
      let j = 0
      let err = false
      let warn = false
      for (const a of i) {
        const res = Th.result(parseEl(a))
        if (res._tag === "Right") {
          if (!err) {
            b.push(res.right[0])
            const w = res.right[1]
            if (w._tag === "Some") {
              warn = true
              e.push(S.optionalIndexE(j, w.value))
            }
          }
        } else {
          err = true
          e.push(S.optionalIndexE(j, res.left))
        }
        j++
      }
      if (err) {
        return Th.fail(S.chunkE(e.toChunk))
      }
      if (warn) {
        return Th.warn(b.toChunk, S.chunkE(e.toChunk))
      }
      return Th.succeed(b.toChunk)
    }),
    S.constructor((i: Iterable<ParsedShape>) => Th.succeed(Chunk.fromIterable(i))),
    S.encoder((_) => _.map(encode).toReadonlyArray),
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
    S.encoder((_) => _.map(encodeSelf).toReadonlyArray),
    withDefaults,
    S.annotate(chunkIdentifier, { self })
  )
}
