/* eslint-disable @typescript-eslint/no-explicit-any */
import { constant, pipe } from "@effect-app/core/Function"
import * as NonEmptySet from "@effect-app/core/NonEmptySet"
import type { ComputeFlat, EnforceNonEmptyRecord } from "@effect-app/core/utils"
import { typedKeysOf } from "@effect-app/core/utils"
import type { None, Some } from "effect/Option"
import { v4 } from "uuid"

import type { FromProperty } from "./_api.js"
import { EParserFor, set, setIdentifier } from "./_api.js"
import { nonEmptySet } from "./_api/nonEmptySet.js"
import * as MO from "./_schema.js"
import type { UUID } from "./_schema.js"
import { propDef, propOpt, propReq } from "./_schema.js"

// We're using getters with curried functions, instead of fluent functions, so that they can be used directly in lambda callbacks

import type { AnyError, Schema, SchemaUnion, SchemaUPI } from "./custom.js"
import { drawError, field, nullable, unsafe } from "./custom.js"
import type { These } from "./custom/These.js"
import type { OptionalConstructor } from "./tools.js"
import { Parser } from "./vendor.js"

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
export function FromClass<Cls extends { [MO.schemaField]: MO.SchemaAny }>() {
  return FromClassBase<EncodedFromApi<Cls>>()
}

export function partialConstructor<ConstructorInput, To>(model: {
  new(inp: ConstructorInput): To
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (partConstructor) => (restConstructor) => partialConstructor_(model, partConstructor)(restConstructor)
}

export function partialConstructor_<
  ConstructorInput,
  To,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    new(inp: ConstructorInput): To
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (restConstructor) => new model({ ...partConstructor, ...restConstructor } as any)
}

export function partialConstructorF<ConstructorInput, To>(
  constr: (inp: ConstructorInput) => To
): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (partConstructor) => (restConstructor) => partialConstructorF_(constr, partConstructor)(restConstructor)
}

export function partialConstructorF_<
  ConstructorInput,
  To,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  constr: (inp: ConstructorInput) => To,
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (restConstructor) => constr({ ...partConstructor, ...restConstructor } as any)
}

// TODO: morph the schema instead.
export function derivePartialConstructor<ConstructorInput, To>(model: {
  [MO.schemaField]: MO.Schema<any, To, ConstructorInput, any, any>
  new(inp: ConstructorInput): To
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (partConstructor) => (restConstructor) => derivePartialConstructor_(model, partConstructor)(restConstructor)
}

export function derivePartialConstructor_<
  ConstructorInput,
  To,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    [MO.schemaField]: MO.Schema<any, To, ConstructorInput, any, any>
    new(inp: ConstructorInput): To
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => To {
  return (restConstructor) => new model({ ...partConstructor, ...restConstructor } as any)
}

export type GetPartialConstructor<A extends (...args: any) => any> = Parameters<
  ReturnType<A>
>[0]

export function makeUuid() {
  return v4() as MO.UUID
}

type LazyPartial<T> = {
  [P in keyof T]?: LazyArg<T[P]>
}

export function withDefaultConstructorFields<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>) {
  // TODO: but allow NO OTHERS!
  return <Changes extends LazyPartial<ConstructorInput>>(
    kvs: Changes
  ): MO.Schema<
    ParserInput,
    To,
    & Omit<ConstructorInput, keyof Changes>
    & // @ts-expect-error we know keyof Changes matches
    Partial<Pick<ConstructorInput, keyof Changes>>,
    From,
    Api
  > => {
    const constructSelf = MO.Constructor.for(self)
    return pipe(
      self,
      MO.constructor((u: any) =>
        constructSelf({
          ...u,
          ...Object.keys(kvs).reduce((prev, cur) => {
            if (typeof u[cur] === "undefined") {
              prev[cur] = kvs[cur]()
            }
            return prev
          }, {} as any)
        })
      )
    )
  }
}

export function makeCurrentDate() {
  return new Date()
}
export function defaultConstructor<
  Self extends MO.SchemaUPI,
  As extends Option<PropertyKey>,
  Def extends Option<["parser" | "constructor" | "both", () => MO.To<Self>]>
