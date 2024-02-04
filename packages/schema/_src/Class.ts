/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArbitraryHookId } from "@effect/schema/Arbitrary"
import { EquivalenceHookId } from "@effect/schema/Equivalence"
import { PrettyHookId } from "@effect/schema/Pretty"
import type { FromStruct, Schema, ToStruct, ToStructConstructor } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { Mutable, Simplify } from "effect/Types"
import { AST } from "./schema.js"

export const ExtendedClass: <SelfFrom, Self>() => <Fields extends S.StructFields>(
  fields: Fields
) =>
  & {
    readonly structFrom: Schema<
      Schema.Context<Fields[keyof Fields]>,
      Simplify<FromStruct<Fields>>,
      Simplify<ToStruct<Fields>>
    >
  }
  & S.Class<
    Schema.Context<Fields[keyof Fields]>,
    SelfFrom,
    Simplify<ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Fields,
    {}
  > = S.Class as any

export const ExtendedTaggedClass: <SelfFrom, Self>() => <Tag extends string, Fields extends S.StructFields>(
  tag: Tag,
  fields: Fields
) =>
  & {
    readonly structFrom: Schema<
      Schema.Context<Fields[keyof Fields]>,
      Simplify<{ readonly _tag: Tag } & FromStruct<Fields>>,
      Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>
    >
  }
  & S.Class<
    Schema.Context<Fields[keyof Fields]>,
    SelfFrom,
    Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Fields,
    {}
  > = S.TaggedClass as any

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
