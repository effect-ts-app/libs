/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import type { Refinement } from "@effect-ts/core/Function"
import { LazyGetter } from "@effect-ts/core/Utils"
import type * as fc from "fast-check"

import type { Parser, ParserEnv } from "../Parser/index.js"
import type * as Th from "../These/index.js"
import type { Annotation } from "./annotation.js"
import type { AnyError } from "./error.js" // CompositionE, NamedE, NextE, PrevE, RefinementE

export const SchemaSym = Symbol()
export type SchemaSym = typeof SchemaSym

/**
 * A `Schema` is a functional representation of a data model of type `ParsedShape`
 * that can be:
 *
 * 1) parsed from a `ParsedShape` starting from an input of type `ParserInput`
 *    maybe failing for a reason `ParserError`
 *
 * 2) constructed smartly starting from an input of type `ConstructorInput`
 *
 * 3) encoded into an `Encoded` value
 *
 * 4) interacted with via `Api`
 */
/**
 * @tsplus type ets/Schema/Schema
 * @tsplus companion ets/Schema/SchemaOps
 */
export abstract class Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  readonly [SchemaSym]: SchemaSym = SchemaSym
  readonly _ParserInput!: (_: ParserInput, env?: ParserEnv) => void
  readonly _ParserError!: () => any
  readonly _ParsedShape!: () => ParsedShape
  readonly _ConstructorInput!: (_: ConstructorInput) => void
  readonly _ConstructorError!: () => any
  readonly _Encoded!: () => Encoded
  abstract readonly Api: Api

  readonly [">>>"] = <ThatParsedShape, ThatConstructorInput, ThatApi>(
    that: Schema<
      ParsedShape,
      ThatParsedShape,
      ThatConstructorInput,
      ParsedShape,
      ThatApi
    >
  ): Schema<ParserInput, ThatParsedShape, ThatConstructorInput, Encoded, ThatApi> =>
    new SchemaPipe(this, that)

  readonly annotate = <Meta>(
    identifier: Annotation<Meta>,
    meta: Meta
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaAnnotated(this, identifier, meta)
}

export type SchemaAny = Schema<any, any, any, any, any>
export type SchemaUPI = Schema<unknown, any, any, any, any>

export type Standard<A, Enc = unknown> = Schema<unknown, A, A, Enc, {}>

export interface ApiSelfType<AS = unknown> {
  _AS: AS
}

export type GetApiSelfType<T extends ApiSelfType<unknown>, D> = unknown extends T["_AS"]
  ? D
  : T["_AS"]

export const SchemaContinuationSymbol = Symbol()
export type SchemaContinuationSymbol = typeof SchemaContinuationSymbol

export interface HasContinuation {
  readonly [SchemaContinuationSymbol]: Schema<
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >
}

export function hasContinuation<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): schema is Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> &
  HasContinuation {
  return SchemaContinuationSymbol in schema
}

export type ParserInputOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<infer Y, any, any, any, any>
]
  ? Y
  : never

export type ParserErrorOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, any, any>
]
  ? any /*Y extends AnyError
    ? Y
    : never*/
  : never

export type ConstructorInputOf<X extends Schema<any, any, any, any, any>> = [
  X
] extends [Schema<any, any, infer Y, any, any>]
  ? Y
  : never

export type ConstructorErrorOf<X extends Schema<any, any, any, any, any>> = [
  X
] extends [Schema<any, any, any, any, any>]
  ? any /*Y extends AnyError
    ? Y
    : never
    */
  : never

export type EncodedOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, infer Y, any>
]
  ? Y
  : never

export type ParsedShapeOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, infer Y, any, any, any>
]
  ? Y
  : never

export type ApiOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, any, infer Y>
]
  ? Y
  : never

export class SchemaIdentity<A> extends Schema<A, A, A, A, {}> {
  readonly Api = {}

  constructor(readonly guard: (_: unknown) => _ is A) {
    super()
  }
}

export class SchemaConstructor<
    NewConstructorInput,
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api
  >
  extends Schema<ParserInput, ParsedShape, NewConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny
  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly of: (i: NewConstructorInput) => Th.These<any, ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaParser<
    NewParserInput,
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api
  >
  extends Schema<NewParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly parser: Parser<NewParserInput, any, ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaArbitrary<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly arbitrary: (_: typeof fc) => fc.Arbitrary<ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaEncoder<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api,
    Encoded2
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded2, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly encoder: (_: ParsedShape) => Encoded2
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaRefinement<
  E extends AnyError,
  NewParsedShape extends ParsedShape,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
> extends Schema<ParserInput, NewParsedShape, ConstructorInput, Encoded, Api> {
  get Api() {
    return this.self.Api
  }

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly refinement: Refinement<ParsedShape, NewParsedShape>,
    readonly error: (value: ParsedShape) => E
  ) {
    super()
  }
}

export class SchemaPipe<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api,
    ThatParsedShape,
    ThatConstructorInput,
    ThatApi
  >
  extends Schema<ParserInput, ThatParsedShape, ThatConstructorInput, Encoded, ThatApi>
  implements HasContinuation
{
  get Api() {
    return this.that.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.that

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly that: Schema<
      ParsedShape,
      ThatParsedShape,
      ThatConstructorInput,
      ParsedShape,
      ThatApi
    >
  ) {
    super()
  }
}

export class SchemaMapParserError<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly mapError: (_: any) => any
  ) {
    super()
  }
}

export class SchemaMapConstructorError<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly mapError: (_: any) => any
  ) {
    super()
  }
}

export class SchemaMapApi<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api,
    Api2
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api2>
  implements HasContinuation
{
  @LazyGetter()
  get Api() {
    return this.mapApi(this.self.Api)
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly mapApi: (_: Api) => Api2
  ) {
    super()
  }
}

export class SchemaNamed<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api,
    Name extends string
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly name: Name
  ) {
    super()
  }
}

export const Identifiable = Symbol()

export function isAnnotated<Self extends SchemaAny, A>(
  self: Self,
  annotation: Annotation<A>
): self is Self & {
  readonly self: Self extends { self: infer X } ? X : SchemaAny
  readonly annotation: Annotation<A>
  readonly meta: A
} {
  return (
    (typeof self === "object" || typeof self === "function") &&
    self != null &&
    Identifiable in self &&
    self["annotation"] === annotation
  )
}

export function isAnnotatedSchema<Self extends SchemaAny>(
  self: Self
): self is Self & {
  readonly self: Self extends { self: infer X } ? X : SchemaAny
  readonly annotation: Annotation<any>
  readonly meta: any
} {
  return (
    (typeof self === "object" || typeof self === "function") &&
    self != null &&
    Identifiable in self
  )
}

export class SchemaAnnotated<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api,
    Meta
  >
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [Identifiable] = Identifiable;

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly annotation: Annotation<Meta>,
    readonly meta: Meta
  ) {
    super()
  }
}

export class SchemaGuard<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly guard: (u: unknown) => u is ParsedShape
  ) {
    super()
  }
}

export class SchemaLazy<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, {}>
  implements HasContinuation
{
  readonly Api = {}

  get [SchemaContinuationSymbol](): SchemaAny {
    return this.lazy
  }

  @LazyGetter()
  get lazy(): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
    return this.self()
  }

  constructor(
    readonly self: () => Schema<
      ParserInput,
      ParsedShape,
      ConstructorInput,
      Encoded,
      Api
    >
  ) {
    super()
  }
}
