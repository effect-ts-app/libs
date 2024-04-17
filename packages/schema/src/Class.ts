/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Effect, pipe, Struct as Struct2, type Types } from "@effect-app/core"
import type { ParseOptions } from "@effect/schema/AST"
import type { Schema, Struct } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { Simplify } from "effect/Types"
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
    annotations?: S.Annotations.Schema<Extended>
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
    options: {
      readonly decode: (
        input: A,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Types.Simplify<A & Struct.Type<newFields>>, ParseResult.ParseIssue, R2>
      readonly encode: (
        input: Types.Simplify<A & Struct.Type<newFields>>,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<A, ParseResult.ParseIssue, R3>
    },
    annotations?: S.Annotations.Schema<Transformed>
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
    options: {
      readonly decode: (
        input: I,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Types.Simplify<I & Struct.Encoded<newFields>>, ParseResult.ParseIssue, R2>
      readonly encode: (
        input: Types.Simplify<I & Struct.Encoded<newFields>>,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<I, ParseResult.ParseIssue, R3>
    },
    annotations?: S.Annotations.Schema<Transformed>
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

export const Class: <Self = never>(identifier?: string) => <Fields extends S.Struct.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
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
  > = (identifier) => (fields, annotations) => {
    const cls = S.Class as any
    return class extends cls(identifier)(fields, annotations) {
      constructor(a, b = true) {
        super(a, b)
      }
      static readonly include = include(fields)
      static readonly pick = (...selection: any[]) => pipe(fields, Struct2.pick(...selection))
      static readonly omit = (...selection: any[]) => pipe(fields, Struct2.omit(...selection))
    } as any
  }

export const TaggedClass: <Self = never>(identifier?: string) => <Tag extends string, Fields extends S.Struct.Fields>(
  tag: Tag,
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
) => [Self] extends [never] ? MissingSelfGeneric<"Class">
  : EnhancedClass<
    Self,
    { readonly "_tag": S.Literal<[Tag]> } & Fields,
    Simplify<{ readonly _tag: Tag } & Struct.Type<Fields>>,
    Simplify<{ readonly _tag: Tag } & Struct.Encoded<Fields>>,
    Schema.Context<Fields[keyof Fields]>,
    Simplify<S.ToStructConstructor<Fields>>,
    {},
    {}
  > = (identifier) => (tag, fields, annotations) => {
    const cls = S.TaggedClass as any
    return class extends cls(identifier)(tag, fields, annotations) {
      constructor(a, b = true) {
        super(a, b)
      }
      static readonly include = include(fields)
      static readonly pick = (...selection: any[]) => pipe(fields, Struct2.pick(...selection))
      static readonly omit = (...selection: any[]) => pipe(fields, Struct2.omit(...selection))
    } as any
  }

export const ExtendedClass: <Self, SelfFrom>(identifier?: string) => <Fields extends S.Struct.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
) => EnhancedClass<
  Self,
  Fields,
  Simplify<Struct.Type<Fields>>,
  SelfFrom,
  Schema.Context<Fields[keyof Fields]>,
  Simplify<S.ToStructConstructor<Fields>>,
  {},
  {}
> = Class as any

export const ExtendedTaggedClass: <Self, SelfFrom>(
  identifier?: string
) => <Tag extends string, Fields extends S.Struct.Fields>(
  tag: Tag,
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
) => EnhancedClass<
  Self,
  { readonly "_tag": S.Literal<[Tag]> } & Fields,
  Simplify<{ readonly _tag: Tag } & Struct.Type<Fields>>,
  SelfFrom,
  Schema.Context<Fields[keyof Fields]>,
  Simplify<S.ToStructConstructor<Fields>>,
  {},
  {}
> = TaggedClass as any
