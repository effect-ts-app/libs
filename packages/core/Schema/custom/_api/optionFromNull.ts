import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as S from "../_schema/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Constructor from "../Constructor/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import * as Th from "../These/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

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
        : Th.map_((env?.cache ? env.cache.getOrSetParser(parse) : parse)(i), O.some)
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
