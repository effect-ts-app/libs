// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../custom.js"
import { leafE, unknownArrayE } from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Th from "../custom/These.js"
import { minLengthIdentifier } from "./length.js"

export function NonEmptyReadonlyArray<ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): S.DefaultSchema<
  unknown,
  NonEmptyReadonlyArray<ParsedShape>,
  NonEmptyReadonlyArray<ParsedShape>,
  readonly Encoded[],
  { self: Api }
> {
  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromChunk = pipe(
    S.identity(
      (u): u is NonEmptyReadonlyArray<ParsedShape> => Array.isArray(u) && u.length > 0 && u.every(guardSelf)
    ),
    S.parser((u: Chunk<ParsedShape>) => {
      const ar = u.toArray
      const nar = NonEmptyArray.fromArray(ar)
      return nar.toMaybe.fold(() => Th.fail(leafE(unknownArrayE(u)) as any), Th.succeed)
    }),
    S.encoder((u): Chunk<ParsedShape> => Chunk.from(u)),
    S.arbitrary(
      _ =>
        _.array(arbitrarySelf(_), { minLength: 1 }) as any as Arbitrary.Arbitrary<
          NonEmptyReadonlyArray<ParsedShape>
        >
    )
  )

  return pipe(
    S.chunk(self)[">>>"](fromChunk),
    S.mapParserError(_ => ((_ as any).errors as Chunk<any>).unsafeHead.error),
    S.constructor((_: NonEmptyReadonlyArray<ParsedShape>) => Th.succeed(_)),
    S.encoder(u => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(minLengthIdentifier, { self, minLength: 1 }),
    S.annotate(S.arrayIdentifier, { self })
  )
}
