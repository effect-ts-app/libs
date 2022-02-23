import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as S from "../_schema"
import * as Arbitrary from "../Arbitrary"
import * as Constructor from "../Constructor"
import * as Encoder from "../Encoder"
import * as Guard from "../Guard"
import * as Parser from "../Parser"
import * as Th from "../These"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const optionFromNullIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function optionFromNull<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  ParserInput | null,
  O.Option<ParsedShape>,
  O.Option<ConstructorInput>,
  Encoded | null,
  Api
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const create = Constructor.for(self)
  const parse = Parser.for(self)
  const refinement = (u: unknown): u is O.Option<ParsedShape> =>
    typeof u === "object" &&
    u !== null &&
    ["None", "Some"].indexOf(u["_tag"]) !== -1 &&
    ((u["_tag"] === "Some" && guard(u["value"])) || u["_tag"] === "None")
  const encode = Encoder.for(self)

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.option(arb(_)).map(O.fromNullable)),
    S.parser((i: ParserInput | null, env) =>
      i === null
        ? Th.succeed(O.none)
        : Th.map_(env?.cache ? env.cache.getOrSet(i, parse) : parse(i, env), O.some)
    ),
    S.constructor((x: O.Option<ConstructorInput>) =>
      O.fold_(
        x,
        () => Th.succeed(O.none),
        (v) => Th.map_(create(v), O.some)
      )
    ),
    S.encoder((_) => O.map_(_, encode)["|>"](O.toNullable) as Encoded | null),
    S.mapApi(() => self.Api as Api),
    withDefaults,
    S.annotate(optionFromNullIdentifier, { self })
  )
}
