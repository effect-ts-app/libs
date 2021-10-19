// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import { makeAnnotation } from "../_schema"
import * as Arbitrary from "../Arbitrary"
import * as Encoder from "../Encoder"
import * as Guard from "../Guard"
import * as Parser from "../Parser"
import * as Th from "../These"
import { unknownArray } from "./unknownArray"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

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
  Chunk.Chunk<ParsedShape>,
  Iterable<ParsedShape>,
  readonly Encoded[],
  { self: Api }
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const parse = Parser.for(self)
  const refinement = (_: unknown): _ is Chunk.Chunk<ParsedShape> =>
    Chunk.isChunk(_) && Chunk.every_(_, guard)
  const encode = Encoder.for(self)

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.array(arb(_)).map(Chunk.from)),
    S.parser((i: readonly ParserInput[]) => {
      const b = Chunk.builder<ParsedShape>()
      const e = Chunk.builder<S.OptionalIndexE<number, ParserError>>()
      let j = 0
      let err = false
      let warn = false
      for (const a of i) {
        const res = Th.result(parse(a))
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
    S.encoder((_) => Chunk.toArray(Chunk.map_(_, encode)) as readonly Encoded[]),
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
  Chunk.Chunk<ParsedShape>,
  Iterable<ParsedShape>,
  readonly Encoded[],
  { self: Api }
> {
  const encodeSelf = Encoder.for(self)
  return pipe(
    unknownArray[">>>"](fromChunk(self)),
    S.encoder((_) => Chunk.toArray(Chunk.map_(_, encodeSelf))),
    withDefaults,
    S.annotate(chunkIdentifier, { self })
  )
}