>(p: MO.Property<Self, "required", As, Def>) {
  return (makeDefault: () => MO.To<Self>) => propDef(p, makeDefault, "constructor")
}

export type SupportedDefaults =
  | ROSet<any>
  | ReadonlyArray<any>
  | Some<any>
  | None<any>
  | Date
  | boolean
  | UUID

export function findAnnotation<A>(
  schema: MO.SchemaAny,
  id: MO.Annotation<A>
): A | undefined {
  if (MO.isAnnotated(schema, id)) {
    return schema.meta
  }

  if (MO.hasContinuation(schema)) {
    return findAnnotation(schema[MO.SchemaContinuationSymbol], id)
  }

  return undefined
}

export type SupportedDefaultsSchema = MO.Schema<any, SupportedDefaults, any, any, any>
export type DefaultProperty = FromProperty<any, any, any, any>

export type DefaultPropertyRecord = Record<PropertyKey, DefaultProperty>

export type WithDefault<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api,
  As extends Option<PropertyKey>
> = MO.Property<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  As,
  Some<["constructor", () => To]>
>

export type WithInputDefault<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api,
  As extends Option<PropertyKey>
> = MO.Property<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  As,
  Some<["both", () => To]>
>

export function withDefault<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api,
  As extends Option<PropertyKey>,
  Def extends Option<
    [
      "parser" | "constructor" | "both",
      () => MO.To<
        MO.Schema<unknown, To, ConstructorInput, From, Api>
      >
    ]
  >
>(
  p: MO.Property<
    MO.Schema<unknown, To, ConstructorInput, From, Api>,
    "required",
    As,
    Def
  >
): WithDefault<To, ConstructorInput, From, Api, As> {
  if (findAnnotation(p._schema, MO.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.optionFromNullIdentifier)) {
    return propDef(p, () => Option.none as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.nullableIdentifier)) {
    return propDef(p, () => null as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.arrayIdentifier)) {
    return propDef(p, () => [] as any, "constructor")
  }
  if (findAnnotation(p._schema, setIdentifier)) {
    return propDef(p, () => new Set() as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.boolIdentifier)) {
    return propDef(p, () => false as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.UUIDIdentifier)) {
    return propDef(p, makeUuid as any, "constructor")
  }
  throw new Error("Not supported")
}

export function withInputDefault<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api,
  As extends Option<PropertyKey>,
  Def extends Option<
    [
      "parser" | "constructor" | "both",
      () => MO.To<
        MO.Schema<unknown, To, ConstructorInput, From, Api>
      >
    ]
  >
>(
  p: MO.Property<
    MO.Schema<unknown, To, ConstructorInput, From, Api>,
    "required",
    As,
    Def
  >
): WithInputDefault<To, ConstructorInput, From, Api, As> {
  if (findAnnotation(p._schema, MO.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "both")
  }
  if (findAnnotation(p._schema, MO.optionFromNullIdentifier)) {
    return propDef(p, () => Option.none as any, "both")
  }
  if (findAnnotation(p._schema, MO.nullableIdentifier)) {
    return propDef(p, () => null as any, "both")
  }
  if (findAnnotation(p._schema, MO.arrayIdentifier)) {
    return propDef(p, () => [] as any, "both")
  }
  if (findAnnotation(p._schema, setIdentifier)) {
    return propDef(p, () => new Set() as any, "both")
  }
  if (findAnnotation(p._schema, MO.boolIdentifier)) {
    return propDef(p, () => false as any, "both")
  }
  if (findAnnotation(p._schema, MO.UUIDIdentifier)) {
    return propDef(p, makeUuid as any, "both")
  }
  throw new Error("Not supported")
}

