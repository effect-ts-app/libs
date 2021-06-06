// tracing: off

import type { Refinement } from "@effect-ts/system/Function"
import type * as fc from "fast-check"

import type * as Th from "../These"
import type { Annotation } from "./annotation"
import type { CompositionE, NamedE, NextE, PrevE, RefinementE } from "./error"
import type { ApiSelfType, Schema, SchemaAny } from "./schema"
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
} from "./schema"

export function opaque<Shape>() {
  return <ConstructorInput, ConstructorError, ParserInput, ParserError, Encoded, Api>(
    schema: Schema<
      ParserInput,
      ParserError,
      Shape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    Shape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api & ApiSelfType<Shape>
  > => schema as any
}

export function named<Name extends string>(name: Name) {
  return <
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    NamedE<Name, ParserError>,
    ParsedShape,
    ConstructorInput,
    NamedE<Name, ConstructorError>,
    Encoded,
    Api
  > => new SchemaNamed(self, name)
}

export function identity<A>(
  guard: (_: unknown) => _ is A
): Schema<A, never, A, A, never, A, {}> {
  return new SchemaIdentity(guard)
}

export function constructor<
  NewConstructorInput,
  NewConstructorError,
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(f: (_: NewConstructorInput) => Th.These<NewConstructorError, ParsedShape>) {
  return (
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    NewConstructorInput,
    NewConstructorError,
    Encoded,
    Api
  > => new SchemaConstructor(self, f)
}

export function constructor_<
  NewConstructorInput,
  NewConstructorError,
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  f: (_: NewConstructorInput) => Th.These<NewConstructorError, ParsedShape>
): Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  NewConstructorInput,
  NewConstructorError,
  Encoded,
  Api
> {
  return new SchemaConstructor(self, f)
}

export function parser<
  NewParserInput,
  NewParserError,
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(f: (_: NewParserInput) => Th.These<NewParserError, ParsedShape>) {
  return (
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    NewParserInput,
    NewParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  > => new SchemaParser(self, f)
}

export function parser_<
  NewParserInput,
  NewParserError,
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  f: (_: NewParserInput) => Th.These<NewParserError, ParsedShape>
): Schema<
  NewParserInput,
  NewParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  return new SchemaParser(self, f)
}

export function arbitrary<A extends ParsedShape, ParsedShape>(
  f: (_: typeof fc) => fc.Arbitrary<A>
) {
  return <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded, Api>(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  > => new SchemaArbitrary(self, f) as any
}

export function arbitrary_<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  f: (_: typeof fc) => fc.Arbitrary<ParsedShape>
): Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  return new SchemaArbitrary(self, f)
}

export function encoder<ParsedShape, A>(f: (_: ParsedShape) => A) {
  return <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded, Api>(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    A,
    Api
  > => new SchemaEncoder(self, f)
}

export function encoder_<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api,
  A
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  f: (_: ParsedShape) => A
): Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  A,
  Api
> {
  return new SchemaEncoder(self, f)
}

export function refine<E, NewParsedShape extends ParsedShape, ParsedShape>(
  refinement: Refinement<ParsedShape, NewParsedShape>,
  error: (value: ParsedShape) => E
): <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded, Api>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) => Schema<
  ParserInput,
  CompositionE<PrevE<ParserError> | NextE<RefinementE<E>>>,
  NewParsedShape,
  ConstructorInput,
  CompositionE<PrevE<ConstructorError> | NextE<RefinementE<E>>>,
  Encoded,
  Api
> {
  return (self) => new SchemaRefinement(self, refinement, error)
}

export function mapParserError<E, E1>(f: (e: E) => E1) {
  return <ParserInput, ParsedShape, ConstructorInput, ConstructorError, Encoded, Api>(
    self: Schema<
      ParserInput,
      E,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    E1,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  > => new SchemaMapParserError(self, f)
}

export function mapConstructorError<E, E1>(f: (e: E) => E1) {
  return <ParserInput, ParserError, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      E,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    E1,
    Encoded,
    Api
  > => new SchemaMapConstructorError(self, f)
}

export function mapApi<E, E1>(f: (e: E) => E1) {
  return <
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded
  >(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      E
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    E1
  > => new SchemaMapApi(self, f)
}

export function identified_<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api,
  Meta
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
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
> {
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

export function guard_<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  guard: (u: unknown) => u is ParsedShape
): Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  return new SchemaGuard(self, guard)
}

export function guard<ParsedShape>(
  guard: (u: unknown) => u is ParsedShape
): <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded, Api>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) => Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  return (self) => new SchemaGuard(self, guard)
}

export function into_<
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
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
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
> {
  return new SchemaPipe(self, that)
}

export function into<
  Api,
  ThatParserError,
  ThatParsedShape,
  ThatConstructorInput,
  ThatConstructorError,
  ThatApi,
  ParsedShape
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
): <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) => Schema<
  ParserInput,
  CompositionE<PrevE<ParserError> | NextE<ThatParserError>>,
  ThatParsedShape,
  ThatConstructorInput,
  ThatConstructorError,
  Encoded,
  ThatApi
> {
  return (self) => new SchemaPipe(self, that)
}
