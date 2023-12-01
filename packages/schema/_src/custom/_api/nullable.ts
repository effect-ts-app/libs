import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Constructor from "../Constructor.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import * as Th from "../These.js"
import { defProp, type Property } from "./properties.js"
import { withDefaults } from "./withDefaults.js"
import type { DefaultSchema } from "./withDefaults.js"

export const nullableIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export type Nullable<A> = A | null

const cache = new WeakMap<S.SchemaAny, S.SchemaAny>()

export function nullable<ParserInput, To, ConstructorInput, From, Api>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
):
  & DefaultSchema<
    ParserInput | null,
    To | null,
    ConstructorInput | null,
    From | null,
    Api
  >
  & {
    withDefault: Property<
      S.Schema<unknown, To | null, ConstructorInput | null, From | null, Api>,
      "required",
      None<any>,
      Some<["constructor", () => To]>
    >
  }
{
  if (cache.has(self)) return cache.get(self)! as any
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const create = Constructor.for(self)
  const parse = Parser.for(self)
  const refinement = (u: unknown): u is To | null => u === null || guard(u)
  const encode = Encoder.for(self)

  const s = pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.option(arb(_))),
    S.parser((i: ParserInput | null, env) =>
      i === null
        ? Th.succeed(null)
        : (env?.cache ? env.cache.getOrSetParser(parse) : parse)(i)
    ),
    S.constructor((x: ConstructorInput | null) => x === null ? Th.succeed(null) : create(x)),
    S.encoder((_) => (_ === null ? null : encode(_))),
    S.mapApi(() => self.Api),
    withDefaults,
    S.annotate(nullableIdentifier, { self })
  )

  const n = Object.assign(s, {
    withDefault: defProp(s as any, () => null)
  }) as any // TODO: fix this

  cache.set(self, n)
  return n
}
