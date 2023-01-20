/* eslint-disable @typescript-eslint/no-explicit-any */
import { constant, pipe } from "@effect-app/core/Function"
import * as NonEmptySet from "@effect-app/core/NonEmptySet"
import type { ComputeFlat } from "@effect-app/core/utils"
import { typedKeysOf } from "@effect-app/core/utils"
import type { None, Some } from "@fp-ts/data/Option"
import { v4 } from "uuid"

import type { FromProperty } from "./_api.js"
import { set, setIdentifier } from "./_api.js"
import { nonEmptySet } from "./_api/nonEmptySet.js"
import * as MO from "./_schema.js"
import type { Property, UUID } from "./_schema.js"
import { propDef, propOpt, propReq } from "./_schema.js"

export function partialConstructor<ConstructorInput, ParsedShape>(model: {
  new(inp: ConstructorInput): ParsedShape
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return partConstructor => restConstructor => partialConstructor_(model, partConstructor)(restConstructor)
}

export function partialConstructor_<
  ConstructorInput,
  ParsedShape,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    new(inp: ConstructorInput): ParsedShape
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return restConstructor => new model({ ...partConstructor, ...restConstructor } as any)
}

export function partialConstructorF<ConstructorInput, ParsedShape>(
  constr: (inp: ConstructorInput) => ParsedShape
): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return partConstructor => restConstructor => partialConstructorF_(constr, partConstructor)(restConstructor)
}

export function partialConstructorF_<
  ConstructorInput,
  ParsedShape,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  constr: (inp: ConstructorInput) => ParsedShape,
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return restConstructor => constr({ ...partConstructor, ...restConstructor } as any)
}

// TODO: morph the schema instead.
export function derivePartialConstructor<ConstructorInput, ParsedShape>(model: {
  [MO.schemaField]: MO.Schema<any, ParsedShape, ConstructorInput, any, any>
  new(inp: ConstructorInput): ParsedShape
}): <PartialConstructorInput extends Partial<ConstructorInput>>(
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
) => (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return partConstructor => restConstructor => derivePartialConstructor_(model, partConstructor)(restConstructor)
}

export function derivePartialConstructor_<
  ConstructorInput,
  ParsedShape,
  PartialConstructorInput extends Partial<ConstructorInput>
>(
  model: {
    [MO.schemaField]: MO.Schema<any, ParsedShape, ConstructorInput, any, any>
    new(inp: ConstructorInput): ParsedShape
  },
  // TODO: Prevent over provide
  partConstructor: PartialConstructorInput
): (
  restConstructor: ComputeFlat<Omit<ConstructorInput, keyof PartialConstructorInput>>
) => ParsedShape {
  return restConstructor => new model({ ...partConstructor, ...restConstructor } as any)
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
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>) {
  // TODO: but allow NO OTHERS!
  return <Changes extends LazyPartial<ConstructorInput>>(
    kvs: Changes
  ): MO.Schema<
    ParserInput,
    ParsedShape,
    & Omit<ConstructorInput, keyof Changes>
    & // @ts-expect-error we know keyof Changes matches
    Partial<Pick<ConstructorInput, keyof Changes>>,
    Encoded,
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
  As extends Opt<PropertyKey>,
  Def extends Opt<["parser" | "constructor" | "both", () => MO.ParsedShapeOf<Self>]>
>(p: MO.Property<Self, "required", As, Def>) {
  return (makeDefault: () => MO.ParsedShapeOf<Self>) => propDef(p, makeDefault, "constructor")
}

type SupportedDefaults =
  | ROSet<any>
  | ReadonlyArray<any>
  | Some<any>
  | None
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
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api,
  As extends Opt<PropertyKey>
> = MO.Property<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  As,
  Some<["constructor", () => ParsedShape]>
>

export type WithInputDefault<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api,
  As extends Opt<PropertyKey>
> = MO.Property<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  As,
  Some<["both", () => ParsedShape]>
>

export function withDefault<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api,
  As extends Opt<PropertyKey>,
  Def extends Opt<
    [
      "parser" | "constructor" | "both",
      () => MO.ParsedShapeOf<
        MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
      >
    ]
  >
>(
  p: MO.Property<
    MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
    "required",
    As,
    Def
  >
): WithDefault<ParsedShape, ConstructorInput, Encoded, Api, As> {
  if (findAnnotation(p._schema, MO.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "constructor")
  }
  if (findAnnotation(p._schema, MO.optionFromNullIdentifier)) {
    return propDef(p, () => Opt.none as any, "constructor")
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
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api,
  As extends Opt<PropertyKey>,
  Def extends Opt<
    [
      "parser" | "constructor" | "both",
      () => MO.ParsedShapeOf<
        MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
      >
    ]
  >
>(
  p: MO.Property<
    MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
    "required",
    As,
    Def
  >
): WithInputDefault<ParsedShape, ConstructorInput, Encoded, Api, As> {
  if (findAnnotation(p._schema, MO.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "both")
  }
  if (findAnnotation(p._schema, MO.optionFromNullIdentifier)) {
    return propDef(p, () => Opt.none as any, "both")
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

type Optionality = "parser" | "constructor" | "both"

function defProp<Self extends MO.SchemaUPI>(
  schema: Self,
  makeDefault: () => MO.ParsedShapeOf<Self>,
  optionality: "parser"
): MO.Property<Self, "required", None, Some<["parser", () => MO.ParsedShapeOf<Self>]>>
function defProp<Self extends MO.SchemaUPI>(
  schema: Self,
  makeDefault: () => MO.ParsedShapeOf<Self>,
  optionality: "both"
): MO.Property<Self, "required", None, Some<["both", () => MO.ParsedShapeOf<Self>]>>
function defProp<Self extends MO.SchemaUPI>(
  schema: Self,
  makeDefault: () => MO.ParsedShapeOf<Self>
): MO.Property<
  Self,
  "required",
  None,
  Some<["constructor", () => MO.ParsedShapeOf<Self>]>
>
function defProp<Self extends MO.SchemaUPI>(
  schema: Self,
  makeDefault: () => MO.ParsedShapeOf<Self>,
  optionality: Optionality = "constructor"
) {
  return propDef(MO.prop(schema), makeDefault, optionality)
}

export function optProp<Self extends MO.SchemaUPI>(
  schema: Self
): Property<Self, "optional", None, None> {
  return propOpt(MO.prop(schema))
}

export function defaultProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  makeDefault: () => ParsedShape
): MO.Property<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
export function defaultProp<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): FromProperty<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
export function defaultProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): null extends ParsedShape ? FromProperty<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  makeDefault: () => ParsedShape
): MO.Property<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
export function defaultProp<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): FromProperty<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
export function defaultProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): null extends ParsedShape ? FromProperty<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["constructor", () => ParsedShape]>
>
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp(
  schema: MO.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault ? defProp(schema, makeDefault) : MO.prop(schema) >= withDefault
}

