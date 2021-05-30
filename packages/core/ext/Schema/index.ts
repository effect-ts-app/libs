/* eslint-disable @typescript-eslint/no-explicit-any */
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Eq from "@effect-ts/core/Equal"
import * as Ord from "@effect-ts/core/Ord"
import * as O from "@effect-ts-app/core/ext/Option"
import * as SET from "@effect-ts-app/core/ext/Set"
import { v4 } from "uuid"

import { Compute } from "../Compute"
import { constant, Lazy, pipe } from "../Function"
import { typedKeysOf } from "../utils"
import { set, setIdentifier } from "./_api"
import * as S from "./_schema"
import { UUID } from "./_schema"

export * from "./utils"

export function partialConstructor<ConstructorInput, ParsedShape>(model: {
  new (inp: ConstructorInput): ParsedShape
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: Compute<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return (partConstructor) => (restConstructor) =>
    partialConstructor_(model, partConstructor)(restConstructor)
}

export function partialConstructor_<
  ConstructorInput,
  ParsedShape,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    new (inp: ConstructorInput): ParsedShape
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: Compute<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return (restConstructor) =>
    new model({ ...partConstructor, ...restConstructor } as any)
}

// TODO: morph the schema instead.
export function derivePartialConstructor<ConstructorInput, ParsedShape>(model: {
  [S.schemaField]: S.Schema<any, any, ParsedShape, ConstructorInput, any, any, any>
  new (inp: ConstructorInput): ParsedShape
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: Compute<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return (partConstructor) => (restConstructor) =>
    derivePartialConstructor_(model, partConstructor)(restConstructor)
}

export function derivePartialConstructor_<
  ConstructorInput,
  ParsedShape,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    [S.schemaField]: S.Schema<any, any, ParsedShape, ConstructorInput, any, any, any>
    new (inp: ConstructorInput): ParsedShape
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: Compute<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return (restConstructor) =>
    new model({ ...partConstructor, ...restConstructor } as any)
}

export type GetPartialConstructor<A extends (...args: any) => any> = Parameters<
  ReturnType<A>
>[0]

export function makeUuid() {
  return v4() as S.UUID
}

type LazyPartial<T> = {
  [P in keyof T]?: Lazy<T[P]>
}

export function withDefaultConstructorFields<
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  self: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) {
  // TODO: but allow NO OTHERS!
  return <Changes extends LazyPartial<ConstructorInput>>(
    kvs: Changes
  ): S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    Omit<ConstructorInput, keyof Changes> &
      // @ts-expect-error we know keyof Changes matches
      Partial<Pick<ConstructorInput, keyof Changes>>,
    ConstructorError,
    Encoded,
    Api
  > => {
    const constructSelf = S.Constructor.for(self)
    return pipe(
      self,
      S.constructor((u: any) =>
        constructSelf({
          ...u,
          ...Object.keys(kvs).reduce((prev, cur) => {
            if (typeof u[cur] === "undefined") {
              // @ts-expect-error we know we may run and assign
              prev[cur] = kvs[cur]()
            }
            return prev
          }, {} as any),
        } as any)
      )
    )
  }
}

export function makeCurrentDate() {
  return new Date()
}
export function defaultConstructor<
  Self extends S.SchemaUPI,
  As extends O.Option<PropertyKey>,
  Def extends O.Option<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
>(p: S.Property<Self, "required", As, Def>) {
  return (makeDefault: () => S.ParsedShapeOf<Self>) => p.def(makeDefault, "constructor")
}

type SupportedDefaults =
  | SET.Set<any>
  | A.Array<any>
  | O.Some<any>
  | O.None
  | Date
  | boolean
  | UUID

export function findAnnotation<A>(
  schema: S.SchemaAny,
  id: S.Annotation<A>
): A | undefined {
  if (S.isAnnotated(schema, id)) {
    return schema.meta
  }

  if (S.hasContinuation(schema)) {
    return findAnnotation(schema[S.SchemaContinuationSymbol], id)
  }

  return undefined
}

export type SupportedDefaultsSchema = S.Schema<
  unknown,
  S.AnyError,
  SupportedDefaults,
  any,
  S.AnyError,
  any,
  any
>
export type DefaultProperty = S.Property<any, any, any, any>

export type DefaultPropertyRecord = Record<PropertyKey, DefaultProperty>

type ParsedShapeOfBla<X extends S.Schema<any, any, any, any, any, any, any>> =
  X extends S.Schema<any, any, infer Y, any, any, any, any> ? Y : never

// TODO does not properly filter on SupportedDefaults :S
type AllWithDefault<Props extends DefaultPropertyRecord> = {
  [K in keyof Props]: WithDefault<
    S.ParserErrorOf<Props[K]["_schema"]>,
    // TODO
    ParsedShapeOfBla<Props[K]["_schema"]>,
    S.ConstructorInputOf<Props[K]["_schema"]>,
    S.ConstructorErrorOf<Props[K]["_schema"]>,
    S.EncodedOf<Props[K]["_schema"]>,
    S.ApiOf<Props[K]["_schema"]>,
    Props[K]["_as"]
  >
}

