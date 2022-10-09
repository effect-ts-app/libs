import * as Dictionary from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as HashMap from "@effect-ts/core/Collections/Immutable/HashMap"
import { pipe } from "@effect-ts/core/Function"
import type { Compute, UnionToIntersection } from "@effect-ts/core/Utils"
import { intersect } from "@effect-ts/core/Utils"
import { None, Some } from "@tsplus/stdlib/data/Maybe"
import type * as fc from "fast-check"

import type { Annotation } from "../_schema/annotation.js"
import * as S from "../_schema/index.js"
import { augmentRecord } from "../_utils/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import { ParserEnv } from "../Parser/index.js"
import * as Th from "../These/index.js"
import type { LiteralApi } from "./literal.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

/**
 * @tsplus type ets/Schema/Property
 * @tsplus companion ets/Schema/PropertyOps
 */
export class Property<
  Self extends S.SchemaUPI,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
> {
  constructor(
    readonly _as: As,
    readonly _schema: Self,
    readonly _optional: Optional,
    readonly _def: Def,
    readonly _map: HashMap.HashMap<Annotation<any>, any>
  ) {}

  // Disabled because it sends the compiler down into rabbit holes..
  // schema<That extends S.SchemaUPI>(schema: That): Property<That, Optional, As, None> {
  //   return new Property(this._as, schema, this._optional, Maybe.none, this._map)
  // }

  // opt(): Property<Self, "optional", As, Def> {
  //   return new Property(this._as, this._schema, "optional", this._def, this._map)
  // }

  // req(): Property<Self, "required", As, Def> {
  //   return new Property(this._as, this._schema, "required", this._def, this._map)
  // }

  // from<As1 extends PropertyKey>(as: As1): Property<Self, Optional, Some<As1>, Def> {
  //   return new Property(
  //     Maybe.some(as),
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     this._map
  //   )
  // }

  // removeFrom(): Property<Self, Optional, None, Def> {
  //   return new Property(
  //     Maybe.none,
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     this._map
  //   )
  // }

  // def(
  //   _: Optional extends "required"
  //     ? () => S.ParsedShapeOf<Self>
  //     : ["default can be set only for required properties", never]
  // ): Property<Self, Optional, As, Some<["both", () => S.ParsedShapeOf<Self>]>>
  // def<K extends "parser" | "constructor" | "both">(
  //   _: Optional extends "required"
  //     ? () => S.ParsedShapeOf<Self>
  //     : ["default can be set only for required properties", never],
  //   k: K
  // ): Property<Self, Optional, As, Some<[K, () => S.ParsedShapeOf<Self>]>>
  // def(
  //   _: Optional extends "required"
  //     ? () => S.ParsedShapeOf<Self>
  //     : ["default can be set only for required properties", never],
  //   k?: "parser" | "constructor" | "both"
  // ): Property<
  //   Self,
  //   Optional,
  //   As,
  //   Some<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
  // > {
  //   // @ts-expect-error
  //   return new Property(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     // @ts-expect-error
  //     Maybe.some([k ?? "both", _]),
  //     this._map
  //   )
  // }

  // removeDef(): Property<Self, Optional, As, None> {
  //   return new Property(this._as, this._schema, this._optional, Maybe.none, this._map)
  // }

  // getAnnotation<A>(annotation: Annotation<A>): Maybe<A> {
  //   return HashMap.get_(this._map, annotation)
  // }

  // annotate<A>(annotation: Annotation<A>, value: A): Property<Self, Optional, As, Def> {
  //   return new Property(
  //     this._as,
  //     this._schema,
  //     this._optional,
  //     this._def,
  //     HashMap.set_(this._map, annotation, value)
  //   )
  // }
}

export function propDef<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(
  prop: Property<Self, Optional, As, Def>,
  _: Optional extends "required"
    ? () => S.ParsedShapeOf<Self>
    : ["default can be set only for required properties", never]
): Property<Self, Optional, As, Some<["both", () => S.ParsedShapeOf<Self>]>>
export function propDef<
  K extends "parser" | "constructor" | "both",
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(
  prop: Property<Self, Optional, As, Def>,
  _: Optional extends "required"
    ? () => S.ParsedShapeOf<Self>
    : ["default can be set only for required properties", never],
  k: K
): Property<Self, Optional, As, Some<[K, () => S.ParsedShapeOf<Self>]>>
export function propDef<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(
  prop: Property<Self, Optional, As, Def>,
  _: Optional extends "required"
    ? () => S.ParsedShapeOf<Self>
    : ["default can be set only for required properties", never],
  k?: "parser" | "constructor" | "both"
): Property<
  Self,
  Optional,
  As,
  Some<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
