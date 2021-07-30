// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import { every_, fromArray, toArray } from "@effect-ts/core/Collections/Immutable/Set"
import type * as Eq from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as Ord from "@effect-ts/core/Ord"
import * as MO from "../custom"
import * as Arbitrary from "../custom/Arbitrary"
import * as Encoder from "../custom/Encoder"
import * as Guard from "../custom/Guard"
import * as Th from "../custom/These"

export const setIdentifier = MO.makeAnnotation<{ self: MO.SchemaUPI }>()

export function set<ParsedShape, ConstructorInput, Encoded, Api>(
  self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Ord.Ord<ParsedShape>,
  eq?: Eq.Equal<ParsedShape>
): MO.DefaultSchema<
  unknown,
  Set<ParsedShape>,
  Set<ParsedShape>,
  readonly Encoded[],
  { self: Api; eq: Eq.Equal<ParsedShape>; ord: Ord.Ord<ParsedShape> }
> {
  const refinement = (_: unknown): _ is Set<ParsedShape> =>
    _ instanceof Set && every_(_, guardSelf)

  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const eq_ = eq ?? Ord.getEqual(ord)

  const fromArray_ = fromArray(eq_)
  const toArray_ = toArray(ord)

  const fromChunk = pipe(
    MO.identity(refinement),
    MO.parser((u: Chunk.Chunk<ParsedShape>) =>
      Th.succeed(fromArray_(Chunk.toArray(u)))
    ),
    MO.encoder((u): Chunk.Chunk<ParsedShape> => Chunk.from(u)),
    MO.arbitrary((_) => _.set(arbitrarySelf(_)).map(fromArray_))
  )

  return pipe(
    MO.chunk(self)[">>>"](fromChunk),
    MO.mapParserError((_) => (Chunk.unsafeHead((_ as any).errors) as any).error),
    MO.constructor((_: Set<ParsedShape>) => Th.succeed(_)),
    MO.encoder((u) => toArray_(u).map(encodeSelf)),
    MO.mapApi(() => ({ self: self.Api, eq: eq_, ord })),
    MO.withDefaults,
    MO.annotate(setIdentifier, { self })
  )
}
