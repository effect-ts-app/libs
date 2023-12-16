import { type CustomSchemaException, parseEither, parseFromEither, parseFromSync, parseSync } from "../../ext2.js"
import type { Annotation } from "../_schema.js"
import * as S from "../_schema.js"
import { named } from "../_schema.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Constructor from "../Constructor.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import * as Schemed from "./schemed.js"

export type SchemaForModel<M, Self extends S.SchemaAny> = S.Schema<
  S.ParserInputOf<Self>,
  M,
  S.ConstructorInputOf<Self>,
  S.From<Self>,
  S.ApiOf<Self> & S.ApiSelfType<M>
>

export type ParserFor<Self extends S.SchemaAny> = Parser.Parser<
  S.ParserInputOf<Self>,
  S.ParserErrorOf<Self>,
  S.To<Self>
>

export type ConstructorFor<Self extends S.SchemaAny> = Constructor.Constructor<
  S.ConstructorInputOf<Self>,
  S.To<Self>,
  S.ConstructorErrorOf<Self>
>

export type EncoderFor<Self extends S.SchemaAny> = Encoder.Encoder<
  S.To<Self>,
  S.From<Self>
>

export type GuardFor<Self extends S.SchemaAny> = Guard.Guard<S.To<Self>>

export type ArbitraryFor<Self extends S.SchemaAny> = Arbitrary.Gen<
  S.To<Self>
>

export type ModelFor<M, Self extends S.SchemaAny> = M extends S.To<Self> ? SchemaForModel<M, Self>
  : SchemaForModel<S.To<Self>, Self>

export interface Class<M, Self extends S.SchemaAny> extends
  Schemed.Schemed<Self>,
  S.Schema<
    S.ParserInputOf<Self>,
    M,
    S.ConstructorInputOf<Self>,
    S.From<Self>,
    S.ApiOf<Self>
  >
{
  [Schemed.schemaField]: Self

  readonly Parser: ParserFor<SchemaForModel<M, Self>>

  readonly Constructor: ConstructorFor<SchemaForModel<M, Self>>

  readonly encodeSync: EncoderFor<SchemaForModel<M, Self>>
  readonly parseSync: (
    i: S.ParserInputOf<SchemaForModel<M, Self>>,
    env?: Parser.ParserEnv
  ) => S.To<SchemaForModel<M, Self>>
  readonly parseEither: (
    i: S.ParserInputOf<SchemaForModel<M, Self>>,
    env?: Parser.ParserEnv
  ) => Either<CustomSchemaException, S.To<SchemaForModel<M, Self>>>
  readonly parseFromEither: (
    i: S.From<SchemaForModel<M, Self>>,
    env?: Parser.ParserEnv
  ) => Either<CustomSchemaException, S.To<SchemaForModel<M, Self>>>
  readonly parseFromSync: (i: S.From<SchemaForModel<M, Self>>, env?: Parser.ParserEnv) => S.To<SchemaForModel<M, Self>>

  readonly is: GuardFor<SchemaForModel<M, Self>>

  readonly Arbitrary: ArbitraryFor<SchemaForModel<M, Self>>
}

/**
 * @inject genericName
 */
export function Class<M>(__name?: string) {
  return <Self extends S.SchemaAny>(self: Self): Class<M, Self> => {
    const schemed = Schemed.Schemed(named(__name ?? "Class(Anonymous)")(self))
    const schema = Schemed.schema(schemed)

    Object.defineProperty(schemed, S.SchemaContinuationSymbol, {
      value: schema
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
      value: Parser.for(schema)
    })

    Object.defineProperty(schemed, "Constructor", {
      value: Constructor.for(schema)
    })

    Object.defineProperty(schemed, "encodeSync", {
      value: Encoder.for(schema)
    })

    Object.defineProperty(schemed, "parseEither", {
      value: parseEither(self)
    })

    Object.defineProperty(schemed, "parseSync", {
      value: parseSync(self)
    })

    Object.defineProperty(schemed, "parseFromEither", {
      value: parseFromEither(self)
    })

    Object.defineProperty(schemed, "parseFromSync", {
      value: parseFromSync(self)
    })

    Object.defineProperty(schemed, "is", {
      value: Guard.for(schema)
    })

    Object.defineProperty(schemed, "Arbitrary", {
      value: Arbitrary.for(schema)
    })

    Object.defineProperty(schemed, "annotate", {
      value: <Meta>(identifier: Annotation<Meta>, meta: Meta) => new S.SchemaAnnotated(schema, identifier, meta)
    })

    // @ts-expect-error the following is correct
    return schemed
  }
}
