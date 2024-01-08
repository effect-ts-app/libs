// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Th from "../These.js"
import { chunk } from "./chunk.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const arrayIdentifier = S.makeAnnotation<{ self: S.SchemaUPI }>()

export function array<To, ConstructorInput, From, Api>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>
): DefaultSchema<
  unknown,
  readonly To[],
  readonly To[],
  readonly From[],
  { self: Api }
> {
  const guardSelf = Guard.is(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromChunk = pipe(
    S.identity(
      (u): u is readonly To[] => Array.isArray(u) && u.every(guardSelf)
    ),
    S.parser((u: Chunk<To>) => Th.succeed(u.toReadonlyArray)),
    S.encoder((u): Chunk<To> => Chunk.fromIterable(u)),
    S.arbitrary((_) => _.array(arbitrarySelf(_)))
  )

  return pipe(
    chunk(self)[">>>"](fromChunk),
    S.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
    S.constructor((_: readonly To[]) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    withDefaults,
    S.annotate(arrayIdentifier, { self })
  )
}