export function defaultProp<To, ConstructorInput, From, Api>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  makeDefault: () => To
): MO.Property<
  MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>
): FromProperty<
  MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<To, ConstructorInput, From, Api>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>
): null extends To ? FromProperty<
    MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
    "required",
    None<any>,
    Some<["constructor", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp<To, ConstructorInput, From, Api>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  makeDefault: () => To
): MO.Property<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>
): FromProperty<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<To, ConstructorInput, From, Api>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>
): null extends To ? FromProperty<
    MO.Schema<unknown, To, ConstructorInput, From, Api>,
    "required",
    None<any>,
    Some<["constructor", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp(
  schema: MO.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault ? MO.defProp(schema, makeDefault) : MO.field(schema) >= withDefault
}

export function defaultInputProp<To, ConstructorInput, From, Api>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  makeDefault: () => To
): MO.Property<
  MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>
): FromProperty<
  MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<To, ConstructorInput, From, Api>(
  schema: MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>
): null extends To ? FromProperty<
    MO.SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>,
    "required",
    None<any>,
    Some<["both", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp<To, ConstructorInput, From, Api>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  makeDefault: () => To
): MO.Property<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>
): FromProperty<
  MO.Schema<unknown, To, ConstructorInput, From, Api>,
  "required",
  None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<To, ConstructorInput, From, Api>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>
): null extends To ? FromProperty<
    MO.Schema<unknown, To, ConstructorInput, From, Api>,
    "required",
    None<any>,
    Some<["both", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp(
  schema: MO.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault
    ? MO.defProp(schema, makeDefault, "both")
    : MO.field(schema) >= withInputDefault
}

// TODO: support schema mix with property
export function makeOptional<NER extends Record<string, MO.AnyProperty>>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: MO.Property<
    NER[K]["_schema"],
    "optional",
    NER[K]["_as"],
    NER[K]["_def"]
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = propOpt(t[cur])
    return prev
  }, {} as any)
}

export function makeRequired<NER extends Record<string, MO.AnyProperty>>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: MO.Property<
    NER[K]["_schema"],
    "required",
    NER[K]["_as"],
    NER[K]["_def"]
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = propReq(t[cur])
    return prev
  }, {} as any)
}

export function createUnorder<T>(): Order<T> {
  return (_a: T, _b: T) => 0
}
export function makeSet<To, ConstructorInput, From, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  ord: Order<To>,
  eq?: Equivalence<To>
) {
  const s = set(type, ord, eq)
  return Object.assign(s, ROSet.make(ord, eq))
}

// export function makeUnorderedContramappedStringSet<
//   To,
//   ConstructorInput,
//   From,
//   Api,
//   MA extends string
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
//   contramap: (a: To) => MA
// ) {
//   return makeUnorderedSet(type, Eq.contramap(contramap)(Eq.string))
// }

export function makeUnorderedStringSet<A extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<
    unknown, // ParserInput,
    A,
    any, // ConstructorInput,
    any, // From
    any // Api
  >
) {
  return makeUnorderedSet(type, Equivalence.string)
}

export function makeUnorderedSet<To, ConstructorInput, From, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  eq: Equivalence<To>
) {
  return makeSet(type, createUnorder<To>(), eq)
}

// export function makeContramappedSet<To, ConstructorInput, From, Api, MA>(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
//   contramap: (a: To) => MA,
//   ord: Order<MA>,
//   eq: Equivalence<MA>
// ) {
//   return makeSet(type, LegacyOrder.contramap_(ord, contramap), Eq.contramap(contramap)(eq))
// }

export function makeNonEmptySet<To, ConstructorInput, From, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  ord: Order<To>,
  eq?: Equivalence<To>
) {
  const s = nonEmptySet(type, ord, eq)
  return Object.assign(s, NonEmptySet.make(ord, eq))
}

// export function makeUnorderedContramappedStringNonEmptySet<
//   To,
//   ConstructorInput,
//   From,
//   Api,
//   MA extends string
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
//   contramap: (a: To) => MA
// ) {
//   return makeUnorderedNonEmptySet(type, Eq.contramap(contramap)(Eq.string))
// }

export function makeUnorderedStringNonEmptySet<A extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<
    unknown, // ParserInput,
    A,
    any, // ConstructorInput,
    any, // From
    any // Api
  >
) {
  return makeUnorderedNonEmptySet(type, Equivalence.string)
}

export function makeUnorderedNonEmptySet<To, ConstructorInput, From, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
  eq: Equivalence<To>
) {
  return makeNonEmptySet(type, createUnorder<To>(), eq)
}

