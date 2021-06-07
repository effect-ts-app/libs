// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"
import * as S from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Th from "@effect-ts/schema/These"

export const fromArrayIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function fromArray<
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  self: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  readonly ParserInput[],
  S.CollectionE<S.OptionalIndexE<number, ParserError>>,
  readonly ParsedShape[],
  readonly ParsedShape[],
  never,
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
    S.mapParserError((_) => Chunk.unsafeHead(_.errors).error),
    S.constructor((_: readonly ParsedShape[]) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(fromArrayIdentifier, { self })
  )
}
