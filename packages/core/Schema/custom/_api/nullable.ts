import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Constructor from "../Constructor/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import * as Th from "../These/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const nullableIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export type Nullable<A> = A | null

export function nullable<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  ParserInput | null,
  ParsedShape | null,
  ConstructorInput | null,
  Encoded | null,
  Api
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const create = Constructor.for(self)
  const parse = Parser.for(self)
  const refinement = (u: unknown): u is ParsedShape | null => u === null || guard(u)
  const encode = Encoder.for(self)

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.option(arb(_))),
    S.parser((i: ParserInput | null, env) =>
      i === null
        ? Th.succeed(null)
        : (env?.cache ? env.cache.getOrSetParser(parse) : parse)(i)
    ),
    S.constructor((x: ConstructorInput | null) =>
      x === null ? Th.succeed(null) : create(x)
    ),
    S.encoder((_) => (_ === null ? null : encode(_))),
    S.mapApi(() => self.Api as Api),
    withDefaults,
    S.annotate(nullableIdentifier, { self })
  )
}