// export function makeContramappedNonEmptySet<
//   To,
//   ConstructorInput,
//   From,
//   Api,
//   MA
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, To, ConstructorInput, From, Api>,
//   contramap: (a: To) => MA,
//   ord: Order<MA>,
//   eq: Equivalence<MA>
// ) {
//   return makeNonEmptySet(
//     type,
//     LegacyOrder.contramap_(ord, contramap),
//     Eq.contramap(contramap)(eq)
//   )
// }

export const constArray = constant(ReadonlyArray.empty)

export type ParserInputFromSchemaProperties<T> = T extends {
  Api: { fields: infer Fields }
} ? Fields extends MO.PropertyRecord ? MO.ParserInputFromProperties<Fields>
  : never
  : never

/**
 * We know that the Parser will work from `unknown`, but we also want to expose the knowledge that we can parse from a ParserInput of type X
 * as such we can use fromProps, fromProp, fromArray etc, but still embed this Schema into one that parses from unknown.
 */
export type AsUPI<To, ConstructorInput, From, Api> = MO.Schema<
  unknown,
  To,
  ConstructorInput,
  From,
  Api
>

/**
 * @see AsUPI
 */
export const asUpi = <To, ConstructorInput, From, Api>(
  s: MO.Schema<any, To, ConstructorInput, From, Api>
) => s as AsUPI<To, ConstructorInput, From, Api>

export class CustomSchemaException
  extends Data.TaggedError("ValidationError")<{ errors: ReadonlyArray<unknown>; message: string }>
{
  constructor(error: AnyError) {
    super({ errors: [error], message: drawError(error) })
  }
}

/**
 * The Effect fails with `CustomSchemaException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnCustom_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspend(() => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      return new CustomSchemaException(res.left)
    }
    const warn = res.right[1]
    if (warn._tag === "Some") {
      return new CustomSchemaException(warn.value)
    }
    return Effect(res.right[0])
  })
}

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 */
export function condemn_<X, E, A>(
  self: Parser.Parser<X, E, A>,
  x: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspend(() => {
    const y = self(x, env).effect
    if (y._tag === "Left") {
      return Effect.fail(y.left)
    }
    const [a, w] = y.right
    return w._tag === "Some"
      ? Effect.fail(w.value)
      : Effect(a)
  })
}

/**
 * @tsplus getter ets/Schema/Parser condemnCustom
 */
export function condemnCustom<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnCustom_(self, a, env)
}

export function condemnLeft_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
): Either<CustomSchemaException, A> {
  const res = self(a, env).effect
  if (res._tag === "Left") {
    return Either.left(new CustomSchemaException(res.left))
  }
  const warn = res.right[1]
  if (warn._tag === "Some") {
    return Either.left(new CustomSchemaException(warn.value))
  }
  return Either(res.right[0])
}

/**
 * @tsplus getter ets/Schema/Parser condemnLeft
 */
export function condemnLeft<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnLeft_(self, a, env)
}

export function parseCondemnCustom_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnCustom_(parser, a, env)
}

export function parseECondemnCustom_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnCustom_(parser, a, env)
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnDie_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return cl(a, env).orDie
}

export function parseCondemnDie_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnDie_(parser, a, env)
}

export function parseECondemnDie_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnDie_(parser, a, env)
}

/**
 * @tsplus getter ets/Schema/Schema parseECondemnDie
 */
export function parseECondemnDie<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseECondemnFail
 */
export function parseECondemnFail<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnFail_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseECondemnLeft
 */
export function parseECondemnLeft<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseECondemnCustom
 */
export function parseECondemnCustom<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnDie
 */
export function parseCondemnDie<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnFail
 */
export function parseCondemnFail<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  return (a: A, env?: Parser.ParserEnv) => {
    const parser = Parser.for(self)
    return condemnFail_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnLeft
 */
export function parseCondemnLeft<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnCustom
 */
export function parseCondemnCustom<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemn
 */
export function parseCondemn<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

export function parseECondemn_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemn_(parser, a, env)
}

/**
 * @tsplus getter ets/Schema/Schema parseECondemn
 */
export function parseECondemn<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseUnsafe
 */
