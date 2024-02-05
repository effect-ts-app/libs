/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArbitraryHookId } from "@effect/schema/Arbitrary"
import type { ParseOptions } from "@effect/schema/AST"
import { EquivalenceHookId } from "@effect/schema/Equivalence"
import { PrettyHookId } from "@effect/schema/Pretty"
import type { FromStruct, Schema, ToStruct, ToStructConstructor } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { Effect } from "effect"
import type { Mutable, Simplify } from "effect/Types"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"
import type { ParseResult } from "./index.js"
import { AST } from "./schema.js"

export interface EnhancedClass<R, I, A, C, Self, Fields, Inherited>
  extends S.Class<R, I, A, C, Self, Fields, Inherited>, PropsExtensions<Fields>
{
  readonly extend: <Extended>() => <FieldsB extends S.StructFields>(
    fields: FieldsB
  ) => [unknown] extends [Extended] ? MissingSelfGeneric<"Base.extend">
    : EnhancedClass<
      R | Schema.Context<FieldsB[keyof FieldsB]>,
      Simplify<Omit<I, keyof FieldsB> & FromStruct<FieldsB>>,
      Simplify<Omit<A, keyof FieldsB> & ToStruct<FieldsB>>,
      Simplify<Omit<C, keyof FieldsB> & ToStructConstructor<FieldsB>>,
      Extended,
      Simplify<Omit<Fields, keyof FieldsB> & FieldsB>,
      Self
    >

  readonly transformOrFail: <Transformed>() => <
    FieldsB extends S.StructFields,
    R2,
    R3
  >(
    fields: FieldsB,
    decode: (
      input: A,
      options: ParseOptions,
      ast: AST.Transform
    ) => Effect.Effect<R2, ParseResult.ParseIssue, Omit<A, keyof FieldsB> & ToStruct<FieldsB>>,
    encode: (
      input: Simplify<Omit<A, keyof FieldsB> & ToStruct<FieldsB>>,
      options: ParseOptions,
      ast: AST.Transform
    ) => Effect.Effect<R3, ParseResult.ParseIssue, A>
  ) => [unknown] extends [Transformed] ? MissingSelfGeneric<"Base.transform">
    : EnhancedClass<
      R | Schema.Context<FieldsB[keyof FieldsB]> | R2 | R3,
      I,
      Simplify<Omit<A, keyof FieldsB> & ToStruct<FieldsB>>,
      Simplify<Omit<C, keyof FieldsB> & ToStructConstructor<FieldsB>>,
      Transformed,
      Simplify<Omit<Fields, keyof FieldsB> & FieldsB>,
      Self
    >

  readonly transformOrFailFrom: <Transformed>() => <
    FieldsB extends S.StructFields,
    R2,
    R3
  >(
    fields: FieldsB,
    decode: (
      input: I,
      options: ParseOptions,
      ast: AST.Transform
    ) => Effect.Effect<R2, ParseResult.ParseIssue, Omit<I, keyof FieldsB> & FromStruct<FieldsB>>,
    encode: (
      input: Simplify<Omit<I, keyof FieldsB> & FromStruct<FieldsB>>,
      options: ParseOptions,
      ast: AST.Transform
    ) => Effect.Effect<R3, ParseResult.ParseIssue, I>
  ) => [unknown] extends [Transformed] ? MissingSelfGeneric<"Base.transformFrom">
    : EnhancedClass<
      R | Schema.Context<FieldsB[keyof FieldsB]> | R2 | R3,
      I,
      Simplify<Omit<A, keyof FieldsB> & ToStruct<FieldsB>>,
      Simplify<Omit<C, keyof FieldsB> & ToStructConstructor<FieldsB>>,
      Transformed,
      Simplify<Omit<Fields, keyof FieldsB> & FieldsB>,
      Self
    >
}

type MissingSelfGeneric<Usage extends string, Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>()(${Params}{ ... })\``

export interface PropsExtensions<Fields> {
  include: <NewProps extends S.StructFields>(
    fnc: (fields: Fields) => NewProps
  ) => NewProps
  pick: <P extends keyof Fields>(...keys: readonly P[]) => Pick<Fields, P>
  omit: <P extends keyof Fields>(...keys: readonly P[]) => Omit<Fields, P>
}

export function include<Fields extends S.StructFields>(fields: Fields) {
  return <NewProps extends S.StructFields>(
    fnc: (fields: Fields) => NewProps
  ) => include_(fields, fnc)
}

export function include_<
  Fields extends S.StructFields,
  NewProps extends S.StructFields
>(fields: Fields, fnc: (fields: Fields) => NewProps) {
  return fnc(fields)
}

export const Class: <Self>() => <Fields extends S.StructFields>(
  fields: Fields
) => EnhancedClass<
  Schema.Context<Fields[keyof Fields]>,
  Simplify<FromStruct<Fields>>,
  Simplify<ToStruct<Fields>>,
  Simplify<ToStructConstructor<Fields>>,
  Self,
  Fields,
  {}
