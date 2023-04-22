import { pipe } from "@effect-app/core/Function"

import { defaultProp } from "_src/ext.js"
import * as S from "../_schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Constructor from "../Constructor.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import * as Th from "../These.js"
import type { Property } from "./properties.js"
import { withDefaults } from "./withDefaults.js"
import type { DefaultSchema } from "./withDefaults.js"

export const nullableIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export type Nullable<A> = A | null

export function nullable<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
):
  & DefaultSchema<
    ParserInput | null,
    ParsedShape | null,
    ConstructorInput | null,
    Encoded | null,
    Api
  >
  & {
    withDefault: Property<
      S.Schema<unknown, ParsedShape | null, ConstructorInput | null, Encoded | null, Api>,
      "required",
      None<any>,
      Some<["constructor", () => ParsedShape]>
    >
  }
{
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const create = Constructor.for(self)
  const parse = Parser.for(self)
  const refinement = (u: unknown): u is ParsedShape | null => u === null || guard(u)
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

  return Object.assign(s, {
    withDefault: defaultProp(s as any)
  }) as any // TODO: fix this
}
