/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Data } from "effect"

import type { Simplify } from "effect/Types"
import type { FromStruct, Schema, ToStruct, ToStructConstructor } from "./index.js"
import { AST, S } from "./schema.js"

export const ExtendedClass: <SelfFrom, Self>() => <Fields extends S.StructFields>(
  fields: Fields
) =>
  & { readonly structFrom: Schema<Simplify<FromStruct<Fields>>, Simplify<ToStruct<Fields>>> }
  & S.Class<
    SelfFrom,
    Simplify<ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Data.Case
  > = S.Class as any

export const ExtendedTaggedClass: <SelfFrom, Self>() => <Tag extends string, Fields extends S.StructFields>(
  tag: Tag,
  fields: Fields
) =>
  & { readonly structFrom: Schema<Simplify<FromStruct<Fields>>, Simplify<ToStruct<Fields>>> }
  & S.Class<
    SelfFrom,
    Simplify<ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self,
    Data.Case
  > = S.TaggedClass as any

/**
 * Automatically assign the name of the Class to the S.
 */
export function useClassNameForSchema(cls: any) {
  const newCls =  class extends cls {
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
  return useClassNameForSchema(cls) // useClassConstructorForSchema(
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
