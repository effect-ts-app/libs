import * as Dictionary from "@effect-app/core/Dictionary"
import { pipe } from "@effect-app/core/Function"
import { intersect, typedKeysOf } from "@effect-app/core/utils"
import type { Compute, UnionToIntersection } from "@effect-app/core/utils"
import * as HashMap from "effect/HashMap"
import type * as fc from "fast-check"
import * as S from "../_schema.js"
import type { Annotation } from "../_schema/annotation.js"
import { augmentRecord } from "../_utils.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import type { ParserEnv } from "../Parser.js"
import * as Th from "../These.js"
import type { LiteralApi } from "./literal.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

/**
 * @tsplus type ets/Schema/Property
 * @tsplus companion ets/Schema/PropertyOps
 */
export class Field<
  Self extends S.SchemaUPI,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
> {
  constructor(
    readonly _as: As,
    readonly _schema: Self,
    readonly _optional: Optional,
    readonly _def: Def,
    readonly _map: HashMap.HashMap<Annotation<any>, any>
  ) {}

  // Disabled because it sends the compiler down into rabbit holes..
  // schema<That extends S.SchemaUPI>(schema: That): Field<That, Optional, As, None<any> {
  //   return new Field(this._as, schema, this._optional, Option.none, this._map)
  // }

  // opt(): Field<Self, "optional", As, Def> {
  //   return new Field(this._as, this._schema, "optional", this._def, this._map)
  // }

  // req(): Field<Self, "required", As, Def> {
  //   return new Field(this._as, this._schema, "required", this._def, this._map)
  // }

  // from<As1 extends PropertyKey>(as: As1): Field<Self, Optional, Some<As1>, Def> {
  //   return new Field(
  //     Option(as),
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     this._map
  //   )
  // }

  // removeFrom(): Field<Self, Optional, None<any>, Def> {
  //   return new Field(
  //     Option.none,
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     this._map
  //   )
  // }

  // def(
  //   _: Optional extends "required"
  //     ? () => S.To<Self>
  //     : ["default can be set only for required properties", never]
  // ): Field<Self, Optional, As, Some<["both", () => S.To<Self>]>>
  // def<K extends "parser" | "constructor" | "both">(
  //   _: Optional extends "required"
  //     ? () => S.To<Self>
  //     : ["default can be set only for required properties", never],
  //   k: K
  // ): Field<Self, Optional, As, Some<[K, () => S.To<Self>]>>
  // def(
  //   _: Optional extends "required"
  //     ? () => S.To<Self>
  //     : ["default can be set only for required properties", never],
  //   k?: "parser" | "constructor" | "both"
  // ): Field<
  //   Self,
  //   Optional,
  //   As,
  //   Some<["parser" | "constructor" | "both", () => S.To<Self>]>
  // > {
  //   // @ts-expect-error
  //   return new Field(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     // @ts-expect-error
  //     Option([k ?? "both", _]),
  //     this._map
  //   )
  // }

  // removeDef(): Field<Self, Optional, As, None<any> {
  //   return new Field(this._as, this._schema, this._optional, Option.none, this._map)
  // }

  // getAnnotation<A>(annotation: Annotation<A>): Option<A> {
  //   return HashMap.get_(this._map, annotation)
  // }

  // annotate<A>(annotation: Annotation<A>, value: A): Field<Self, Optional, As, Def> {
  //   return new Field(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     HashMap.set_(this._map, annotation, value)
  //   )
  // }
}

/** @tsplus fluent ets/Schema/Property default */
export function propDef<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
>(
  field: Field<Self, Optional, As, Def>,
  _: Optional extends "required" ? () => S.To<Self>
    : ["default can be set only for required properties", never]
): Field<Self, Optional, As, Some<["both", () => S.To<Self>]>>
export function propDef<
  K extends "parser" | "constructor" | "both",
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
>(
  field: Field<Self, Optional, As, Def>,
  _: Optional extends "required" ? () => S.To<Self>
    : ["default can be set only for required properties", never],
  k: K
): Field<Self, Optional, As, Some<[K, () => S.To<Self>]>>
export function propDef<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
>(
  field: Field<Self, Optional, As, Def>,
  _: Optional extends "required" ? () => S.To<Self>
    : ["default can be set only for required properties", never],
  k?: "parser" | "constructor" | "both"
): Field<
  Self,
  Optional,
  As,
  Some<["parser" | "constructor" | "both", () => S.To<Self>]>