export function parseUnsafe<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  const uns = unsafe(parser)
  return (a: A, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Parser parseEUnsafe
 */
export function parseEUnsafe<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  const uns = unsafe(parser)
  return (a: D, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

/**
 * The Effect fails with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnFail_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return cl(a, env)
}

export function parseCondemnFail_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnFail_(parser, a, env)
}

export function parseECondemnFail_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnFail_(parser, a, env)
}

export function parseCondemnLeft_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv
) {
  const parser = Parser.for(self)
  return condemnLeft_(parser, a, env)
}

export function parseECondemnLeft_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv
) {
  const parser = EParserFor(self)
  return condemnLeft_(parser, a, env)
}

/**
 * @tsplus getter ets/Schema/Schema withDefault
 */
export const withDefaultProp = <To extends SupportedDefaults, ConstructorInput, From, Api>(
  schema: Schema<unknown, To, ConstructorInput, From, Api>
) => defaultProp(schema)

/**
 * @tsplus getter ets/Schema/Schema optional
 */
export const optionalProp = <To, ConstructorInput, From, Api>(
  schema: Schema<unknown, To, ConstructorInput, From, Api>
) => MO.optProp(schema)

/**
 * @tsplus getter ets/Schema/SchemaUnion optional
 */
export const optionalUnionProp = <Fields extends Record<PropertyKey, SchemaUPI>>(
  schema: SchemaUnion<Fields>
) => MO.optProp(schema)

/**
 * @tsplus getter ets/Schema/Schema nullable
 */
export const nullableProp = <ParserInput, To, ConstructorInput, From, Api>(
  schema: Schema<ParserInput, To, ConstructorInput, From, Api>
) => nullable(schema)

// /**
//  * @tsplus getter ets/Schema/Schema withDefault
//  */
// export const withDefaultProp3 = <To extends SupportedDefaults, ConstructorInput, From, Api>(
//   schema: SchemaDefaultSchema<unknown, To, ConstructorInput, From, Api>
// ) => defaultProp(schema)

// /**
//  * @tsplus fluent ets/Schema/Schema withDefaultN
//  */
// export function withDefaultPropNullable<To extends null, ConstructorInput, From, Api>(
//   schema: Schema<unknown, To, ConstructorInput, From, Api>
// ): null extends To ? FromProperty<
//     Schema<unknown, To, ConstructorInput, From, Api>,
//     "required",
//     None<any>,
//     Some<["constructor", () => To]>
//   >
//   : ["Not a supported type, see SupportedTypes", never]
// {
//   return defaultProp(schema)
// }

/**
 * @tsplus getter ets/Schema/Schema withDefaultMake
 */
export const withDefaultMake = <To, ConstructorInput, From, Api>(
  schema: Schema<unknown, To, ConstructorInput, From, Api>
) =>
(makeDefault: () => To) => defaultProp(schema, makeDefault)

/**
 * @tsplus fluent ets/Schema/Schema fromProp
 */
export const fromPropProp = <To, ConstructorInput, From, Api, As1 extends PropertyKey>(
  schema: Schema<unknown, To, ConstructorInput, From, Api>,
  as: As1
) => field(schema).from(as)

export type SchemaFrom<Cls extends { Class: MO.SchemaAny }> = Cls["Class"]

export type GetProps<Cls extends { Api: { fields: MO.PropertyRecord } }> = // Transform<
  Cls["Api"]["fields"]

export type GetProvidedProps<
  Cls extends { [MO.schemaField]: { Api: { fields: MO.PropertyRecord } } }
> = GetProps<Cls[MO.schemaField]>
// Cls["ProvidedProps"] //Transform<

export type EncodedFromApi<Cls extends { [MO.schemaField]: MO.SchemaAny }> = MO.From<
  Cls[MO.schemaField]
> // Transform<
export type ConstructorInputFromApi<Cls extends { [MO.schemaField]: MO.SchemaAny }> = MO.ConstructorInputOf<
  Cls[MO.schemaField]
>
// >

// export type From<X extends Schema<any, any, any, any, any>> = Transform<
//   FromOrig<X>
// >

export type OpaqueEncoded<OpaqueE, Schema> = Schema extends MO.DefaultSchema<
  unknown,
  infer A,
  infer B,
  OpaqueE,
  infer C
> ? MO.DefaultSchema<unknown, A, B, OpaqueE, C>
  : never

// TODO: Add `is` guards (esp. for tagged unions.)
export function smartClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>
>(members: T & EnforceNonEmptyRecord<T>, name?: string) {
  // @ts-expect-error we know this is NonEmpty
  const u = MO.union(members)
  return enhanceClassUnion(u, name)
}

export function enhanceClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
  A,
  E,
  CI
>(u: MO.DefaultSchema<any, A, CI, E, MO.UnionApi<T>>, name?: string) {
  if (name) u = u.pipe(MO.named(name)) as typeof u
  const members = findAnnotation(u, MO.unionIdentifier)!.fields as T

  const entries = Object.entries(members)
  const as = entries.reduce((prev, [key, value]) => {
    prev[key] = (i: any) => new value(i)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: OptionalConstructor<MO.ConstructorInputOf<T[Key]>>) => A
  }
  const of = entries.reduce((prev, [key, value]) => {
    prev[key] = (i: any) => new value(i)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: OptionalConstructor<MO.ConstructorInputOf<T[Key]>>) => InstanceType<T[Key]>
  }

  // Experiment with returning a constructor that returns a Union
  const cas = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: { new(i: OptionalConstructor<MO.ConstructorInputOf<T[Key]>>): A }
  }

  const mem = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: T[Key]
  }

  const of_ = (i: A): A => i
  const ext = {
    members,
    cas,
    mem,
    as,
    of,
    of_,
    EParser: EParserFor(u)
  } as SmartClassUnion<T, E, A>
  return Object.assign(u, ext)
}

