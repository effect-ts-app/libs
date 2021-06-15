// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { pipe } from "@effect-ts/core/Function"
import * as S from "@effect-ts/schema"
import { leafE, unknownArrayE } from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Th from "@effect-ts/schema/These"
import * as O from "@effect-ts-app/core/Option"

import { minLengthIdentifier } from "./length"

export function nonEmptyArray<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  self: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.UnknownArrayE>>>
    | S.NextE<S.CollectionE<S.OptionalIndexE<number, ParserError>>>
  >,
  NonEmptyArray<ParsedShape>,
  NonEmptyArray<ParsedShape>,
  never,
  readonly Encoded[],
  { self: Api }
> {
  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromChunk = pipe(
    S.identity(
      (u): u is NonEmptyArray<ParsedShape> =>
        Array.isArray(u) && u.length > 0 && u.every(guardSelf)
    ),
    S.parser((u: Chunk.Chunk<ParsedShape>) => {
      const ar = Chunk.toArray(u)
      const nar = NA.fromArray(ar)
      return O.fold_(nar, () => Th.fail(leafE(unknownArrayE(u)) as any), Th.succeed)
    }),
    S.encoder((u): Chunk.Chunk<ParsedShape> => Chunk.from(u)),
    S.arbitrary(
      (_) =>
        _.array(arbitrarySelf(_), { minLength: 1 }) as any as Arbitrary.Arbitrary<
          NonEmptyArray<ParsedShape>
        >
    )
  )

  return pipe(
    S.chunk(self)[">>>"](fromChunk),
    S.mapParserError((_) => Chunk.unsafeHead(_.errors).error),
    S.constructor((_: NonEmptyArray<ParsedShape>) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(minLengthIdentifier, { self, minLength: 1 }),
    S.annotate(S.arrayIdentifier, { self })
  )
}