> {
  // @ts-expect-error
  return new Field(
    field._as,
    field._schema,
    field._optional,
    // @ts-expect-error
    Option([k ?? "both", _]),
    field._map
  )
}

/** @tsplus getter ets/Schema/Property optional */
export function propOpt<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
>(field: Field<Self, Optional, As, Def>): Field<Self, "optional", As, Def> {
  return new Field(field._as, field._schema, "optional", field._def, field._map)
}

/** @tsplus getter ets/Schema/Property required */
export function propReq<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>
>(field: Field<Self, Optional, As, Def>): Field<Self, "required", As, Def> {
  return new Field(field._as, field._schema, "required", field._def, field._map)
}

/** @tsplus fluent ets/Schema/Property from */
export function propFrom<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>,
  As1 extends PropertyKey
>(
  field: Field<Self, Optional, As, Def>,
  as: As1
): Field<Self, Optional, Some<As1>, Def> {
  return new Field(
    Option(as) as Some<As1>,
    field._schema,
    field._optional,
    field._def,
    field._map
  )
}

export function field<Self extends S.SchemaUPI>(
  schema: Self
): Field<Self, "required", None<any>, None<any>> {
  return new Field(
    Option.none as None<any>,
    schema,
    "required",
    Option.none as None<any>,
    HashMap.empty()
  )
}

export type AnyField = Field<any, any, any, any>

export type FieldRecord = Record<PropertyKey, AnyField>

export type PropertyOrSchemaRecord = Record<PropertyKey, AnyField | S.SchemaAny>

export type ToProps<ProvidedProps extends PropertyOrSchemaRecord> = {
  [P in keyof ProvidedProps]: ProvidedProps[P] extends S.SchemaAny
    ? Field<ProvidedProps[P], "required", None<any>, None<any>>
    : ProvidedProps[P] extends AnyField ? ProvidedProps[P]
    : never
}

export function toProps<ProvidedProps extends PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) {
  return typedKeysOf(propsOrSchemas).reduce(
    (prev, cur) => {
      const v = propsOrSchemas[cur]
      prev[cur] = v instanceof Field ? v as any : field(v)
      return prev
    },
    {} as ToProps<ProvidedProps>
  )
}

export type ToStruct<Fields extends FieldRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? {
            readonly [h in k]?: S.To<Fields[k]["_schema"]>
          }
        : {
          readonly [h in k]: S.To<Fields[k]["_schema"]>
        }
        : never
    }[keyof Fields]
  >,
  "flat"
>

export type StructConstructor<Fields extends FieldRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: k extends TagsFields<Fields> ? never
        : Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? {
              readonly [h in k]?: S.To<Fields[k]["_schema"]>
            }
          : Fields[k]["_def"] extends Some<["constructor" | "both", any]> ? {
              readonly [h in k]?: S.To<Fields[k]["_schema"]>
            }
          : {
            readonly [h in k]: S.To<Fields[k]["_schema"]>
          }
        : never
    }[keyof Fields]
  >,
  "flat"
>

export type FromStruct<Fields extends FieldRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: S.From<Fields[k]["_schema"]>
          }
        : {
          readonly [
            h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
              : k
          ]: S.From<Fields[k]["_schema"]>
        }
        : never
    }[keyof Fields]
  >,
  "flat"
>