export interface SmartClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
  From,
  To
> {
  members: T
  cas: {
    [Key in keyof T]: { new(i: MO.ConstructorInputOf<T[Key]>): To }
  }
  mem: {
    [Key in keyof T]: T[Key]
  }
  of: {
    [Key in keyof T]: (i: MO.ConstructorInputOf<T[Key]>) => InstanceType<T[Key]>
  }
  of_: (i: To) => To
  as: {
    [Key in keyof T]: (i: MO.ConstructorInputOf<T[Key]>) => To
  }
  EParser: Parser.Parser<From, any, To>
}

export function smartUnion<T extends Record<PropertyKey, SchemaUPI>>(
  members: T & EnforceNonEmptyRecord<T>
) {
  // @ts-expect-error we know this is NonEmpty
  const u = MO.union(members)
  return enhanceUnion(u)
}

export function enhanceUnion<T extends Record<PropertyKey, SchemaUPI>, A, E, CI>(
  u: MO.DefaultSchema<any, A, CI, E, MO.UnionApi<T>>
) {
  const members = findAnnotation(u, MO.unionIdentifier)!.fields as T
  const entries = Object.entries(members)
  // const as = entries.reduce((prev, [key, value]) => {
  //   prev[key] = Constructor.for(value)
  //   return prev
  // }, {} as Record<PropertyKey, any>) as any as {
  //   [Key in keyof T]: (
  //     i: ConstructorInputOf<T[Key]>
  //   ) => These<ConstructorErrorOf<T[Key]>, A>
  // }
  const as = entries.reduce((prev, [key, value]) => {
    prev[key] = MO.Constructor.for(value)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (
      i: MO.ConstructorInputOf<T[Key]>
    ) => These<MO.ConstructorErrorOf<T[Key]>, A>
  }
  const of = entries.reduce((prev, [key, value]) => {
    prev[key] = MO.Constructor.for(value).pipe(unsafe)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: MO.ConstructorInputOf<T[Key]>) => MO.To<T[Key]> // These<ConstructorErrorOf<T[Key]>, To<T[Key]>>
  }
  const mem = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: T[Key]
  }

  const of_ = (i: A): A => i
  const ext = {
    members,
    as,
    mem,
    of,
    of_,
    EParser: EParserFor(u)
  } as SmartUnion<T, E, A>
  return Object.assign(u, ext)
}

