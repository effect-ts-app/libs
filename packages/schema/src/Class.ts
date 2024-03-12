/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Types } from "@effect-app/core"
import type { ParseOptions } from "@effect/schema/AST"
import type { Schema, Struct } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { Effect } from "effect"
import type { Simplify } from "effect/Types"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"
import type { ParseResult } from "./index.js"
import type { AST } from "./schema.js"

type _OptionalKeys<O> = {
  [K in keyof O]-?: {} extends Pick<O, K> ? K
    : never
}[keyof O]

type FilterOptionalKeys<A> = Omit<A, _OptionalKeys<A>>

export interface EnhancedClass<Self, Fields extends Struct.Fields, A, I, R, C, Inherited, Proto>
  extends Schema<Self, I, R>, PropsExtensions<Fields>
{
  new(
    props: Types.Equals<C, {}> extends true ? void | {}
      : Types.Equals<FilterOptionalKeys<C>, {}> extends true ? void | C
      : C,
    disableValidation?: boolean | undefined
  ): A & Omit<Inherited, keyof A> & Proto

  readonly fields: Simplify<Fields>

  readonly extend: <Extended = never>(identifier?: string | undefined) => <newFields extends Struct.Fields>(
    fields: newFields,
    annotations?: S.Annotations<Extended>
  ) => [Extended] extends [never] ? MissingSelfGeneric<"Base.extend">
    : EnhancedClass<
      Extended,
      Fields & newFields,
      Simplify<A & Struct.Type<newFields>>,
      Simplify<I & Struct.Encoded<newFields>>,
      R | Struct.Context<newFields>,
      Simplify<C & S.ToStructConstructor<newFields>>,
      Self,
      Proto
    >

  readonly transformOrFail: <Transformed = never>(identifier?: string | undefined) => <
    newFields extends Struct.Fields,
    R2,
    R3
  >(
    fields: newFields,
    decode: (
      input: A,
      options: ParseOptions,
      ast: AST.Transformation
    ) => Effect.Effect<Simplify<A & Struct.Type<newFields>>, ParseResult.ParseIssue, R2>,
    encode: (
      input: Simplify<A & Struct.Type<newFields>>,
      options: ParseOptions,
      ast: AST.Transformation
    ) => Effect.Effect<A, ParseResult.ParseIssue, R3>
  ) => [Transformed] extends [never] ? MissingSelfGeneric<"Base.transform">
    : EnhancedClass<
      Transformed,
      Fields & newFields,
      Simplify<A & Struct.Type<newFields>>,
      I,
      R | Struct.Context<newFields> | R2 | R3,
      Simplify<C & S.ToStructConstructor<newFields>>,
      Self,
      Proto
    >

  readonly transformOrFailFrom: <Transformed = never>(identifier?: string | undefined) => <
    newFields extends Struct.Fields,
    R2,
    R3
  >(
    fields: newFields,
    decode: (
      input: I,
      options: ParseOptions,
      ast: AST.Transformation
    ) => Effect.Effect<Simplify<I & Struct.Encoded<newFields>>, ParseResult.ParseIssue, R2>,
    encode: (
      input: Simplify<I & Struct.Encoded<newFields>>,
      options: ParseOptions,
      ast: AST.Transformation
    ) => Effect.Effect<I, ParseResult.ParseIssue, R3>
  ) => [Transformed] extends [never] ? MissingSelfGeneric<"Base.transformFrom">
    : EnhancedClass<
      Transformed,
      Fields & newFields,
      Simplify<A & Struct.Type<newFields>>,
      I,
      R | Struct.Context<newFields> | R2 | R3,
      Simplify<C & S.ToStructConstructor<newFields>>,
      Self,
      Proto
    >
}
type MissingSelfGeneric<Usage extends string, Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>()(${Params}{ ... })\``

export interface PropsExtensions<Fields> {
  include: <NewProps extends S.Struct.Fields>(
    fnc: (fields: Fields) => NewProps
  ) => NewProps
  pick: <P extends keyof Fields>(...keys: readonly P[]) => Pick<Fields, P>
  omit: <P extends keyof Fields>(...keys: readonly P[]) => Omit<Fields, P>
}

export function include<Fields extends S.Struct.Fields>(fields: Fields) {
  return <NewProps extends S.Struct.Fields>(
    fnc: (fields: Fields) => NewProps
  ) => include_(fields, fnc)
}

export function include_<
  Fields extends S.Struct.Fields,
  NewProps extends S.Struct.Fields
>(fields: Fields, fnc: (fields: Fields) => NewProps) {
  return fnc(fields)
}

export const Class: <Self = never>() => <Fields extends S.Struct.Fields>(
  fields: Fields,
  annotations?: S.Annotations<Self>
) => [Self] extends [never] ? MissingSelfGeneric<"Class">
  : EnhancedClass<
    Self,
    Fields,
    Simplify<Struct.Type<Fields>>,
    Simplify<Struct.Encoded<Fields>>,
    Schema.Context<Fields[keyof Fields]>,
    Simplify<S.ToStructConstructor<Fields>>,
    {},
    {}
  > = () => (fields, annotations) => {
    const cls = S.Class as any
    return class extends cls()(fields, annotations) {
      constructor(a, b = true) {
        super(a, b)
      }
      static readonly include = include(fields)
      static readonly pick = (...selection: any[]) => pick(fields, selection)
      static readonly omit = (...selection: any[]) => omit(fields, selection)
    } as any
  }

