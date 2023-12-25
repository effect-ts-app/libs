/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import type { Refinement } from "@effect-app/core/Function"
import { LazyGetter } from "@effect-app/core/utils"
import type * as fc from "fast-check"

import type { Parser, ParserEnv } from "../Parser.js"
import type * as Th from "../These.js"
import type { Annotation } from "./annotation.js"
import type { AnyError } from "./error.js" // CompositionE, NamedE, NextE, PrevE, RefinementE

export const SchemaSym = Symbol()
export type SchemaSym = typeof SchemaSym

/**
 * A `Schema` is a functional representation of a data model of type `To`
 * that can be:
 *
 * 1) parsed from a `To` starting from an input of type `ParserInput`
 *    maybe failing for a reason `ParserError`
 *
 * 2) constructed smartly starting from an input of type `ConstructorInput`
 *
 * 3) encoded into an `From` value
 *
 * 4) interacted with via `Api`
 */
/**
 * @tsplus type ets/Schema/Schema
 * @tsplus companion ets/Schema/SchemaOps
 */
export abstract class Schema<ParserInput, To, ConstructorInput, From, Api> {
  readonly [SchemaSym]: SchemaSym = SchemaSym
  readonly _ParserInput!: (_: ParserInput, env?: ParserEnv) => void
  readonly _ParserError!: () => any
  readonly _To!: () => To
  readonly _ConstructorInput!: (_: ConstructorInput) => void
  readonly _ConstructorError!: () => any
  readonly _From!: () => From
  abstract readonly Api: Api

  readonly [">>>"] = <ThatTo, ThatConstructorInput, ThatApi>(
    that: Schema<
      To,
      ThatTo,
      ThatConstructorInput,
      To,
      ThatApi
    >
  ): Schema<ParserInput, ThatTo, ThatConstructorInput, From, ThatApi> => new SchemaPipe(this, that)

  readonly annotate = <Meta>(
    identifier: Annotation<Meta>,
    meta: Meta
  ): Schema<ParserInput, To, ConstructorInput, From, Api> => new SchemaAnnotated(this, identifier, meta)
}

export type SchemaAny = Schema<any, any, any, any, any>
export type SchemaUPI = Schema<unknown, any, any, any, any>

export type Standard<A, Enc = unknown> = Schema<unknown, A, A, Enc, {}>

export interface ApiSelfType<AS = unknown> {
  _AS: AS
}

export type GetApiSelfType<T extends ApiSelfType<unknown>, D> = unknown extends T["_AS"] ? D
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
  To,
  ConstructorInput,
  From,
  Api
>(
  schema: Schema<ParserInput, To, ConstructorInput, From, Api>
): schema is
  & Schema<ParserInput, To, ConstructorInput, From, Api>
  & HasContinuation
{
  return SchemaContinuationSymbol in schema
}

export type ParserInputOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<infer Y, any, any, any, any>
] ? Y
  : never

export type ParserErrorOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, any, any>
] ? any /*Y extends AnyError
    ? Y
    : never*/
  : never

export type ConstructorInputOf<X extends Schema<any, any, any, any, any>> = [
  X
] extends [Schema<any, any, infer Y, any, any>] ? Y
  : never

export type ConstructorErrorOf<X extends Schema<any, any, any, any, any>> = [
  X
] extends [Schema<any, any, any, any, any>] ? any /*Y extends AnyError
    ? Y
    : never
    */
  : never

export type From<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, infer Y, any>
] ? Y
  : never

// export type To<X extends Schema<any, any, any, any, any>> = [X] extends [
//   Schema<any, infer Y, any, any, any>
// ] ? Y
//   : never

export type To<X extends Schema<any, any, any, any, any>> = ReturnType<
  X["_To"]
>

export type ApiOf<X extends Schema<any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, any, infer Y>
] ? Y
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
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<ParserInput, To, NewConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny
  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly of: (i: NewConstructorInput) => Th.These<any, To>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaParser<
  NewParserInput,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<NewParserInput, To, ConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly parser: Parser<NewParserInput, any, To>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaArbitrary<ParserInput, To, ConstructorInput, From, Api>
  extends Schema<ParserInput, To, ConstructorInput, From, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly arbitrary: (_: typeof fc) => fc.Arbitrary<To>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaEncoder<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  From2
> extends Schema<ParserInput, To, ConstructorInput, From2, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly encoder: (_: To) => From2
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaRefinement<
  E extends AnyError,
  NewTo extends To,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<ParserInput, NewTo, ConstructorInput, From, Api> {
  get Api() {
    return this.self.Api
  }

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly refinement: Refinement<To, NewTo>,
    readonly error: (value: To) => E
  ) {
    super()
  }
}

export class SchemaPipe<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  ThatTo,
  ThatConstructorInput,
  ThatApi
> extends Schema<ParserInput, ThatTo, ThatConstructorInput, From, ThatApi> implements HasContinuation {
  get Api() {
    return this.that.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.that

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly that: Schema<
      To,
      ThatTo,
      ThatConstructorInput,
      To,
      ThatApi
    >
  ) {
    super()
  }
}

export class SchemaMapParserError<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<ParserInput, To, ConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly mapError: (_: any) => any
  ) {
    super()
  }
}

export class SchemaMapConstructorError<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
> extends Schema<ParserInput, To, ConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly mapError: (_: any) => any
  ) {
    super()
  }
}

export class SchemaMapApi<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Api2
> extends Schema<ParserInput, To, ConstructorInput, From, Api2> implements HasContinuation {
  @LazyGetter()
  get Api() {
    return this.mapApi(this.self.Api)
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly mapApi: (_: Api) => Api2
  ) {
    super()
  }
}

export class SchemaNamed<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Name extends string
> extends Schema<ParserInput, To, ConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
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
    (typeof self === "object" || typeof self === "function")
    && self != null
    && Identifiable in self
    && self["annotation"] === annotation
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
    (typeof self === "object" || typeof self === "function")
    && self != null
    && Identifiable in self
  )
}

export class SchemaAnnotated<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Meta
> extends Schema<ParserInput, To, ConstructorInput, From, Api> implements HasContinuation {
  get Api() {
    return this.self.Api
  }

  readonly [Identifiable] = Identifiable

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly annotation: Annotation<Meta>,
    readonly meta: Meta
  ) {
    super()
  }
}

export class SchemaGuard<ParserInput, To, ConstructorInput, From, Api>
  extends Schema<ParserInput, To, ConstructorInput, From, Api>
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<ParserInput, To, ConstructorInput, From, Api>,
    readonly guard: (u: unknown) => u is To
  ) {
    super()
  }
}

export class SchemaLazy<ParserInput, To, ConstructorInput, From, Api>
  extends Schema<ParserInput, To, ConstructorInput, From, {}>
  implements HasContinuation
{
  readonly Api = {}

  get [SchemaContinuationSymbol](): SchemaAny {
    return this.lazy
  }

  @LazyGetter()
  get lazy(): Schema<ParserInput, To, ConstructorInput, From, Api> {
    return this.self()
  }

  constructor(
    readonly self: () => Schema<
      ParserInput,
      To,
      ConstructorInput,
      From,
      Api
    >
  ) {
    super()
  }
}
