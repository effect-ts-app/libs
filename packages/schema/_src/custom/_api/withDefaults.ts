import type { UnionToIntersection } from "@effect-app/core/utils"
import type { CustomSchemaException } from "../../ext2.js"
import { parseEither, parseSync } from "../../ext2.js"
import type { Annotation } from "../_schema.js"
import * as S from "../_schema.js"
import type { Schema } from "../_schema/schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Constructor from "../Constructor.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import { unsafe } from "./condemn.js"

/**
 * @tsplus type ets/Schema/Schema
 */
export interface SchemaDefaultSchema<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<ParserInput, To, ConstructorInput, From, Api> {
  (_: ConstructorInput): To

  readonly Parser: Parser.Parser<ParserInput, any, To>

  readonly Constructor: Constructor.Constructor<ConstructorInput, To, any>

  readonly encodeSync: Encoder.Encoder<To, From>
  readonly parseSync: (i: ParserInput, env?: Parser.ParserEnv) => To
  readonly parseEither: (i: ParserInput, env?: Parser.ParserEnv) => Either<CustomSchemaException, To>
  // readonly parseFromEither: (i: From, env?: Parser.ParserEnv) => Either<, To>
  // readonly parseFromSync: (i: From, env?: Parser.ParserEnv) => To

  readonly is: Guard.Guard<To>

  readonly Arbitrary: Arbitrary.Gen<To>

  readonly annotate: <Meta>(
    identifier: Annotation<Meta>,
    meta: Meta
  ) => DefaultSchema<ParserInput, To, ConstructorInput, From, Api>
}

export type DefaultSchema<ParserInput, To, ConstructorInput, From, Api> =
  & SchemaDefaultSchema<ParserInput, To, ConstructorInput, From, Api>
  & CarryFromApi<Api>

const carryOver = ["matchW", "matchS", "fields"] as const

type CarryOverFromApi = typeof carryOver[number]

type CarryFromApi<Api> = UnionToIntersection<
  {
    [k in keyof Api]: k extends CarryOverFromApi ? { [h in k]: Api[h] } : never
  }[keyof Api]
>

export function withDefaults<ParserInput, To, ConstructorInput, From, Api>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>
): DefaultSchema<ParserInput, To, ConstructorInput, From, Api> {
  const of_ = Constructor.for(self) >= unsafe

  function schemed(_: ConstructorInput) {
    return of_(_)
  }

  Object.defineProperty(schemed, S.SchemaContinuationSymbol, {
    value: self
  })

  Object.defineProperty(schemed, "Api", {
    get() {
      return self.Api
    }
  })

  Object.defineProperty(schemed, ">>>", {
    value: self[">>>"]
  })

  Object.defineProperty(schemed, "Parser", {
    value: Parser.for(self)
  })

  Object.defineProperty(schemed, "Constructor", {
    value: Constructor.for(self)
  })

  Object.defineProperty(schemed, "encodeSync", {
    value: Encoder.for(self)
  })

  Object.defineProperty(schemed, "parseEither", {
    value: parseEither(self)
  })

  Object.defineProperty(schemed, "parseSync", {
    value: parseSync(self)
  })

  Object.defineProperty(schemed, "is", {
    value: Guard.for(self)
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: Arbitrary.for(self)
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(annotation: Annotation<Meta>, meta: Meta) => withDefaults(self.annotate(annotation, meta))
  })
  // workaround: vite issue, so don't use `carryOver` here, but have it statically defined.
  for (const k of ["matchW", "matchS", "fields"]) {
    Object.defineProperty(schemed, k, {
      get() {
        return self.Api[k]
      }
    })
  }

  // @ts-expect-error
  return schemed
}
