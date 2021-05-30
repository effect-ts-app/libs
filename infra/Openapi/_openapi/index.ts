/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off
import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"
import {
  arrayIdentifier,
  boolIdentifier,
  chunkIdentifier,
  dateIdentifier,
  EmailFromStringIdentifier,
  EmailIdentifier,
  fromChunkIdentifier,
  fromStringIdentifier,
  hasContinuation,
  intersectIdentifier,
  intIdentifier,
  literalIdentifier,
  maxLengthIdentifier,
  metaIdentifier,
  minLengthIdentifier,
  nonEmptyStringFromStringIdentifier,
  nonEmptyStringIdentifier,
  nullableIdentifier,
  numberIdentifier,
  PhoneNumberFromStringIdentifier,
  PhoneNumberIdentifier,
  positiveIntFromNumberIdentifier,
  positiveIntIdentifier,
  propertiesIdentifier,
  SchemaAnnotated,
  SchemaContinuationSymbol,
  stringIdentifier,
  unionIdentifier,
  UUIDFromStringIdentifier,
} from "@effect-ts-app/core/ext/Schema"

import * as S from "../_schema"
import {
  AllOfSchema,
  ArraySchema,
  BooleanSchema,
  EnumSchema,
  JSONSchema,
  NumberSchema,
  ObjectSchema,
  OneOfSchema,
  referenced,
  StringSchema,
} from "../atlas-plutus"

export type Gen = T.UIO<JSONSchema>

export const interpreters: ((schema: S.SchemaAny) => O.Option<Gen>)[] = [
  O.partial((_miss) => (schema: S.SchemaAny): Gen => {
    // if (schema instanceof S.SchemaOpenApi) {
    //   const cfg = schema.jsonSchema()
    //   return processId(schema, cfg)
    // }

    // if (schema instanceof S.SchemaRecur) {
    //   if (interpreterCache.has(schema)) {
    //     return interpreterCache.get(schema)
    //   }
    //   const parser = () => {
    //     if (interpretedCache.has(schema)) {
    //       return interpretedCache.get(schema)
    //     }
    //     const e = for_(schema.self(schema))()
    //     interpretedCache.set(schema, e)
    //     return e
    //   }
    //   interpreterCache.set(schema, parser)
    //   return parser
    // }

    return processId(schema)

    //return miss()
  }),
]

// TODO: Cache
type Meta = S.Meta & {
  title?: string
  noRef?: boolean
  openapiRef?: string
  minLength?: number
  maxLength?: number
}