> {
  // @ts-expect-error
  return new Property(
    prop._as,
    prop._schema,
    prop._optional,
    // @ts-expect-error
    Maybe.some([k ?? "both", _]),
    prop._map
  )
}

export function propOpt<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(prop: Property<Self, Optional, As, Def>): Property<Self, "optional", As, Def> {
  return new Property(prop._as, prop._schema, "optional", prop._def, prop._map)
}

export function propReq<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(prop: Property<Self, Optional, As, Def>): Property<Self, "required", As, Def> {
  return new Property(prop._as, prop._schema, "required", prop._def, prop._map)
}

export function propFrom<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends Maybe<PropertyKey>,
  Def extends Maybe<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>,
  As1 extends PropertyKey
>(
  prop: Property<Self, Optional, As, Def>,
  as: As1
): Property<Self, Optional, Some<As1>, Def> {
  return new Property(
    Maybe.some(as) as Some<As1>,
    prop._schema,
    prop._optional,
    prop._def,
    prop._map
  )
}

export function prop<Self extends S.SchemaUPI>(
  schema: Self
): Property<Self, "required", None, None> {
  return new Property(
    Maybe.none as None,
    schema,
    "required",
    Maybe.none as None,
    HashMap.make()
  )
}

export type AnyProperty = Property<any, any, any, any>

export type PropertyRecord = Record<PropertyKey, AnyProperty>

export type ShapeFromProperties<Props extends PropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in k]: S.ParsedShapeOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type ConstructorFromProperties<Props extends PropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: k extends TagsFromProps<Props>
        ? never
        : Props[k] extends AnyProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : Props[k]["_def"] extends Some<["constructor" | "both", any]>
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in k]: S.ParsedShapeOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type EncodedFromProperties<Props extends PropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in Props[k]["_as"] extends Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.EncodedOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in Props[k]["_as"] extends Some<any>
                ? Props[k]["_as"]["value"]
                : k]: S.EncodedOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type HasRequiredProperty<Props extends PropertyRecord> = unknown extends {
  [k in keyof Props]: Props[k] extends AnyProperty
    ? Props[k]["_optional"] extends "required"
      ? unknown
      : never
    : never
}[keyof Props]
  ? true
  : false

export type ParserErrorFromProperties<Props extends PropertyRecord> = S.CompositionE<
  | S.PrevE<S.LeafE<S.UnknownRecordE>>
  | S.NextE<
      HasRequiredProperty<Props> extends true
        ? S.CompositionE<
            | S.PrevE<
                S.MissingKeysE<
                  {
                    [k in keyof Props]: Props[k] extends AnyProperty
                      ? Props[k]["_optional"] extends "optional"
                        ? never
                        : Props[k]["_def"] extends Some<["parser" | "both", any]>
                        ? never
                        : Props[k]["_as"] extends Some<any>
                        ? Props[k]["_as"]["value"]
                        : k
                      : never
                  }[keyof Props]
                >
              >
            | S.NextE<
                S.StructE<
                  {
                    [k in keyof Props]: Props[k] extends AnyProperty
                      ? Props[k]["_optional"] extends "optional"
                        ? S.OptionalKeyE<
                            Props[k]["_as"] extends Some<any>
                              ? Props[k]["_as"]["value"]
                              : k,
                            S.ParserErrorOf<Props[k]["_schema"]>
                          >
                        : Props[k]["_def"] extends Some<["parser" | "both", any]>
                        ? S.OptionalKeyE<
                            Props[k]["_as"] extends Some<any>
                              ? Props[k]["_as"]["value"]
                              : k,
                            S.ParserErrorOf<Props[k]["_schema"]>
                          >
                        : S.RequiredKeyE<
                            Props[k]["_as"] extends Some<any>
                              ? Props[k]["_as"]["value"]
                              : k,
                            S.ParserErrorOf<Props[k]["_schema"]>
                          >
                      : never
                  }[keyof Props]
                >
              >
          >
        : S.StructE<
            {
              [k in keyof Props]: Props[k] extends AnyProperty
                ? Props[k]["_optional"] extends "optional"
                  ? S.OptionalKeyE<
                      Props[k]["_as"] extends Some<any> ? Props[k]["_as"]["value"] : k,
                      S.ParserErrorOf<Props[k]["_schema"]>
                    >
                  : Props[k]["_def"] extends Some<["parser" | "both", any]>
                  ? S.OptionalKeyE<
                      Props[k]["_as"] extends Some<any> ? Props[k]["_as"]["value"] : k,
                      S.ParserErrorOf<Props[k]["_schema"]>
                    >
                  : S.RequiredKeyE<
                      Props[k]["_as"] extends Some<any> ? Props[k]["_as"]["value"] : k,
                      S.ParserErrorOf<Props[k]["_schema"]>
                    >
                : never
            }[keyof Props]
          >
    >
