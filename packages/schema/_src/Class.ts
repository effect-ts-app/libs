/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Data } from "effect"

import type { Simplify } from "effect/Types"
import type { FromStruct, Schema, StructFields, ToStruct, ToStructConstructor } from "./index.js"
import { AST, S } from "./schema.js"

type MissingSelfGeneric<Usage extends string, Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>()(${Params}{ ... })\``

export const Class = <Self>() =>
<Fields extends StructFields>(
  fields: Fields
): [unknown] extends [Self] ? MissingSelfGeneric<"Class">
  : S.Class<
    Simplify<S.FromStruct<Fields>>,
    Simplify<S.ToStruct<Fields>>,
    Simplify<S.ToStructConstructor<Fields>>,
    Self
  > =>
{
  const cls = S.Class<Self>()(fields) as any
  return class extends cls {
    static get ast() {
      return AST.setAnnotation(cls.ast, AST.TitleAnnotationId, this.name)
    }
  } as any
}

export const TaggedClass = <Self>() =>
<Tag extends string, Fields extends StructFields>(
  tag: Tag,
  fields: Fields
): [unknown] extends [Self] ? MissingSelfGeneric<"TaggedClass", `"Tag", `>
  : S.Class<
    Simplify<{ readonly _tag: Tag } & FromStruct<Fields>>,
    Simplify<{ readonly _tag: Tag } & ToStruct<Fields>>,
    Simplify<ToStructConstructor<Fields>>,
    Self
  > =>
{
  const cls = S.TaggedClass<Self>()(tag, fields) as any
  return class extends cls {
    static get ast() {
      return AST.setAnnotation(cls.ast, AST.TitleAnnotationId, this.name)
    }
  } as any
}

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
  > = Class as any

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
  Object.defineProperty(cls.ast.annotations, AST.TitleAnnotationId, { value: cls.name, enumerable: true })
  console.log(
    "Annotations2",
    cls.ast.annotations,
    cls.ast.annotations[AST.TitleAnnotationId],
    AST.getTitleAnnotation(cls.ast),
    Object.prototype.hasOwnProperty.call(cls.ast.annotations, AST.TitleAnnotationId)
  )
  return cls
}

// TODO: call this via a transform?
/**
 * composes @link useClassNameForSchema and @link useClassConstructorForSchema
 */
export function useClassFeaturesForSchema(cls: any) {
  return cls // useClassNameForSchema(cls) // useClassConstructorForSchema(
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
