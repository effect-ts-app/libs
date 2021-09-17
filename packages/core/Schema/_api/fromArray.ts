// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../custom"
import * as Arbitrary from "../custom/Arbitrary"
import * as Encoder from "../custom/Encoder"
import * as Guard from "../custom/Guard"
import * as Th from "../custom/These"

export const fromArrayIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function fromArray<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): S.DefaultSchema<
  readonly ParserInput[],
  readonly ParsedShape[],
  readonly ParsedShape[],
  readonly Encoded[],
  { self: Api }
> {
  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromFromChunk = pipe(
    S.identity(
      (u): u is readonly ParsedShape[] => Array.isArray(u) && u.every(guardSelf)
    ),
    S.parser((u: Chunk.Chunk<ParsedShape>) => Th.succeed(Chunk.toArray(u))),
    S.encoder((u): Chunk.Chunk<ParsedShape> => Chunk.from(u)),
    S.arbitrary((_) => _.array(arbitrarySelf(_)))
  )

  return pipe(
    S.fromChunk(self)[">>>"](fromFromChunk),
    S.mapParserError((_) => (Chunk.unsafeHead((_ as any).errors) as any).error),
    S.constructor((_: readonly ParsedShape[]) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(fromArrayIdentifier, { self })
  )
}