export function defaultInputProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  makeDefault: () => ParsedShape
): MO.Property<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
export function defaultInputProp<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): FromProperty<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
export function defaultInputProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): null extends ParsedShape ? FromProperty<
  MO.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  makeDefault: () => ParsedShape
): MO.Property<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
export function defaultInputProp<
  ParsedShape extends SupportedDefaults,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): FromProperty<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
export function defaultInputProp<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): null extends ParsedShape ? FromProperty<
  MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  "required",
  None,
  Some<["both", () => ParsedShape]>
>
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp(
  schema: MO.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault
    ? defProp(schema, makeDefault, "both")
    : MO.prop(schema) >= withInputDefault
}

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
  return {
    compare: (_b: T) => (_a: T) => 0
  }
}
export function makeSet<ParsedShape, ConstructorInput, Encoded, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Order<ParsedShape>,
  eq?: Equivalence<ParsedShape>
) {
  const s = set(type, ord, eq)
  return Object.assign(s, ROSet.make(ord, eq))
}

// export function makeUnorderedContramappedStringSet<
//   ParsedShape,
//   ConstructorInput,
//   Encoded,
//   Api,
//   MA extends string
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
//   contramap: (a: ParsedShape) => MA
// ) {
//   return makeUnorderedSet(type, Eq.contramap(contramap)(Eq.string))
// }

export function makeUnorderedStringSet<A extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<
    unknown, // ParserInput,
    A,
    any, // ConstructorInput,
    any, // Encoded
    any // Api
  >
) {
  return makeUnorderedSet(type, Equivalence.string)
}

export function makeUnorderedSet<ParsedShape, ConstructorInput, Encoded, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  eq: Equivalence<ParsedShape>
) {
  return makeSet(type, createUnorder<ParsedShape>(), eq)
}

// export function makeContramappedSet<ParsedShape, ConstructorInput, Encoded, Api, MA>(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
//   contramap: (a: ParsedShape) => MA,
//   ord: Order<MA>,
//   eq: Equivalence<MA>
// ) {
//   return makeSet(type, LegacyOrder.contramap_(ord, contramap), Eq.contramap(contramap)(eq))
// }

export function makeNonEmptySet<ParsedShape, ConstructorInput, Encoded, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Order<ParsedShape>,
  eq?: Equivalence<ParsedShape>
) {
  const s = nonEmptySet(type, ord, eq)
  return Object.assign(s, NonEmptySet.make(ord, eq))
}

// export function makeUnorderedContramappedStringNonEmptySet<
//   ParsedShape,
//   ConstructorInput,
//   Encoded,
//   Api,
//   MA extends string
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
//   contramap: (a: ParsedShape) => MA
// ) {
//   return makeUnorderedNonEmptySet(type, Eq.contramap(contramap)(Eq.string))
// }

export function makeUnorderedStringNonEmptySet<A extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<
    unknown, // ParserInput,
    A,
    any, // ConstructorInput,
    any, // Encoded
    any // Api
  >
) {
  return makeUnorderedNonEmptySet(type, Equivalence.string)
}

export function makeUnorderedNonEmptySet<ParsedShape, ConstructorInput, Encoded, Api>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  eq: Equivalence<ParsedShape>
) {
  return makeNonEmptySet(type, createUnorder<ParsedShape>(), eq)
}

// export function makeContramappedNonEmptySet<
//   ParsedShape,
//   ConstructorInput,
//   Encoded,
//   Api,
//   MA
// >(
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   type: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
//   contramap: (a: ParsedShape) => MA,
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
  Api: { props: infer Props }
} ? Props extends MO.PropertyRecord ? MO.ParserInputFromProperties<Props>
: never
  : never

/**
 * We know that the Parser will work from `unknown`, but we also want to expose the knowledge that we can parse from a ParserInput of type X
 * as such we can use fromProps, fromProp, fromArray etc, but still embed this Schema into one that parses from unknown.
 */
export type AsUPI<ParsedShape, ConstructorInput, Encoded, Api> = MO.Schema<
  unknown,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>

/**
 * @see AsUPI
 */
export const asUpi = <ParsedShape, ConstructorInput, Encoded, Api>(
  s: MO.Schema<any, ParsedShape, ConstructorInput, Encoded, Api>
) => s as AsUPI<ParsedShape, ConstructorInput, Encoded, Api>