export const TaggedClass: <Self = never>() => <Tag extends string, Fields extends S.Struct.Fields>(
  tag: Tag,
  fields: Fields,
  annotations?: S.Annotations<Self>
) => [Self] extends [never] ? MissingSelfGeneric<"Class">
  : EnhancedClass<
    Self,
    Fields,
    Simplify<{ readonly _tag: Tag } & Struct.Type<Fields>>,
    Simplify<{ readonly _tag: Tag } & Struct.Encoded<Fields>>,
    Schema.Context<Fields[keyof Fields]>,
    Simplify<S.ToStructConstructor<Fields>>,
    {},
    {}
  > = () => (tag, fields, annotations) => {
    const cls = S.TaggedClass as any
    return class extends cls()(tag, fields, annotations) {
      constructor(a, b = true) {
        super(a, b)
      }
      static readonly include = include(fields)
      static readonly pick = (...selection: any[]) => pick(fields, selection)
      static readonly omit = (...selection: any[]) => omit(fields, selection)
    } as any
  }

export const ExtendedClass: <Self, SelfFrom>() => <Fields extends S.Struct.Fields>(
  fields: Fields,
  annotations?: S.Annotations<Self>
) =>
  & EnhancedClass<
    Self,
    Fields,
    Simplify<Struct.Type<Fields>>,
    SelfFrom,
    Schema.Context<Fields[keyof Fields]>,
    Simplify<S.ToStructConstructor<Fields>>,
    {},
    {}
  >
  & {
    readonly structFrom: Schema<
      Simplify<Struct.Type<Fields>>,
      Simplify<Struct.Encoded<Fields>>,
      Schema.Context<Fields[keyof Fields]>
    >
  } = Class as any

export const ExtendedTaggedClass: <Self, SelfFrom>() => <Tag extends string, Fields extends S.Struct.Fields>(
  tag: Tag,
  fields: Fields,
  annotations?: S.Annotations<Self>
) =>
  & EnhancedClass<
    Self,
    Fields,
    Simplify<{ readonly _tag: Tag } & Struct.Type<Fields>>,
    SelfFrom,
    Schema.Context<Fields[keyof Fields]>,
    Simplify<S.ToStructConstructor<Fields>>,
    {},
    {}
  >
  & {
    readonly structFrom: Schema<
      Simplify<{ readonly _tag: Tag } & Struct.Type<Fields>>,
      Simplify<{ readonly _tag: Tag } & Struct.Encoded<Fields>>,
      Schema.Context<Fields[keyof Fields]>
    >
  } = TaggedClass as any

// /**
//  * Automatically assign the name of the Class to the S.
//  */
// export function useClassNameForSchema(cls: any) {
//   const newCls = class extends cls {
//     static get ast() {
//       return AST.setAnnotation(cls.ast, AST.TitleAnnotationId, this.name)
//     }
//   } as any
//   Object.defineProperty(newCls, "name", { value: cls.name })
//   return newCls
// }

// // TODO: call this via a transform?
// /**
//  * composes @link useClassNameForSchema and @link useClassConstructorForSchema
//  */
// export function useClassFeaturesForSchema(cls: any) {
//   return cls // built-in now useClassNameForSchema(cls) // useClassConstructorForSchema(
// }

// const toAnnotations = (
//   options?: Record<string | symbol, any>
// ): Mutable<AST.Annotations> => {
//   if (!options) {
//     return {}
//   }
//   const out: Mutable<AST.Annotations> = {}

//   // symbols are reserved for custom annotations
//   const custom = Object.getOwnPropertySymbols(options)
//   for (const sym of custom) {
//     out[sym] = options[sym]
//   }

//   // string keys are reserved as /schema namespace
//   if (options.typeId !== undefined) {
//     const typeId = options.typeId
//     if (typeof typeId === "object") {
//       out[AST.TypeAnnotationId] = typeId.id
//       out[typeId.id] = typeId.annotation
//     } else {
//       out[AST.TypeAnnotationId] = typeId
//     }
//   }
//   const move = (from: keyof typeof options, to: symbol) => {
//     if (options[from] !== undefined) {
//       out[to] = options[from]
//     }
//   }
//   move("message", AST.MessageAnnotationId)
//   move("identifier", AST.IdentifierAnnotationId)
//   move("title", AST.TitleAnnotationId)
//   move("description", AST.DescriptionAnnotationId)
//   move("examples", AST.ExamplesAnnotationId)
//   move("default", AST.DefaultAnnotationId)
//   move("documentation", AST.DocumentationAnnotationId)
//   move("jsonSchema", AST.JSONSchemaAnnotationId)
//   move("arbitrary", ArbitraryHookId)
//   move("pretty", PrettyHookId)
//   move("equivalence", EquivalenceHookId)

//   return out
// }

// export function annotate(annotations: S.DocAnnotations) {
//   return <T extends S.Class<any, any, any, any, any, any, any, any>>(cls: T): T => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     // @ts-expect-error m
//     const newCls = class extends cls {
//       constructor(...rest: any[]) {
//         // @ts-expect-error m
//         super(...rest)
//       }
//       static override get ast() {
//         return AST.mergeAnnotations(
//           cls.ast,
//           toAnnotations(annotations)
//         )
//       }
//     } as any
//     Object.defineProperty(newCls, "name", { value: cls.name })
//     return newCls
//   }
// }

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
    S.Schema.Encoded<
      Cls extends { structFrom: S.Schema<any, any, any> } ? Cls["structFrom"]
        : Cls extends { struct: S.Schema<any, any, any> } ? Cls["struct"]
        : never
    >
  >()
}
