/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import type * as fc from "fast-check"

import type { ParserEnv } from "../Parser.js"
import type * as Th from "../These.js"
import type { Annotation } from "./annotation.js"
import type { AnyError } from "./error.js"
import type { ApiSelfType, Schema, SchemaAny } from "./schema.js"
import {
  SchemaAnnotated,
  SchemaArbitrary,
  SchemaConstructor,
  SchemaEncoder,
  SchemaGuard,
  SchemaIdentity,
  SchemaMapApi,
  SchemaMapConstructorError,
  SchemaMapParserError,
  SchemaNamed,
  SchemaParser,
  SchemaPipe,
  SchemaRefinement
} from "./schema.js"

export function opaque<Shape>() {
  return <ConstructorInput, ParserInput, From, Api>(
    schema: Schema<ParserInput, Shape, ConstructorInput, From, Api>
  ): Schema<ParserInput, Shape, ConstructorInput, From, Api & ApiSelfType<Shape>> => schema as any
}

export function named<Name extends string>(name: Name) {
  return <ParserInput, To, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, ConstructorInput, From, Api> => new SchemaNamed(self, name)
}

export function identity<A>(guard: (_: unknown) => _ is A): Schema<A, A, A, A, {}> {
  return new SchemaIdentity(guard)
}

export function constructor<
  NewConstructorInput,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(f: (_: NewConstructorInput) => Th.These<any, To>) {
  return (
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, NewConstructorInput, From, Api> => new SchemaConstructor(self, f)
}

export function constructor_<
  NewConstructorInput,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  f: (_: NewConstructorInput) => Th.These<any, To>
): Schema<ParserInput, To, NewConstructorInput, From, Api> {
  return new SchemaConstructor(self, f)
}

export function parser<
  NewParserInput,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(f: (_: NewParserInput, env?: ParserEnv) => Th.These<any, To>) {
  return (
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<NewParserInput, To, ConstructorInput, From, Api> => new SchemaParser(self, f)
}

export function parser_<
  NewParserInput,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  f: (_: NewParserInput) => Th.These<any, To>
): Schema<NewParserInput, To, ConstructorInput, From, Api> {
  return new SchemaParser(self, f)
}

export function arbitrary<A extends To, To>(
  f: (_: typeof fc) => fc.Arbitrary<A>
) {
  return <ParserInput, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, ConstructorInput, From, Api> => new SchemaArbitrary(self, f) as any
}

export function arbitrary_<ParserInput, To, ConstructorInput, From, Api>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  f: (_: typeof fc) => fc.Arbitrary<To>
): Schema<ParserInput, To, ConstructorInput, From, Api> {
  return new SchemaArbitrary(self, f)
}

export function encoder<To, A>(f: (_: To) => A) {
  return <ParserInput, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, ConstructorInput, A, Api> => new SchemaEncoder(self, f)
}

export function encoder_<ParserInput, To, ConstructorInput, From, Api, A>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  f: (_: To) => A
): Schema<ParserInput, To, ConstructorInput, A, Api> {
  return new SchemaEncoder(self, f)
}

export function refine<
  E extends AnyError,
  NewParsedShape extends To,
  To
>(
  refinement: Refinement<To, NewParsedShape>,
  error: (value: To) => E
): <ParserInput, ConstructorInput, From, Api>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>
) => Schema<ParserInput, NewParsedShape, ConstructorInput, From, Api> {
  return (self) => new SchemaRefinement(self, refinement, error)
}

export function mapParserError<E extends AnyError, E1 extends AnyError>(
  f: (e: E) => E1
) {
  return <ParserInput, To, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, ConstructorInput, From, Api> => new SchemaMapParserError(self, f)
}

export function mapConstructorError<E extends AnyError, E1 extends AnyError>(
  f: (e: E) => E1
) {
  return <ParserInput, To, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): Schema<ParserInput, To, ConstructorInput, From, Api> => new SchemaMapConstructorError(self, f)
}

export function mapApi<E, E1>(f: (e: E) => E1) {
  return <ParserInput, To, ConstructorInput, From>(
    self: Schema<ParserInput, To, ConstructorInput, From, E>
  ): Schema<ParserInput, To, ConstructorInput, From, E1> => new SchemaMapApi(self, f)
}

export function identified_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Meta
>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  identifier: Annotation<Meta>,
  meta: Meta
): Schema<ParserInput, To, ConstructorInput, From, Api> {
  return new SchemaAnnotated(self, identifier, meta)
}

export function annotate<Meta>(
  annotation: Annotation<Meta>,
  meta: Meta
): <
  Self extends SchemaAny & {
    readonly annotate: <Meta>(annotation: Annotation<Meta>, meta: Meta) => SchemaAny
  }
>(
  self: Self
) => ReturnType<Self["annotate"]> {
  // @ts-expect-error
  return (self) => self.annotate(annotation, meta)
}

export function guard_<ParserInput, To, ConstructorInput, From, Api>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  guard: (u: unknown) => u is To
): Schema<ParserInput, To, ConstructorInput, From, Api> {
  return new SchemaGuard(self, guard)
}

export function guard<To>(
  guard: (u: unknown) => u is To
): <ParserInput, ConstructorInput, From, Api>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>
) => Schema<ParserInput, To, ConstructorInput, From, Api> {
  return (self) => new SchemaGuard(self, guard)
}

export function into_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  ThatParsedShape,
  ThatConstructorInput,
  ThatApi
>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>,
  that: Schema<To, ThatParsedShape, ThatConstructorInput, To, ThatApi>
): Schema<ParserInput, ThatParsedShape, ThatConstructorInput, From, ThatApi> {
  return new SchemaPipe(self, that)
}

export function into<Api, ThatParsedShape, ThatConstructorInput, ThatApi, To>(
  that: Schema<To, ThatParsedShape, ThatConstructorInput, To, ThatApi>
): <ParserInput, ConstructorInput, From>(
  self: Schema<ParserInput, To, ConstructorInput, From, Api>
) => Schema<ParserInput, ThatParsedShape, ThatConstructorInput, From, ThatApi> {
  return (self) => new SchemaPipe(self, that)
}
