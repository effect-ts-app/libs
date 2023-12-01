// tracing: off

import { every_, fromArray, Set, toArray } from "@effect-app/core/Set"

import * as MO from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Th from "../custom/These.js"

export const setIdentifier = MO.makeAnnotation<{ self: MO.SchemaUPI }>()

export function set<To, ConstructorInput, From, Api>(
  self: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  ord: Order<To>,
  eq_?: Equivalence<To>
): MO.DefaultSchema<
  unknown,
  Set<To>,
  Set<To>,
  readonly From[],
  { self: Api; eq: Equivalence<To>; ord: Order<To> }
> {
  const refinement = (_: unknown): _ is Set<To> => _ instanceof Set && every_(_, guardSelf)

  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const eq = eq_ ?? ((x, y) => ord(x, y) === 0)

  const fromArray_ = fromArray(eq)
  const toArray_ = toArray(ord)

  const fromChunk = pipe(
    MO.identity(refinement),
    MO.parser((u: Chunk<To>) => Th.succeed(fromArray_(u.toReadonlyArray))),
    MO.encoder((u): Chunk<To> => Chunk.fromIterable(u)),
    MO.arbitrary((_) => _.uniqueArray(arbitrarySelf(_)).map(fromArray_))
  )

  return pipe(
    MO.chunk(self)[">>>"](fromChunk),
    MO.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
    MO.constructor((_: Set<To>) => Th.succeed(_)),
    MO.encoder((u) => toArray_(u).map(encodeSelf)),
    MO.mapApi(() => ({ self: self.Api, eq, ord })),
    MO.withDefaults,
    MO.annotate(setIdentifier, { self })
  )
}