>

export const propertiesIdentifier = S.makeAnnotation<{ props: PropertyRecord }>()

export type SchemaProperties<Props extends PropertyRecord> = DefaultSchema<
  unknown,
  ShapeFromProperties<Props>,
  ConstructorFromProperties<Props>,
  EncodedFromProperties<Props>,
  { props: Props }
>

export type TagsFromProps<Props extends PropertyRecord> = {
  [k in keyof Props]: Props[k]["_as"] extends None
    ? Props[k]["_optional"] extends "required"
      ? S.ApiOf<Props[k]["_schema"]> extends LiteralApi<infer KS>
        ? KS extends [string]
          ? k
          : never
        : never
      : never
    : never
}[keyof Props]

export function isPropertyRecord(u: unknown): u is PropertyRecord {
  return (
    typeof u === "object" &&
    u !== null &&
    Object.keys(u).every((k) => u[k] instanceof Property)
  )
}

export function tagsFromProps<Props extends PropertyRecord>(
  props: Props
): Record<string, string> {
  const keys = Object.keys(props)
  const tags = {}
  for (const key of keys) {
    const s: S.SchemaUPI = props[key]._schema
    const def = props[key]._def as Maybe<
      ["parser" | "constructor" | "both", () => S.ParsedShapeOf<any>]
    >
    const as = props[key]._as as Maybe<PropertyKey>
    if (
      as.isNone() &&
      def.isNone() &&
      props[key]._optional === "required" &&
      "literals" in s.Api &&
      Array.isArray(s.Api["literals"]) &&
      s.Api["literals"].length === 1 &&
      typeof s.Api["literals"][0] === "string"
    ) {
      tags[key] = s.Api["literals"][0]
    }
  }
  return tags
}