export interface SmartUnion<
  T extends Record<PropertyKey, SchemaUPI>,
  From,
  To
> {
  members: T
  mem: {
    [Key in keyof T]: T[Key]
  }
  of: {
    [Key in keyof T]: (i: MO.ConstructorInputOf<T[Key]>) => MO.To<T[Key]>
  }
  of_: (i: To) => To
  as: {
    [Key in keyof T]: (
      i: MO.ConstructorInputOf<T[Key]>
    ) => These<MO.ConstructorErrorOf<T[Key]>, To>
  }
  EParser: Parser.Parser<From, any, To>
}

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function validate<X, A>(
  self: (a: X) => These<any, A>
): (a: X) => Either<CustomSchemaException, A> {
  return (x) => {
    const y = self(x).effect
    if (y._tag === "Left") {
      return Either.left(new CustomSchemaException(y.left))
    }
    const [a, w] = y.right
    return w._tag === "Some"
      ? Either.left(new CustomSchemaException(w.value))
      : Either(a)
  }
}

/**
 * Value: The value you want to submit after validation. e.g for text input: `ReasonableString`
 * InputValue: The internal value of the input, e.g for text input: `string`
 */
export type InputSchema<Value, InputValue> = MO.DefaultSchema<
  unknown,
  Value,
  any,
  InputValue,
  any
>

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function makeValidator<Value, InputValue>(self: InputSchema<Value, InputValue>) {
  return validate(EParserFor(self))
}

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function makeValidatorFromUnknown<Value, InputValue>(
  self: InputSchema<Value, InputValue>
) {
  return validate(Parser.for(self))
}

// TODO: Opaque UnionApi (return/input type of matchW etc?)
export function OpaqueSchema<A, E = A, CI = A>() {
  function abc<OriginalA, ParserInput, Api>(
    self: MO.DefaultSchema<any, OriginalA, any, any, Api>
  ): MO.DefaultSchema<ParserInput, A, CI, E, Api> & { original: OriginalA }
  function abc<
    OriginalA,
    ParserInput,
    Api,
    A1 extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
    A2,
    A3
  >(
    self: MO.DefaultSchema<any, OriginalA, any, any, Api> & SmartClassUnion<A1, A2, A3>
  ):
    & MO.DefaultSchema<ParserInput, A, CI, E, Api>
    & SmartClassUnion<A1, A2, A3>
    & { original: OriginalA }
  // function abc<
  //   ParserInput,
  //   Api,
  //   A1 extends Record<PropertyKey, SchemaUPI & { new (i: any): any }>,
  //   A2,
  //   A3
  // >(
  //   self: DefaultSchema<any, any, any, any, Api> & SmartUnion<A1, A2, A3>
  // ): DefaultSchema<ParserInput, A, CI, E, Api> & SmartUnion<A1, A2, A3>
  function abc(self: any): any {
    return self
  }
  return abc
}

export interface UnionBrand {}

/**
 * Currently does not implement composition, but is useful as a quick set/modify.
 * @tsplus type PreparedLens
 */
export class PreparedLens<S, T> {
  constructor(private readonly s: S, readonly lens: Lens<S, T>) {}
  get = () => this.lens.get(this.s)
  set = (t: T) => this.lens.replace(this.s, t)
}

/**
 * @tsplus getter PreparedLens modify
 */
export function modify<S, T>(l: PreparedLens<S, T>) {
  return (mod: (t: T) => T) => l.set(mod(l.get()))
}

/**
 * @tsplus getter PreparedLens replace
 */
export function replace<S, T>(l: PreparedLens<S, T>) {
  return (t: T) => l.set(t)
}

export function makePreparedLenses<S, Fields extends MO.PropertyRecord>(
  fields: Fields,
  s: S
): { [K in keyof Fields]: PreparedLens<S, MO.To<Fields[K]["_schema"]>> } {
  function makeLens<T>(l: Lens<S, T>) {
    return new PreparedLens(s, l)
  }
  const id = Optic.id<S>()
  return Object.keys(fields).reduce((prev, cur) => {
    prev[cur] = makeLens(id.at(cur as any))
    return prev
  }, {} as any)
}
