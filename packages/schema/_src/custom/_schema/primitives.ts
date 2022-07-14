// tracing: off

import type { Refinement } from "@effect-ts/system/Function"
import type * as fc from "fast-check"

import type { ParserEnv } from "../Parser/index.js"
import type * as Th from "../These/index.js"
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
  SchemaRefinement,
} from "./schema.js"

export function opaque<Shape>() {
  return <ConstructorInput, ParserInput, Encoded, Api>(
    schema: Schema<ParserInput, Shape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, Shape, ConstructorInput, Encoded, Api & ApiSelfType<Shape>> =>
    schema as any
}

export function named<Name extends string>(name: Name) {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaNamed(self, name)
}

export function identity<A>(guard: (_: unknown) => _ is A): Schema<A, A, A, A, {}> {
  return new SchemaIdentity(guard)
}

export function constructor<
  NewConstructorInput,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(f: (_: NewConstructorInput) => Th.These<any, ParsedShape>) {
  return (
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, NewConstructorInput, Encoded, Api> =>
    new SchemaConstructor(self, f)
}

export function constructor_<
  NewConstructorInput,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  f: (_: NewConstructorInput) => Th.These<any, ParsedShape>
): Schema<ParserInput, ParsedShape, NewConstructorInput, Encoded, Api> {
  return new SchemaConstructor(self, f)
}

export function parser<
  NewParserInput,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(f: (_: NewParserInput, env?: ParserEnv) => Th.These<any, ParsedShape>) {
  return (
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<NewParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaParser(self, f)
}

export function parser_<
  NewParserInput,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  f: (_: NewParserInput) => Th.These<any, ParsedShape>
): Schema<NewParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  return new SchemaParser(self, f)
}

export function arbitrary<A extends ParsedShape, ParsedShape>(
  f: (_: typeof fc) => fc.Arbitrary<A>
) {
  return <ParserInput, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaArbitrary(self, f) as any
}

export function arbitrary_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  f: (_: typeof fc) => fc.Arbitrary<ParsedShape>
): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  return new SchemaArbitrary(self, f)
}

export function encoder<ParsedShape, A>(f: (_: ParsedShape) => A) {
  return <ParserInput, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, A, Api> =>
    new SchemaEncoder(self, f)
}

export function encoder_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api, A>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  f: (_: ParsedShape) => A
): Schema<ParserInput, ParsedShape, ConstructorInput, A, Api> {
  return new SchemaEncoder(self, f)
}

export function refine<
  E extends AnyError,
  NewParsedShape extends ParsedShape,
  ParsedShape
>(
  refinement: Refinement<ParsedShape, NewParsedShape>,
  error: (value: ParsedShape) => E
): <ParserInput, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema<ParserInput, NewParsedShape, ConstructorInput, Encoded, Api> {
  return (self) => new SchemaRefinement(self, refinement, error)
}

export function mapParserError<E extends AnyError, E1 extends AnyError>(
  f: (e: E) => E1
) {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaMapParserError(self, f)
}

export function mapConstructorError<E extends AnyError, E1 extends AnyError>(
  f: (e: E) => E1
) {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =>
    new SchemaMapConstructorError(self, f)
}

export function mapApi<E, E1>(f: (e: E) => E1) {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, E>
  ): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, E1> =>
    new SchemaMapApi(self, f)
}

export function identified_<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Meta
>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  identifier: Annotation<Meta>,
  meta: Meta
): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
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

export function guard_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  guard: (u: unknown) => u is ParsedShape
): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  return new SchemaGuard(self, guard)
}

export function guard<ParsedShape>(
  guard: (u: unknown) => u is ParsedShape
): <ParserInput, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  return (self) => new SchemaGuard(self, guard)
}

export function into_<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  ThatParsedShape,
  ThatConstructorInput,
  ThatApi
>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  that: Schema<ParsedShape, ThatParsedShape, ThatConstructorInput, ParsedShape, ThatApi>
): Schema<ParserInput, ThatParsedShape, ThatConstructorInput, Encoded, ThatApi> {
  return new SchemaPipe(self, that)
}

export function into<Api, ThatParsedShape, ThatConstructorInput, ThatApi, ParsedShape>(
  that: Schema<ParsedShape, ThatParsedShape, ThatConstructorInput, ParsedShape, ThatApi>
): <ParserInput, ConstructorInput, Encoded>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema<ParserInput, ThatParsedShape, ThatConstructorInput, Encoded, ThatApi> {
  return (self) => new SchemaPipe(self, that)
}
