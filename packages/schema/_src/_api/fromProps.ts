/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Dictionary from "@effect-app/core/Dictionary"
import { pipe } from "@effect-app/core/Function"
import type { Compute, UnionToIntersection } from "@effect-app/core/utils"
import { intersect } from "@effect-app/core/utils"
import * as HashMap from "effect/HashMap"
import type * as fc from "fast-check"

import * as S from "../custom.js"
import type { Annotation } from "../custom/_schema/annotation.js"
import { augmentRecord } from "../custom/_utils.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import type { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"

export class FromProperty<
  Self extends S.SchemaAny,
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
  // schema<That extends S.SchemaAny>(
  //   schema: That
  // ): FromProperty<That, Optional, As, None<any> {
  //   return new FromProperty(this._as, schema, this._optional, Option.none, this._map)
  // }

  // opt(): FromProperty<Self, "optional", As, Def> {
  //   return new FromProperty(this._as, this._schema, "optional", this._def, this._map)
  // }

  // req(): FromProperty<Self, "required", As, Def> {
  //   return new FromProperty(this._as, this._schema, "required", this._def, this._map)
  // }

  // from<As1 extends PropertyKey>(
  //   as: As1
  // ): FromProperty<Self, Optional, Some<As1>, Def> {
  //   return new FromProperty(
  //     Option(as),
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     this._map
  //   )
  // }

  // removeFrom(): FromProperty<Self, Optional, None<any>, Def> {
  //   return new FromProperty(
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
  // ): FromProperty<Self, Optional, As, Some<["both", () => S.To<Self>]>>
  // def<K extends "parser" | "constructor" | "both">(
  //   _: Optional extends "required"
  //     ? () => S.To<Self>
  //     : ["default can be set only for required properties", never],
  //   k: K
  // ): FromProperty<Self, Optional, As, Some<[K, () => S.To<Self>]>>
  // def(
  //   _: Optional extends "required"
  //     ? () => S.To<Self>
  //     : ["default can be set only for required properties", never],
  //   k?: "parser" | "constructor" | "both"
  // ): FromProperty<
  //   Self,
  //   Optional,
  //   As,
  //   Some<["parser" | "constructor" | "both", () => S.To<Self>]>
  // > {
  //   // @ts-expect-error
  //   return new FromProperty(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     // @ts-expect-error
  //     Option([k ?? "both", _]),
  //     this._map
  //   )
  // }

  // removeDef(): FromProperty<Self, Optional, As, None<any> {
  //   return new FromProperty(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     Option.none,
  //     this._map
  //   )
  // }

  // getAnnotation<A>(annotation: Annotation<A>): Option<A> {
  //   return HashMap.get_(this._map, annotation)
  // }

  // annotate<A>(
  //   annotation: Annotation<A>,
  //   value: A
  // ): FromProperty<Self, Optional, As, Def> {
  //   return new FromProperty(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     HashMap.set_(this._map, annotation, value)
  //   )
  // }
}

export function fromPropFrom<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => S.To<Self>]>,
  As1 extends PropertyKey
>(
  field: FromProperty<Self, Optional, As, Def>,
  as: As1
): FromProperty<Self, Optional, Some<As1>, Def> {
  return new FromProperty(
    Option(as) as Some<As1>,
    field._schema,
    field._optional,
    field._def,
    field._map
  )
}

export function fromProp<Self extends S.SchemaAny>(
  schema: Self
): FromProperty<Self, "required", None<any>, None<any>> {
  return new FromProperty(
    Option.none as None<any>,
    schema,
    "required",
    Option.none as None<any>,
    HashMap.empty()
  )
}

export type AnyFromProperty = FromProperty<any, any, any, any>

export type FromPropertyRecord = Record<PropertyKey, AnyFromProperty>

export type ShapeFromFromProperties<Fields extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
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

export type ConstructorFromFromProperties<Fields extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: k extends TagsFromFromFields<Fields> ? never
        : Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
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

export type EncodedFromFromProperties<Fields extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
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