export type HasRequiredField<Fields extends FieldRecord> = unknown extends {
  [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "required" ? unknown
    : never
    : never
}[keyof Fields] ? true
  : false

export type ParserErrorSpecificStruct<Fields extends FieldRecord> = S.CompositionE<
  | S.PrevE<S.LeafE<S.UnknownRecordE>>
  | S.NextE<
    HasRequiredField<Fields> extends true ? S.CompositionE<
        | S.PrevE<
          S.MissingKeysE<
            {
              [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? never
                : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? never
                : Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
                : never
            }[keyof Fields]
          >
        >
        | S.NextE<
          S.StructE<
            {
              [k in keyof Fields]: Fields[k] extends AnyField
                ? Fields[k]["_optional"] extends "optional" ? S.OptionalKeyE<
                    Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                      : k,
                    S.ParserErrorOf<Fields[k]["_schema"]>
                  >
                : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? S.OptionalKeyE<
                    Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                      : k,
                    S.ParserErrorOf<Fields[k]["_schema"]>
                  >
                : S.RequiredKeyE<
                  Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                    : k,
                  S.ParserErrorOf<Fields[k]["_schema"]>
                >
                : never
            }[keyof Fields]
          >
        >
      >
      : S.StructE<
        {
          [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? S.OptionalKeyE<
                Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"] : k,
                S.ParserErrorOf<Fields[k]["_schema"]>
              >
            : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? S.OptionalKeyE<
                Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"] : k,
                S.ParserErrorOf<Fields[k]["_schema"]>
              >
            : S.RequiredKeyE<
              Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"] : k,
              S.ParserErrorOf<Fields[k]["_schema"]>
            >
            : never
        }[keyof Fields]
      >
  >
>

export const propertiesIdentifier = S.makeAnnotation<{ fields: FieldRecord }>()

export type SchemaProperties<Fields extends FieldRecord> = DefaultSchema<
  unknown,
  ToStruct<Fields>,
  StructConstructor<Fields>,
  FromStruct<Fields>,
  { fields: Fields }
>

export type TagsFields<Fields extends FieldRecord> = {
  [k in keyof Fields]: Fields[k]["_as"] extends None<any>
    ? Fields[k]["_optional"] extends "required"
      ? S.ApiOf<Fields[k]["_schema"]> extends LiteralApi<infer KS> ? KS extends [string] ? k
        : never
      : never
    : never
    : never
}[keyof Fields]

export function isFieldRecord(u: unknown): u is FieldRecord {
  return (
    typeof u === "object"
    && u !== null
    && Object.keys(u).every((k) => u[k] instanceof Field)
  )
}

export function tagsFields<Fields extends FieldRecord>(
  fields: Fields
): Record<string, string> {
  const keys = Object.keys(fields)
  const tags = {}
  for (const key of keys) {
    const s: S.SchemaUPI = fields[key]._schema
    const def = fields[key]._def as Option<
      ["parser" | "constructor" | "both", () => S.To<any>]
    >
    const as = fields[key]._as as Option<PropertyKey>
    if (
      as.isNone()
      && def.isNone()
      && fields[key]._optional === "required"
      && "literals" in s.Api
      && Array.isArray(s.Api["literals"])
      && s.Api["literals"].length === 1
      && typeof s.Api["literals"][0] === "string"
    ) {
      tags[key] = s.Api["literals"][0]
    }
  }
  return tags
}

export function struct<ProvidedProps extends PropertyOrSchemaRecord>(
  _props: ProvidedProps
): SchemaProperties<ToProps<ProvidedProps>> {
  type Fields = ToProps<ProvidedProps>
  const fields = toProps(_props)
  const parsers = {} as Record<string, Parser.Parser<unknown, unknown, unknown>>
  const encoders = {}
  const guards = {}
  const arbitrariesReq = {} as Record<string, Arbitrary.Gen<unknown>>
  const arbitrariesPar = {} as Record<string, Arbitrary.Gen<unknown>>
  const keys = Object.keys(fields)
  const required = [] as string[]
  const defaults = [] as [string, [string, any]][]

  for (const key of keys) {
    parsers[key] = Parser.for(fields[key]._schema)
    encoders[key] = Encoder.for(fields[key]._schema)
    guards[key] = Guard.for(fields[key]._schema)

    if (fields[key]._optional === "required") {
      const def = fields[key]._def as Option<
        ["parser" | "constructor" | "both", () => S.To<any>]
      >
      if (def.isNone() || (def.isSome() && def.value[0] === "constructor")) {
        const as = fields[key]._as as Option<string>
        required.push(as.getOrElse(() => key))
      }
      if (def.isSome() && (def.value[0] === "constructor" || def.value[0] === "both")) {
        defaults.push([key, def.value])
      }

      arbitrariesReq[key] = Arbitrary.for(fields[key]._schema)
    } else {
      arbitrariesPar[key] = Arbitrary.for(fields[key]._schema)
    }
  }

  const hasRequired = required.length > 0

  function guard(_: unknown): _ is ToStruct<Fields> {
    if (typeof _ !== "object" || _ === null) {
      return false
    }

    for (const key of keys) {
      const s = fields[key]

      if (s._optional === "required" && !(key in _)) {
        return false
      }
      if (key in _) {
        if (
          (s._optional !== "optional" || typeof _[key] !== "undefined")
          && !guards[key](_[key])
        ) {
          return false
        }
      }
    }
    return true
  }

  function parser(
    _: unknown,
    env?: ParserEnv
  ): Th.These<ParserErrorSpecificStruct<Fields>, ToStruct<Fields>> {
    if (typeof _ !== "object" || _ === null) {
      return Th.fail(
        S.compositionE(Chunk(S.prevE(S.leafE(S.unknownRecordE(_)))))
      )
    }
    let missingKeys = Chunk.empty<string>()
    for (const k of required) {
      if (!(k in _)) {
        missingKeys = missingKeys.append(k)
      }
    }
    if (!missingKeys.isEmpty()) {
      // @ts-expect-error
      return Th.fail(
        S.compositionE(
          Chunk(
            S.nextE(S.compositionE(Chunk(S.prevE(S.missingKeysE(missingKeys)))))
          )
        )
      )
    }

    let errors = Chunk.empty<
      S.OptionalKeyE<string, unknown> | S.RequiredKeyE<string, unknown>
    >()

    let isError = false

    const result = {}

    const parsersv2 = env?.cache ? env.cache.getOrSetParsers(parsers) : parsers

    for (const key of keys) {
      const field = fields[key]
      const as = fields[key]._as as Option<string>
      const _as: string = as.getOrElse(() => key)

      const def = field._def as Option<
        ["parser" | "constructor" | "both", () => S.To<any>]
      >
      // TODO: support actual optionallity vs explicit `| undefined`
      if (_as in _) {
        const isUndefined = typeof _[_as] === "undefined"
        if (field._optional === "optional" && isUndefined) {
          continue
        }
        if (
          isUndefined
          && def.isSome()
          // TODO: why def any
          // // @ts-expect-error
          && (def.value[0] === "parser" || def.value[0] === "both")
        ) {
          // // @ts-expect-error
          result[key] = def.value[1]()
          continue
        }
        const res = parsersv2[key](_[_as])

        if (res.effect._tag === "Left") {
          errors = errors.append(
            field._optional === "required"
              ? S.requiredKeyE(_as, res.effect.left)
              : S.optionalKeyE(_as, res.effect.left)
          )
          isError = true
        } else {
          result[key] = res.effect.right[0]

          const warnings = res.effect.right[1]

          if (warnings._tag === "Some") {
            errors = errors.append(
              field._optional === "required"
                ? S.requiredKeyE(_as, warnings.value)
                : S.optionalKeyE(_as, warnings.value)
            )
          }
        }
      } else {
        if (
          def.isSome()
          // // @ts-expect-error
          && (def.value[0] === "parser" || def.value[0] === "both")
        ) {
          // // @ts-expect-error
          result[key] = def.value[1]()
        }
      }
    }

    if (!isError) {
      augmentRecord(result)
    }

    if (errors.isEmpty()) {
      return Th.succeed(result as ToStruct<Fields>)
    }

    const error_ = S.compositionE(Chunk(S.nextE(S.structE(errors))))
    const error = hasRequired ? S.compositionE(Chunk(S.nextE(error_))) : error_

    if (isError) {
      // @ts-expect-error
      return Th.fail(error)
    }

    // @ts-expect-error
    return Th.warn(result, error)
  }

  function encoder(_: ToStruct<Fields>): FromStruct<Fields> {
    const enc = {}

    for (const key of keys) {
      if (key in _) {
        const as = fields[key]._as as Option<string>
        const _as: string = as.getOrElse(() => key)
        enc[_as] = encoders[key](_[key])
      }
    }
    // @ts-expect-error
    return enc
  }

  function arb(_: typeof fc): fc.Arbitrary<ToStruct<Fields>> {
    const req = Dictionary.map_(arbitrariesReq, (g) => g(_))
    const par = Dictionary.map_(arbitrariesPar, (g) => g(_))

    // @ts-expect-error
    return _.record(req).chain((a) => _.record(par, { withDeletedKeys: true }).map((b) => intersect(a, b)))
  }

  const tags = tagsFields(fields)

  return pipe(
    S.identity(guard),
    S.parser(parser),
    S.encoder(encoder),
    S.arbitrary(arb),
    S.constructor((_) => {
      const res = {} as ToStruct<Fields>
      Object.assign(res, _, tags)
      for (const [k, v] of defaults) {
        if (!(k in res) || res[k] === undefined) {
          if (v[0] === "constructor" || v[0] === "both") {
            res[k] = v[1]()
          }
        }
      }
      return Th.succeed(res)
    }),
    S.mapApi(() => ({ fields })),
    withDefaults,
    S.annotate(propertiesIdentifier, { fields })
  )
}

export function pickProps<Fields extends FieldRecord, KS extends (keyof Fields)[]>(
  ...ks: KS
) {
  return (
    self: Fields
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Fields]: k extends KS[number] ? { [h in k]: Fields[h] } : never
      }[keyof Fields]
    >,
    "flat"
  > => {
    const newProps = {}
    for (const k of Object.keys(self)) {
      if (!ks.includes(k)) {
        newProps[k] = self[k]
      }
    }
    // @ts-expect-error
    return newProps
  }
}

export function omitProps<Fields extends FieldRecord, KS extends (keyof Fields)[]>(
  ...ks: KS
) {
  return (
    self: Fields
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Fields]: k extends KS[number] ? never : { [h in k]: Fields[h] }
      }[keyof Fields]
    >,
    "flat"
  > => {
    const newProps = {}
    for (const k of Object.keys(self)) {
      if (ks.includes(k)) {
        newProps[k] = self[k]
      }
    }
    // @ts-expect-error
    return newProps
  }
}

export type ParserInputSpecificStruct<Fields extends FieldRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyField ? Fields[k]["_optional"] extends "optional" ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: S.From<Fields[k]["_schema"]>
          }
        : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: S.From<Fields[k]["_schema"]>
          }
        : {
          readonly [
            h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
              : k
          ]: S.From<Fields[k]["_schema"]>
        }
        : never
    }[keyof Fields]
  >,
  "flat"
>

type Optionality = "parser" | "constructor" | "both"

export function defProp<Self extends S.SchemaUPI>(
  schema: Self,
  makeDefault: () => S.To<Self>,
  optionality: "parser"
): Field<Self, "required", None<any>, Some<["parser", () => S.To<Self>]>>
export function defProp<Self extends S.SchemaUPI>(
  schema: Self,
  makeDefault: () => S.To<Self>,
  optionality: "both"
): Field<Self, "required", None<any>, Some<["both", () => S.To<Self>]>>
export function defProp<Self extends S.SchemaUPI>(
  schema: Self,
  makeDefault: () => S.To<Self>
): Field<
  Self,
  "required",
  None<any>,
  Some<["constructor", () => S.To<Self>]>
>
export function defProp<Self extends S.SchemaUPI>(
  schema: Self,
  makeDefault: () => S.To<Self>,
  optionality: Optionality = "constructor"
) {
  return propDef(field(schema), makeDefault, optionality)
}

export function optProp<Self extends S.SchemaUPI>(
  schema: Self
): Field<Self, "optional", None<any>, None<any>> {
  return propOpt(field(schema))
}