function processId(schema: S.SchemaAny, meta: Meta = {}): any {
  if (!schema) {
    throw new Error("schema undefined")
  }
  return T.gen(function* ($) {
    if (schema instanceof S.SchemaRefinement) {
      return yield* $(processId(schema.self, meta))
    }
    //   if (schema instanceof S.SchemaPipe) {
    //     return processId(schema.that, meta)
    //   }
    //   if (schema instanceof S.SchemaConstructor) {
    //     return processId(schema.self, meta)
    //   }

    //console.log("$$$", schema.annotation)

    // if (schema instanceof S.SchemaOpenApi) {
    //   const cfg = schema.jsonSchema()
    //   meta = { ...meta, ...cfg }
    // }
    if (schema instanceof S.SchemaNamed) {
      meta = { title: schema.name, ...meta }
    }

    if (schema instanceof SchemaAnnotated) {
      // TODO: proper narrow the types
      const schemaMeta = schema.meta as any
      switch (schema.annotation) {
        case S.reqId: {
          meta = { noRef: true, ...meta }
          break
        }
        case metaIdentifier: {
          meta = { ...schemaMeta, ...meta }
          break
        }
        case intersectIdentifier: {
          const { openapiRef, ...rest } = meta
          const ref = openapiRef || rest.title
          const s = new AllOfSchema({
            ...rest,
            allOf: [
              yield* $(processId(schemaMeta.self)) as any,
              yield* $(processId(schemaMeta.that)) as any,
            ],
          })
          // If this is a named intersection, we assume that merging the intersected types
          // is desired. Lets make it configurable if someone needs it :)
          const obj = ref ? merge(s) : s

          return yield* $(
            meta.noRef
              ? T.succeed(obj)
              : referenced({ openapiRef: ref })(T.succeed(obj))
          )
        }
        case unionIdentifier: {
          return new OneOfSchema({
            ...meta,
            oneOf: yield* $(
              T.collectAll(
                Object.keys(schemaMeta.props).map((x) => processId(schemaMeta.props[x]))
              )
            ) as any,
            discriminator: schemaMeta.tag["|>"](
              O.map((_: any) => ({
                propertyName: _.key, // TODO
              }))
            )["|>"](O.toUndefined),
          })
        }
        case fromStringIdentifier:
        case stringIdentifier:
          return new StringSchema(meta)
        case minLengthIdentifier:
          meta = { minLength: schemaMeta.minLength, ...meta }
          break
        case maxLengthIdentifier:
          meta = { maxLength: schemaMeta.maxLength, ...meta }
          break
        case nonEmptyStringFromStringIdentifier:
        case nonEmptyStringIdentifier:
          return new StringSchema({ minLength: 1, ...meta })

        case EmailFromStringIdentifier:
        case EmailIdentifier:
          return new StringSchema({ format: "email", ...meta })
        case PhoneNumberFromStringIdentifier:
        case PhoneNumberIdentifier:
          return new StringSchema({ format: "phone" as any, ...meta })

        case literalIdentifier:
          return new EnumSchema({ enum: schemaMeta.literals, ...meta })

        case UUIDFromStringIdentifier:
          return new StringSchema({ format: "uuid", ...meta })
        case dateIdentifier:
          return new StringSchema({ format: "date-time", ...meta })
        case numberIdentifier:
          return new NumberSchema(meta)
        case intIdentifier:
          return new NumberSchema(meta)
        case positiveIntIdentifier:
          return new NumberSchema({ minimum: 0, ...meta })
        case positiveIntFromNumberIdentifier:
          return new NumberSchema({ minimum: 0, ...meta })
        case boolIdentifier:
          return new BooleanSchema(meta)
        case nullableIdentifier:
          return {
            ...((yield* $(processId(schemaMeta.self, meta))) as any),
            nullable: true,
          }
        case arrayIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case chunkIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case fromChunkIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case propertiesIdentifier: {
          const properties: Record<string, any> = {}
          const required = []
          for (const k in schemaMeta.props) {
            const p: S.AnyProperty = schemaMeta.props[k]
            properties[k] = yield* $(processId(p["_schema"]))
            if (p["_optional"] === "required") {
              required.push(k)
            }
          }
          const { openapiRef, ...rest } = meta
          const obj = new ObjectSchema({
            ...rest,
            properties,
            required: required.length ? required : undefined,
          })
          return yield* $(
            meta.noRef
              ? T.succeed(obj)
              : referenced({ openapiRef: openapiRef || rest.title })(T.succeed(obj))
          )
        }
      }
    }

    if (hasContinuation(schema)) {
      return yield* $(processId(schema[SchemaContinuationSymbol], meta))
    }
  })
}

function merge(schema: any) {
  let b = schema as ObjectSchema // TODO: allOfSchema.
  function recurseAllOf(allOf: AllOfSchema["allOf"], nb: any) {
    allOf.forEach((x: any) => {
      const a = x as AllOfSchema
      if (a.allOf) {
        recurseAllOf(a.allOf, nb)
      } else {
        nb.required = (nb.required ?? []).concat(x.required ?? [])
        if (nb.required.length === 0) {
          nb.required = undefined
        }
        nb.properties = { ...nb.properties, ...x.properties }
      }
    })
  }
  const a = b as any as AllOfSchema
  if (a.allOf) {
    const [{ description: ____, nullable: ___, title: __, type: _____, ...first }] =
      a.allOf as any
    const nb = {
      title: a.title,
      type: "object",
      description: a.description,
      summary: a.summary,
      nullable: a.nullable,
      ...first,
    }
    recurseAllOf(a.allOf.slice(1), nb)
    b = nb as any
  }
  return b
}

const cache = new WeakMap()

function for_<
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  schema: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): Gen {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      cache.set(schema, _.value)
      return _.value
    }
  }
  if (hasContinuation(schema)) {
    const arb = for_(schema[SchemaContinuationSymbol])
    cache.set(schema, arb)
    return arb as Gen
  }
  throw new Error(`Missing openapi integration for: ${schema.constructor}`)
}

export { for_ as for }
