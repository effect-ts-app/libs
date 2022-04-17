import type { UnionToIntersection } from "@effect-ts/core/Utils"

import type { Annotation } from "../_schema/index.js"
import * as MO from "../_schema/index.js"
import type { Schema } from "../_schema/schema.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Constructor from "../Constructor/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import { unsafe } from "./condemn.js"

export interface SchemaDefaultSchema<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
> extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  (_: ConstructorInput): ParsedShape

  readonly Parser: Parser.Parser<ParserInput, any, ParsedShape>

  readonly Constructor: Constructor.Constructor<ConstructorInput, ParsedShape, any>

  readonly Encoder: Encoder.Encoder<ParsedShape, Encoded>

  readonly Guard: Guard.Guard<ParsedShape>

  readonly Arbitrary: Arbitrary.Arbitrary<ParsedShape>

  readonly annotate: <Meta>(
    identifier: Annotation<Meta>,
    meta: Meta
  ) => DefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
}

export type DefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =
  SchemaDefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> &
    CarryFromApi<Api>

const carryOver = ["matchW", "matchS", "props"] as const

type CarryOverFromApi = typeof carryOver[number]

type CarryFromApi<Api> = UnionToIntersection<
  {
    [k in keyof Api]: k extends CarryOverFromApi ? { [h in k]: Api[h] } : never
  }[keyof Api]
>

export function withDefaults<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  const of_ = Constructor.for(self) >= unsafe

  function schemed(_: ConstructorInput) {
    return of_(_)
  }

  Object.defineProperty(schemed, MO.SchemaContinuationSymbol, {
    value: self,
  })

  Object.defineProperty(schemed, "Api", {
    get() {
      return self.Api
    },
  })

  Object.defineProperty(schemed, ">>>", {
    value: self[">>>"],
  })

  Object.defineProperty(schemed, "Parser", {
    value: Parser.for(self),
  })

  Object.defineProperty(schemed, "Constructor", {
    value: Constructor.for(self),
  })

  Object.defineProperty(schemed, "Encoder", {
    value: Encoder.for(self),
  })

  Object.defineProperty(schemed, "Guard", {
    value: Guard.for(self),
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: Arbitrary.for(self),
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(annotation: Annotation<Meta>, meta: Meta) =>
      withDefaults(self.annotate(annotation, meta)),
  })

  for (const k of carryOver) {
    Object.defineProperty(schemed, k, {
      get() {
        return self.Api[k]
      },
    })
  }

  // @ts-expect-error
  return schemed
}