export type HasRequiredFromProperty<Fields extends FromPropertyRecord> = unknown extends {
  [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "required" ? unknown
    : never
    : never
}[keyof Fields] ? true
  : false

// export type ParserErrorFromFromProperties<Fields extends FromPropertyRecord> =
//   S.CompositionE<
//     | S.PrevE<S.LeafE<S.UnknownRecordE>>
//     | S.NextE<
//         HasRequiredFromProperty<Fields> extends true
//           ? S.CompositionE<
//               | S.PrevE<
//                   S.MissingKeysE<
//                     {
//                       [k in keyof Fields]: Fields[k] extends AnyFromProperty
//                         ? Fields[k]["_optional"] extends "optional"
//                           ? never
//                           : Fields[k]["_def"] extends Some<["parser" | "both", any]>
//                           ? never
//                           : Fields[k]["_as"] extends Some<any>
//                           ? Fields[k]["_as"]["value"]
//                           : k
//                         : never
//                     }[keyof Fields]
//                   >
//                 >
//               | S.NextE<
//                   S.StructE<
//                     {
//                       [k in keyof Fields]: Fields[k] extends AnyFromProperty
//                         ? Fields[k]["_optional"] extends "optional"
//                           ? S.OptionalKeyE<
//                               Fields[k]["_as"] extends Some<any>
//                                 ? Fields[k]["_as"]["value"]
//                                 : k,
//                               S.ParserErrorOf<Fields[k]["_schema"]>
//                             >
//                           : Fields[k]["_def"] extends Some<["parser" | "both", any]>
//                           ? S.OptionalKeyE<
//                               Fields[k]["_as"] extends Some<any>
//                                 ? Fields[k]["_as"]["value"]
//                                 : k,
//                               S.ParserErrorOf<Fields[k]["_schema"]>
//                             >
//                           : S.RequiredKeyE<
//                               Fields[k]["_as"] extends Some<any>
//                                 ? Fields[k]["_as"]["value"]
//                                 : k,
//                               S.ParserErrorOf<Fields[k]["_schema"]>
//                             >
//                         : never
//                     }[keyof Fields]
//                   >
//                 >
//             >
//           : S.StructE<
//               {
//                 [k in keyof Fields]: Fields[k] extends AnyFromProperty
//                   ? Fields[k]["_optional"] extends "optional"
//                     ? S.OptionalKeyE<
//                         Fields[k]["_as"] extends Some<any>
//                           ? Fields[k]["_as"]["value"]
//                           : k,
//                         S.ParserErrorOf<Fields[k]["_schema"]>
//                       >
//                     : Fields[k]["_def"] extends Some<["parser" | "both", any]>
//                     ? S.OptionalKeyE<
//                         Fields[k]["_as"] extends Some<any>
//                           ? Fields[k]["_as"]["value"]
//                           : k,
//                         S.ParserErrorOf<Fields[k]["_schema"]>
//                       >
//                     : S.RequiredKeyE<
//                         Fields[k]["_as"] extends Some<any>
//                           ? Fields[k]["_as"]["value"]
//                           : k,
//                         S.ParserErrorOf<Fields[k]["_schema"]>
//                       >
//                   : never
//               }[keyof Fields]
//             >
//       >
//   >

export const fromPropertiesIdentifier = S.makeAnnotation<{
  fields: FromPropertyRecord
}>()

export type SchemaFromProperties<Fields extends FromPropertyRecord> = S.DefaultSchema<
  ParserInputFromFromProperties<Fields>,
  ShapeFromFromProperties<Fields>,
  ConstructorFromFromProperties<Fields>,
  EncodedFromFromProperties<Fields>,
  { fields: Fields }
>

export type TagsFromFromFields<Fields extends FromPropertyRecord> = {
  [k in keyof Fields]: Fields[k]["_as"] extends None<any>
    ? Fields[k]["_optional"] extends "required"
      ? S.ApiOf<Fields[k]["_schema"]> extends S.LiteralApi<infer KS> ? KS extends [string] ? k
        : never
      : never
    : never
    : never
}[keyof Fields]

export function isFromPropertyRecord(u: unknown): u is FromPropertyRecord {
  return (
    typeof u === "object"
    && u !== null
    && Object.keys(u).every((k) => u[k] instanceof FromProperty)
  )
}

export function tagsFromFromFields<Fields extends FromPropertyRecord>(
  fields: Fields
): Record<string, string> {
  const keys = Object.keys(fields)
  const tags = {}
  for (const key of keys) {
    const s: S.SchemaAny = fields[key]._schema
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

export function fromProps<Fields extends FromPropertyRecord>(
  fields: Fields
): SchemaFromProperties<Fields> {
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
      const as = fields[key]._as as Option<string>

      if (def.isNone() || (def.isSome() && def.value[0] === "constructor")) {
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

  function guard(_: unknown): _ is ShapeFromFromProperties<Fields> {
    if (typeof _ !== "object" || _ === null) {
      return false
    }

    for (const key of keys) {
      const s = fields[key]

      if (s._optional === "required" && !(key in _)) {
        return false
      }
      if (key in _) {
        if (!guards[key](_[key])) {
          return false
        }
      }
    }
    return true
  }

  function parser(
    _: unknown,
    env?: ParserEnv
  ): Th.These<any, ShapeFromFromProperties<Fields>> {
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
      return Th.succeed(result as ShapeFromFromProperties<Fields>)
    }

    const error_ = S.compositionE(Chunk(S.nextE(S.structE(errors))))
    const error = hasRequired ? S.compositionE(Chunk(S.nextE(error_))) : error_

    if (isError) {
      return Th.fail(error)
    }

    // @ts-expect-error
    return Th.warn(result, error)
  }

  function encoder(
    _: ShapeFromFromProperties<Fields>
  ): EncodedFromFromProperties<Fields> {
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

  function arb(_: typeof fc): fc.Arbitrary<ShapeFromFromProperties<Fields>> {
    const req = Dictionary.map_(arbitrariesReq, (g) => g(_))
    const par = Dictionary.map_(arbitrariesPar, (g) => g(_))

    // @ts-expect-error
    return _.record(req).chain((a) => _.record(par, { withDeletedKeys: true }).map((b) => intersect(a, b)))
  }

  const tags = tagsFromFromFields(fields)

  return pipe(
    S.identity(guard),
    S.parser(parser),
    S.encoder(encoder),
    S.arbitrary(arb),
    S.constructor((_) => {
      const res = {} as ShapeFromFromProperties<Fields>
      Object.assign(res, _, tags)
      for (const [k, v] of defaults) {
        if (!(k in res)) {
          if (v[0] === "constructor" || v[0] === "both") {
            res[k] = v[1]()
          }
        }
      }
      return Th.succeed(res)
    }),
    S.mapApi(() => ({ fields })),
    S.withDefaults,
    S.annotate(fromPropertiesIdentifier, { fields })
  )
}

export function fromPropsPick<
  Fields extends FromPropertyRecord,
  KS extends (keyof Fields)[]
>(...ks: KS) {
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

export function fromPropsOmit<
  Fields extends FromPropertyRecord,
  KS extends (keyof Fields)[]
>(...ks: KS) {
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

export type ParserInputFromFromProperties<Fields extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: S.To<Fields[k]["_schema"]>
          }
        : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: S.To<Fields[k]["_schema"]>
          }
        : {
          readonly [
            h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
              : k
          ]: S.To<Fields[k]["_schema"]>
        }
        : never
    }[keyof Fields]
  >,
  "flat"
>

type IsAnyOrUnknown<T> = any extends T ? never : T
type AorB<A, B> = IsAnyOrUnknown<A> extends never ? B : A

export type ParserInputFromParserInputOrStructFrom<
  Fields extends FromPropertyRecord
> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: AorB<
              S.ParserInputOf<Fields[k]["_schema"]>,
              S.From<Fields[k]["_schema"]>
            >
          }
        : Fields[k]["_def"] extends Some<["parser" | "both", any]> ? {
            readonly [
              h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
                : k
            ]?: AorB<
              S.ParserInputOf<Fields[k]["_schema"]>,
              S.From<Fields[k]["_schema"]>
            >
          }
        : {
          readonly [
            h in Fields[k]["_as"] extends Some<any> ? Fields[k]["_as"]["value"]
              : k
          ]: AorB<
            S.ParserInputOf<Fields[k]["_schema"]>,
            S.From<Fields[k]["_schema"]>
          >
        }
        : never
    }[keyof Fields]
  >,
  "flat"
>

export type ParserInputFromParserInputOrEncodedFromSchema<T> = T extends {
  Api: { fields: infer Fields }
} ? Fields extends FromPropertyRecord ? ParserInputFromParserInputOrStructFrom<Fields>
  : never
  : never

export type ParserInputFromStructFrom<Fields extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Fields]: Fields[k] extends AnyFromProperty ? Fields[k]["_optional"] extends "optional" ? {
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

export type ParserInputFromEncodedFromSchema<T> = T extends {
  Api: { fields: infer Fields }
} ? Fields extends FromPropertyRecord ? ParserInputFromStructFrom<Fields>
  : never
  : never
