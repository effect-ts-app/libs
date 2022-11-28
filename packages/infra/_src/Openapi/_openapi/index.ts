/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off
import {
  arrayIdentifier,
  boolIdentifier,
  chunkIdentifier,
  dateIdentifier,
  eitherIdentifier,
  EmailFromStringIdentifier,
  EmailIdentifier,
  fromChunkIdentifier,
  fromPropertiesIdentifier,
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
  optionFromNullIdentifier,
  PhoneNumberFromStringIdentifier,
  PhoneNumberIdentifier,
  positiveIntFromNumberIdentifier,
  positiveIntIdentifier,
  propertiesIdentifier,
  SchemaAnnotated,
  SchemaContinuationSymbol,
  setIdentifier,
  stringIdentifier,
  unionIdentifier,
  unknownIdentifier,
  UUIDFromStringIdentifier,
} from "@effect-ts-app/schema"
import * as MO from "@effect-ts-app/schema"

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
} from "../atlas-plutus/index.js"

export type Gen = Effect<never, never, JSONSchema>

export const interpreters: ((schema: MO.SchemaAny) => Maybe<Gen>)[] = [
  Maybe.partial((_miss) => (schema: MO.SchemaAny): Gen => {
    // if (schema instanceof MO.SchemaOpenApi) {
    //   const cfg = schema.jsonSchema()
    //   return processId(schema, cfg)
    // }

    // if (schema instanceof MO.SchemaRecur) {
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
type Meta = MO.Meta & {
  title?: string
  noRef?: boolean
  openapiRef?: string
  minLength?: number
  maxLength?: number
}

function processId(schema: MO.SchemaAny, meta: Meta = {}): any {
  if (!schema) {
    throw new Error("schema undefined")
  }
  if ("lazy" in schema) {
    // TODO: Support recursive structures
    return Effect.succeed(new ObjectSchema({}))
  }
  return Effect.gen(function* ($) {
    if (schema instanceof MO.SchemaRefinement) {
      return yield* $(processId(schema.self, meta))
    }
    //   if (schema instanceof MO.SchemaPipe) {
    //     return processId(schema.that, meta)
    //   }
    //   if (schema instanceof MO.SchemaConstructor) {
    //     return processId(schema.self, meta)
    //   }

    //console.log("$$$", schema.annotation)

    // if (schema instanceof MO.SchemaOpenApi) {
    //   const cfg = schema.jsonSchema()
    //   meta = { ...meta, ...cfg }
    // }
    if (schema instanceof MO.SchemaNamed) {
      meta = { title: schema.name, ...meta }
    }

    if (schema instanceof SchemaAnnotated) {
      // TODO: proper narrow the types
      const schemaMeta = schema.meta as any
      switch (schema.annotation) {
        case MO.reqId: {
          meta = { noRef: true, ...meta }
          break
        }
        case metaIdentifier: {
          meta = { ...schemaMeta, ...meta }
          break
        }
        case intersectIdentifier: {
          const { noRef, openapiRef, ...rest } = meta
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
            noRef
              ? Effect.succeed(obj)
              : referenced({ openapiRef: ref })(Effect.succeed(obj))
          )
        }
        case unionIdentifier: {
          return new OneOfSchema({
            ...meta,
            oneOf: yield* $(
              Effect.collectAll(
                Object.keys(schemaMeta.props).map((x) => processId(schemaMeta.props[x]))
              )
            ) as any,
            discriminator: (schemaMeta.tag as Maybe<any>).map((_: any) => ({
              propertyName: _.key, // TODO
            })).value,
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
          // FUTURE OAS 3.1.0: literals.length === 1 ? { const: literals[0 ]} : { enum: literals } ...
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
        case optionFromNullIdentifier:
          return {
            ...((yield* $(processId(schemaMeta.self, meta))) as any),
            nullable: true,
          }
        case nullableIdentifier:
          return {
            ...((yield* $(processId(schemaMeta.self, meta))) as any),
            nullable: true,
          }
        case arrayIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case setIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
            uniqueItems: true,
          })
        case chunkIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case fromChunkIdentifier:
          return new ArraySchema({
            items: yield* $(processId(schemaMeta.self, meta)) as any,
          })
        case eitherIdentifier: {
          return new OneOfSchema({
            ...meta,
            oneOf: (yield* $(
              Effect.collectAll(
                [schemaMeta.left, schemaMeta.right].map((x) => processId(x))
              ).map((_) => _.toArray)
            )).map((v, i) => ({
              properties: {
                _tag: { enum: [i === 0 ? "Left" : "Right"] },
                [i === 0 ? "left" : "right"]: v,
              },
              required: ["_tag", i === 0 ? "left" : "right"],
              type: "object",
            })) as any,
            discriminator: { propertyName: "_tag" },
          })
        }
        case unknownIdentifier: {
          const { noRef, openapiRef, ...rest } = meta
          const obj = new ObjectSchema({
            ...rest,
            properties: {},
            required: undefined,
          })
          return yield* $(
            noRef
              ? Effect.succeed(obj)
              : referenced({ openapiRef: openapiRef || rest.title })(
                  Effect.succeed(obj)
                )
          )
        }
        case fromPropertiesIdentifier:
        case propertiesIdentifier: {
          const properties: Record<string, any> = {}
          const required: string[] = []
          for (const k in schemaMeta.props) {
            const p: MO.AnyProperty = schemaMeta.props[k]
            properties[k] = yield* $(processId(p["_schema"]))
            if (p["_optional"] === "required") {
              required.push(k)
            }
          }
          const { noRef, openapiRef, ...rest } = meta
          const obj = new ObjectSchema({
            ...rest,
            properties,
            required: required.length ? required : undefined,
          })
          return yield* $(
            noRef
              ? Effect.succeed(obj)
              : referenced({ openapiRef: openapiRef || rest.title })(
                  Effect.succeed(obj)
                )
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

function for_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
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
