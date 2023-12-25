// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Th from "../custom/These.js"

export const fromArrayIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function fromArray<ParserInput, To, ConstructorInput, From, Api>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  readonly ParserInput[],
  readonly To[],
  readonly To[],
  readonly From[],
  { self: Api }
> {
  const guardSelf = S.is(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromFromChunk = pipe(
    S.identity(
      (u): u is readonly To[] => Array.isArray(u) && u.every(guardSelf)
    ),
    S.parser((u: Chunk<To>) => Th.succeed(u.toReadonlyArray)),
    S.encoder((u): Chunk<To> => Chunk.fromIterable(u)),
    S.arbitrary((_) => _.array(arbitrarySelf(_)))
  )

  return pipe(
    S.fromChunk(self)[">>>"](fromFromChunk),
    S.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead().error),
    S.constructor((_: readonly To[]) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(fromArrayIdentifier, { self })
  )
}