> = () => (fields) => {
  const cls = S.Class as any
  return class extends cls()(fields) {
    static readonly include = include(fields)
    static readonly pick = (...selection: any[]) => pick(fields, selection)
    static readonly omit = (...selection: any[]) => omit(fields, selection)
  } as any
}

export const TaggedClass: <Self>() => <Tag extends string, Fields extends S.StructFields>(
  tag: Tag,
  fields: Fields
) => EnhancedClass<
  Schema.Context<Fields[keyof Fields]>,
  Simplify<{ readonly _tag: Tag } & FromStruct<Fields>>,
  Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>,
  Simplify<ToStructConstructor<Fields>>,
  Self,
  Fields,
  {}
> = () => (tag, fields) => {
  const cls = S.TaggedClass as any
  return class extends cls()(tag, fields) {
    static readonly include = include(fields)
    static readonly pick = (...selection: any[]) => pick(fields, selection)
    static readonly omit = (...selection: any[]) => omit(fields, selection)
  } as any
}

export const ExtendedClass: <SelfFrom, Self>() => <Fields extends S.StructFields>(
  fields: Fields
) =>
  & EnhancedClass<
    Schema.Context<Fields[keyof Fields]>,
    SelfFrom,
    Simplify<ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Fields,
    {}
  >
  & {
    readonly structFrom: Schema<
      Schema.Context<Fields[keyof Fields]>,
      Simplify<FromStruct<Fields>>,
      Simplify<ToStruct<Fields>>
    >
  } = Class as any

export const ExtendedTaggedClass: <SelfFrom, Self>() => <Tag extends string, Fields extends S.StructFields>(
  tag: Tag,
  fields: Fields
) =>
  & EnhancedClass<
    Schema.Context<Fields[keyof Fields]>,
    SelfFrom,
    Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Fields,
    {}
  >
  & {
    readonly structFrom: Schema<
      Schema.Context<Fields[keyof Fields]>,
      Simplify<{ readonly _tag: Tag } & FromStruct<Fields>>,
      Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>
    >
  } = TaggedClass as any

/**
 * Automatically assign the name of the Class to the S.
 */
export function useClassNameForSchema(cls: any) {
  const newCls = class extends cls {
    static get ast() {
      return AST.setAnnotation(cls.ast, AST.TitleAnnotationId, this.name)
    }
  } as any
  Object.defineProperty(newCls, "name", { value: cls.name })
  return newCls
}

// TODO: call this via a transform?
/**
 * composes @link useClassNameForSchema and @link useClassConstructorForSchema
 */
export function useClassFeaturesForSchema(cls: any) {
  return cls // built-in now useClassNameForSchema(cls) // useClassConstructorForSchema(
}

const toAnnotations = (
  options?: Record<string | symbol, any>
): Mutable<AST.Annotations> => {
  if (!options) {
    return {}
  }
  const out: Mutable<AST.Annotations> = {}

  // symbols are reserved for custom annotations
  const custom = Object.getOwnPropertySymbols(options)
  for (const sym of custom) {
    out[sym] = options[sym]
  }

  // string keys are reserved as /schema namespace
  if (options.typeId !== undefined) {
    const typeId = options.typeId
    if (typeof typeId === "object") {
      out[AST.TypeAnnotationId] = typeId.id
      out[typeId.id] = typeId.annotation
    } else {
      out[AST.TypeAnnotationId] = typeId
    }
  }
  const move = (from: keyof typeof options, to: symbol) => {
    if (options[from] !== undefined) {
      out[to] = options[from]
    }
  }
  move("message", AST.MessageAnnotationId)
  move("identifier", AST.IdentifierAnnotationId)
  move("title", AST.TitleAnnotationId)
  move("description", AST.DescriptionAnnotationId)
  move("examples", AST.ExamplesAnnotationId)
  move("default", AST.DefaultAnnotationId)
  move("documentation", AST.DocumentationAnnotationId)
  move("jsonSchema", AST.JSONSchemaAnnotationId)
  move("arbitrary", ArbitraryHookId)
  move("pretty", PrettyHookId)
  move("equivalence", EquivalenceHookId)

  return out
}

export function annotate(annotations: S.DocAnnotations) {
  return (cls: any) => {
    const newCls = class extends cls {
      static get ast() {
        return AST.mergeAnnotations(
          cls.ast,
          toAnnotations(annotations)
        )
      }
    } as any
    Object.defineProperty(newCls, "name", { value: cls.name })
    return newCls
  }
}

export interface FromClass<T> {
  new(a: T): T
}

export function FromClassBase<T>() {
  class From {
    constructor(a: T) {
      Object.assign(this, a)
    }
  }
  return From as FromClass<T>
}
export function FromClass<Cls>() {
  return FromClassBase<
    S.Schema.From<
      Cls extends { structFrom: S.Schema<any, any> } ? Cls["structFrom"]
        : Cls extends { struct: S.Schema<any, any> } ? Cls["struct"]
        : never
    >
  >()
}
