// tracing: off

import { every_, fromArray, Set, toArray } from "@effect-app/core/Set"

import * as S from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Th from "../custom/These.js"

export const setIdentifier = S.makeAnnotation<{ self: S.SchemaUPI }>()

export function set<To, ConstructorInput, From, Api>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>,
  ord: Order<To>,
  eq_?: Equivalence<To>
): S.DefaultSchema<
  unknown,
  Set<To>,
  Set<To>,
  readonly From[],
  { self: Api; eq: Equivalence<To>; ord: Order<To> }
> {
  const refinement = (_: unknown): _ is Set<To> => _ instanceof Set && every_(_, guardSelf)

  const guardSelf = S.is(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const eq = eq_ ?? ((x, y) => ord(x, y) === 0)

  const fromArray_ = fromArray(eq)
  const toArray_ = toArray(ord)

  const fromChunk = pipe(
    S.identity(refinement),
    S.parser((u: Chunk<To>) => Th.succeed(fromArray_(u.toReadonlyArray))),
    S.encoder((u): Chunk<To> => Chunk.fromIterable(u)),
    S.arbitrary((_) => _.uniqueArray(arbitrarySelf(_)).map(fromArray_))
  )

  return pipe(
    S.chunk(self)[">>>"](fromChunk),
    S.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
    S.constructor((_: Set<To>) => Th.succeed(_)),
    S.encoder((u) => toArray_(u).map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api, eq, ord })),
    S.withDefaults,
    S.annotate(setIdentifier, { self })
  )
}
