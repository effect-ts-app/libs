// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Th from "../custom/These.js"

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
    S.parser((u: Chunk<ParsedShape>) => Th.succeed(u.toArray as readonly ParsedShape[])),
    S.encoder((u): Chunk<ParsedShape> => Chunk.fromIterable(u)),
    S.arbitrary(_ => _.array(arbitrarySelf(_)))
  )

  return pipe(
    S.fromChunk(self)[">>>"](fromFromChunk),
    S.mapParserError(_ => ((_ as any).errors as Chunk<any>).unsafeHead().error),
    S.constructor((_: readonly ParsedShape[]) => Th.succeed(_)),
    S.encoder(u => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(fromArrayIdentifier, { self })
  )
}