export function allWithDefault<Props extends DefaultPropertyRecord>(
  props: Props
): AllWithDefault<Props> {
  return typedKeysOf(props).reduce((prev, cur) => {
    prev[cur] = props[cur]["|>"](withDefault)
    return prev
  }, {} as any)
}

export type WithDefault<
  ParserError extends S.AnyError,
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  As extends O.Option<PropertyKey>
> = S.Property<
  S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  "required",
  As,
  O.Some<["constructor", () => ParsedShape]>
>

export function withDefault<
  ParserError extends S.AnyError,
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  As extends O.Option<PropertyKey>,
  Def extends O.Option<
    [
      "parser" | "constructor" | "both",
      () => S.ParsedShapeOf<
        S.Schema<
          unknown,
          ParserError,
          ParsedShape,
          ConstructorInput,
          ConstructorError,
          Encoded,
          Api
        >
      >
    ]
  >
>(
  p: S.Property<
    S.Schema<
      unknown,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    "required",
    As,
    Def
  >
): WithDefault<
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api,
  As
> {
  if (findAnnotation(p._schema, S.dateIdentifier)) {
    return p.def(makeCurrentDate as any, "constructor")
  }
  if (findAnnotation(p._schema, S.nullableIdentifier)) {
    return p.def(() => O.none as any, "constructor")
  }
  if (findAnnotation(p._schema, S.arrayIdentifier)) {
    return p.def(() => [] as any, "constructor")
  }
  if (findAnnotation(p._schema, setIdentifier)) {
    return p.def(() => new Set() as any, "constructor")
  }
  if (findAnnotation(p._schema, S.boolIdentifier)) {
    return p.def(() => false as any, "constructor")
  }
  if (findAnnotation(p._schema, S.UUIDIdentifier)) {
    return p.def(makeUuid as any, "constructor")
  }
  throw new Error("Not supported")
}

function defProp<Self extends S.SchemaUPI>(
  schema: Self,
  makeDefault: () => S.ParsedShapeOf<Self>
) {
  return S.prop(schema).def(makeDefault, "constructor")
}

export function defaultProp<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  schema: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  makeDefault: () => ParsedShape
): S.Property<
  S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  "required",
  O.None,
  O.Some<["constructor", () => ParsedShape]>
>
export function defaultProp<
  ParserError extends S.AnyError,
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  schema: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.Property<
  S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  "required",
  O.None,
  O.Some<["constructor", () => ParsedShape]>
>
export function defaultProp(
  schema: S.Schema<unknown, S.AnyError, any, any, S.AnyError, any, any>,
  makeDefault?: () => any
) {
  return makeDefault ? defProp(schema, makeDefault) : S.prop(schema)["|>"](withDefault)
}

export function include<Props extends Record<string, S.AnyProperty>>(props: Props) {
  return <NewProps extends Record<string, S.AnyProperty>>(
    fnc: (props: Props) => NewProps
  ) => include_(props, fnc)
}

export function include_<
  Props extends Record<string, S.AnyProperty>,
  NewProps extends Record<string, S.AnyProperty>
>(props: Props, fnc: (props: Props) => NewProps) {
  return fnc(props)
}

export function makeOptional<NER extends Record<string, S.AnyProperty>>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.Property<
    NER[K]["_schema"],
    "optional",
    NER[K]["_as"],
    NER[K]["_def"]
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = t[cur].opt()
    return prev
  }, {} as any)
}

export function makeRequired<NER extends Record<string, S.AnyProperty>>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.Property<
    NER[K]["_schema"],
    "required",
    NER[K]["_as"],
    NER[K]["_def"]
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = t[cur].req()
    return prev
  }, {} as any)
}

export function createUnorder<T>(): Ord.Ord<T> {
  return {
    compare: (_a: T, _b: T) => 0,
  }
}
export function makeSet<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  ord: Ord.Ord<ParsedShape>,
  eq_?: Eq.Equal<ParsedShape>
) {
  const eq = eq_ ?? Ord.getEqual(ord)
  const s = set(type, ord, eq)
  return Object.assign(s, SET.make(ord, eq))
}

export function makeUnorderedContramappedStringSet<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  MA extends string
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  contramap: (a: ParsedShape) => MA
) {
  return makeUnorderedSet(type, Eq.contramap(contramap)(Eq.string))
}

export function makeUnorderedStringSet<A extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: S.Schema<
    unknown, //ParserInput,
    any, // S.AnyError //ParserError,
    A,
    any, //ConstructorInput,
    any, //ConstructorError,
    any, //Encoded
    any //Api
  >
) {
  return makeUnorderedSet(type, Eq.string)
}

export function makeUnorderedSet<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  eq: Eq.Equal<ParsedShape>
) {
  return makeSet(type, createUnorder<ParsedShape>(), eq)
}

export function makeContramappedSet<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  MA
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  contramap: (a: ParsedShape) => MA,
  ord: Ord.Ord<MA>,
  eq: Eq.Equal<MA>
) {
  return makeSet(type, Ord.contramap_(ord, contramap), Eq.contramap(contramap)(eq))
}

export const constArray = constant(A.empty)

export * from "./_api"
// customized Model
export { Model } from "./Model"
export * from "./Model"
export * from "./adapt"

export * from "./vendor"
