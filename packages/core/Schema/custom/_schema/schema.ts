// tracing: off

import type { Refinement } from "@effect-ts/core/Function"
import { LazyGetter } from "@effect-ts/core/Utils"
import type * as fc from "fast-check"

import type * as Th from "../These"
import type { Annotation } from "./annotation"
import type { CompositionE, NamedE, NextE, PrevE, RefinementE } from "./error"

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
export abstract class Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  readonly [SchemaSym]: SchemaSym = SchemaSym
  readonly _ParserInput!: (_: ParserInput) => void
  readonly _ParserError!: () => ParserError
  readonly _ParsedShape!: () => ParsedShape
  readonly _ConstructorInput!: (_: ConstructorInput) => void
  readonly _ConstructorError!: () => ConstructorError
  readonly _Encoded!: () => Encoded
  abstract readonly Api: Api

  readonly [">>>"] = <
    ThatParserError,
    ThatParsedShape,
    ThatConstructorInput,
    ThatConstructorError,
    ThatApi
  >(
    that: Schema<
      ParsedShape,
      ThatParserError,
      ThatParsedShape,
      ThatConstructorInput,
      ThatConstructorError,
      ParsedShape,
      ThatApi
    >
  ): Schema<
    ParserInput,
    CompositionE<PrevE<ParserError> | NextE<ThatParserError>>,
    ThatParsedShape,
    ThatConstructorInput,
    ThatConstructorError,
    Encoded,
    ThatApi
  > => new SchemaPipe(this, that)

  readonly annotate = <Meta>(
    identifier: Annotation<Meta>,
    meta: Meta
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  > => new SchemaAnnotated(this, identifier, meta)
}

export type SchemaAny = Schema<any, any, any, any, any, any, any>
export type SchemaUPI = Schema<unknown, any, any, any, any, any, any>

export type Standard<A, Enc = unknown> = Schema<unknown, any, A, A, any, Enc, {}>

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
    any,
    unknown,
    unknown,
    any,
    unknown,
    unknown
  >
}

export function hasContinuation<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  schema: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): schema is Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> &
  HasContinuation {
  return SchemaContinuationSymbol in schema
}

export type ParserInputOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<infer Y, any, any, any, any, any, any>]
  ? Y
  : never

export type ParserErrorOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<any, any, infer Y, any, any, any, any>]
  ? Y
  : never

export type ConstructorInputOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<any, any, any, infer Y, any, any, any>]
  ? Y
  : never

export type ConstructorErrorOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<any, any, any, any, infer Y, any, any>]
  ? Y
  : never

export type EncodedOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<any, any, any, any, any, infer Y, any>]
  ? Y
  : never

export type ParsedShapeOf<X extends Schema<any, any, any, any, any, any, any>> = [
  X
] extends [Schema<any, any, infer Y, any, any, any, any>]
  ? Y
  : never

export type ApiOf<X extends Schema<any, any, any, any, any, any, any>> = [X] extends [
  Schema<any, any, any, any, any, any, infer Y>
]
  ? Y
  : never

export class SchemaIdentity<A> extends Schema<A, never, A, A, never, A, {}> {
  readonly Api = {}

  constructor(readonly guard: (_: unknown) => _ is A) {
    super()
  }
}

export class SchemaConstructor<
    NewConstructorInput,
    NewConstructorError,
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    NewConstructorInput,
    NewConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny
  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly of: (i: NewConstructorInput) => Th.These<NewConstructorError, ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaParser<
    NewParserInput,
    NewParserError,
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    NewParserInput,
    NewParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly parser: (i: NewParserInput) => Th.These<NewParserError, ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaArbitrary<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly arbitrary: (_: typeof fc) => fc.Arbitrary<ParsedShape>
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaEncoder<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api,
    Encoded2
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded2,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly encoder: (_: ParsedShape) => Encoded2
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export class SchemaRefinement<
  E,
  NewParsedShape extends ParsedShape,
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> extends Schema<
  ParserInput,
  CompositionE<PrevE<ParserError> | NextE<RefinementE<E>>>,
  NewParsedShape,
  ConstructorInput,
  CompositionE<PrevE<ConstructorError> | NextE<RefinementE<E>>>,
  Encoded,
  Api
> {
  get Api() {
    return this.self.Api
  }

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly refinement: Refinement<ParsedShape, NewParsedShape>,
    readonly error: (value: ParsedShape) => E
  ) {
    super()
  }
}

export class SchemaPipe<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api,
    ThatParserError,
    ThatParsedShape,
    ThatConstructorInput,
    ThatConstructorError,
    ThatApi
  >
  extends Schema<
    ParserInput,
    CompositionE<PrevE<ParserError> | NextE<ThatParserError>>,
    ThatParsedShape,
    ThatConstructorInput,
    ThatConstructorError,
    Encoded,
    ThatApi
  >
  implements HasContinuation
{
  get Api() {
    return this.that.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.that

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly that: Schema<
      ParsedShape,
      ThatParserError,
      ThatParsedShape,
      ThatConstructorInput,
      ThatConstructorError,
      ParsedShape,
      ThatApi
    >
  ) {
    super()
  }
}

export class SchemaMapParserError<
    ParserInput,
    ParserError,
    ParserError2,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError2,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly mapError: (_: ParserError) => ParserError2
  ) {
    super()
  }
}

export class SchemaMapConstructorError<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    ConstructorError2,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError2,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly mapError: (_: ConstructorError) => ConstructorError2
  ) {
    super()
  }
}

export class SchemaMapApi<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api,
    Api2
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api2
  >
  implements HasContinuation
{
  @LazyGetter()
  get Api() {
    return this.mapApi(this.self.Api)
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly mapApi: (_: Api) => Api2
  ) {
    super()
  }
}

export class SchemaNamed<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api,
    Name extends string
  >
  extends Schema<
    ParserInput,
    NamedE<Name, ParserError>,
    ParsedShape,
    ConstructorInput,
    NamedE<Name, ConstructorError>,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
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
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api,
    Meta
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [Identifiable] = Identifiable;

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly annotation: Annotation<Meta>,
    readonly meta: Meta
  ) {
    super()
  }
}

export class SchemaGuard<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  get Api() {
    return this.self.Api
  }

  readonly [SchemaContinuationSymbol]: SchemaAny = this.self

  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly guard: (u: unknown) => u is ParsedShape
  ) {
    super()
  }
}

export class SchemaLazy<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    {}
  >
  implements HasContinuation
{
  readonly Api = {}

  get [SchemaContinuationSymbol](): SchemaAny {
    return this.lazy
  }

  @LazyGetter()
  get lazy(): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  > {
    return this.self()
  }

  constructor(
    readonly self: () => Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) {
    super()
  }
}