export function props<Props extends PropertyRecord>(
  props: Props
): SchemaProperties<Props> {
  const parsers = {} as Record<string, Parser.Parser<unknown, unknown, unknown>>
  const encoders = {}
  const guards = {}
  const arbitrariesReq = {} as Record<string, Arbitrary.Gen<unknown>>
  const arbitrariesPar = {} as Record<string, Arbitrary.Gen<unknown>>
  const keys = Object.keys(props)
  const required = [] as string[]
  const defaults = [] as [string, [string, any]][]

  for (const key of keys) {
    parsers[key] = Parser.for(props[key]._schema)
    encoders[key] = Encoder.for(props[key]._schema)
    guards[key] = Guard.for(props[key]._schema)

    if (props[key]._optional === "required") {
      const def = props[key]._def as Maybe<
        ["parser" | "constructor" | "both", () => S.ParsedShapeOf<any>]
      >
      if (def.isNone() || (def.isSome() && def.value[0] === "constructor")) {
        const as = props[key]._as as Maybe<string>
        required.push(as.getOrElse(() => key))
      }
      if (def.isSome() && (def.value[0] === "constructor" || def.value[0] === "both")) {
        defaults.push([key, def.value])
      }

      arbitrariesReq[key] = Arbitrary.for(props[key]._schema)
    } else {
      arbitrariesPar[key] = Arbitrary.for(props[key]._schema)
    }
  }

  const hasRequired = required.length > 0

  function guard(_: unknown): _ is ShapeFromProperties<Props> {
    if (typeof _ !== "object" || _ === null) {
      return false
    }

    for (const key of keys) {
      const s = props[key]

      if (s._optional === "required" && !(key in _)) {
        return false
      }
      if (key in _) {
        if (
          (s._optional !== "optional" || typeof _[key] !== "undefined") &&
          !guards[key](_[key])
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
  ): Th.These<ParserErrorFromProperties<Props>, ShapeFromProperties<Props>> {
    if (typeof _ !== "object" || _ === null) {
      return Th.fail(
        S.compositionE(Chunk.single(S.prevE(S.leafE(S.unknownRecordE(_)))))
      )
    }
    let missingKeys = Chunk.empty<string>()
    for (const k of required) {
      if (!(k in _)) {
        missingKeys = missingKeys.append(k)
      }
    }
    if (!missingKeys.isEmpty) {
      // @ts-expect-error
      return Th.fail(
        S.compositionE(
          Chunk.single(
            S.nextE(S.compositionE(Chunk.single(S.prevE(S.missingKeysE(missingKeys)))))
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
      const prop = props[key]
      const as = props[key]._as as Maybe<string>
      const _as: string = as.getOrElse(() => key)

      const def = prop._def as Maybe<
        ["parser" | "constructor" | "both", () => S.ParsedShapeOf<any>]
      >
      // TODO: support actual optionallity vs explicit `| undefined`
      if (_as in _) {
        const isUndefined = typeof _[_as] === "undefined"
        if (prop._optional === "optional" && isUndefined) {
          continue
        }
        if (
          isUndefined &&
          def.isSome() &&
          // TODO: why def any
          // // @ts-expect-error
          (def.value[0] === "parser" || def.value[0] === "both")
        ) {
          // // @ts-expect-error
          result[key] = def.value[1]()
          continue
        }
        const res = parsersv2[key](_[_as])

        if (res.effect._tag === "Left") {
          errors = errors.append(
            prop._optional === "required"
              ? S.requiredKeyE(_as, res.effect.left)
              : S.optionalKeyE(_as, res.effect.left)
          )
          isError = true
        } else {
          result[key] = res.effect.right.get(0)

          const warnings = res.effect.right.get(1)

          if (warnings._tag === "Some") {
            errors = errors.append(
              prop._optional === "required"
                ? S.requiredKeyE(_as, warnings.value)
                : S.optionalKeyE(_as, warnings.value)
            )
          }
        }
      } else {
        if (
          def.isSome() &&
          // // @ts-expect-error
          (def.value[0] === "parser" || def.value[0] === "both")
        ) {
          // // @ts-expect-error
          result[key] = def.value[1]()
        }
      }
    }

    if (!isError) {
      augmentRecord(result)
    }

    if (errors.isEmpty) {
      return Th.succeed(result as ShapeFromProperties<Props>)
    }

    const error_ = S.compositionE(Chunk.single(S.nextE(S.structE(errors))))
    const error = hasRequired ? S.compositionE(Chunk.single(S.nextE(error_))) : error_

    if (isError) {
      // @ts-expect-error
      return Th.fail(error)
    }

    // @ts-expect-error
    return Th.warn(result, error)
  }

  function encoder(_: ShapeFromProperties<Props>): EncodedFromProperties<Props> {
    const enc = {}

    for (const key of keys) {
      if (key in _) {
        const as = props[key]._as as Maybe<string>
        const _as: string = as.getOrElse(() => key)
        enc[_as] = encoders[key](_[key])
      }
    }
    // @ts-expect-error
    return enc
  }

  function arb(_: typeof fc): fc.Arbitrary<ShapeFromProperties<Props>> {
    const req = Dictionary.map_(arbitrariesReq, (g) => g(_))
    const par = Dictionary.map_(arbitrariesPar, (g) => g(_))

    // @ts-expect-error
    return _.record(req).chain((a) =>
      _.record(par, { withDeletedKeys: true }).map((b) => intersect(a, b))
    )
  }

  const tags = tagsFromProps(props)

  return pipe(
    S.identity(guard),
    S.parser(parser),
    S.encoder(encoder),
    S.arbitrary(arb),
    S.constructor((_) => {
      const res = {} as ShapeFromProperties<Props>
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
    S.mapApi(() => ({ props })),
    withDefaults,
    S.annotate(propertiesIdentifier, { props })
  )
}

export function propsPick<Props extends PropertyRecord, KS extends (keyof Props)[]>(
  ...ks: KS
) {
  return (
    self: Props
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Props]: k extends KS[number] ? { [h in k]: Props[h] } : never
      }[keyof Props]
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

export function propsOmit<Props extends PropertyRecord, KS extends (keyof Props)[]>(
  ...ks: KS
) {
  return (
    self: Props
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Props]: k extends KS[number] ? never : { [h in k]: Props[h] }
      }[keyof Props]
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

export type ParserInputFromProperties<Props extends PropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in Props[k]["_as"] extends Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.EncodedOf<Props[k]["_schema"]>
            }
          : Props[k]["_def"] extends Some<["parser" | "both", any]>
          ? {
              readonly [h in Props[k]["_as"] extends Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.EncodedOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in Props[k]["_as"] extends Some<any>
                ? Props[k]["_as"]["value"]
                : k]: S.EncodedOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>
