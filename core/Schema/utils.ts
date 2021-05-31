/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { flow, pipe } from "../Function"
import * as MO from "./_schema"
import { Constructor, Parser, These as Th } from "./_schema"

export function onParseOrConstruct<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: MO.Schema<
      unknown,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) => onParseOrConstruct_(self, mod)
}

export function onParseOrConstruct_<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>
) {
  return pipe(self, onParse(mod), onConstruct(mod))
}

export function onParse<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: MO.Schema<
      unknown,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) => onParse_(self, mod)
}

export function onParse_<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>
) {
  return pipe(self, MO.parser(flow(Parser.for(self), Th.chain(mod))))
}

export function onConstruct<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: MO.Schema<
      unknown,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) => onConstruct_(self, mod)
}

export function onConstruct_<
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>
) {
  return pipe(self, MO.constructor(flow(Constructor.for(self), Th.chain(mod))))
}
export type DomainError = MO.RequiredKeyE<any, any>
export function domainResponse<A>(errors: DomainError[], success: () => A) {
  if (errors.length) {
    return Th.fail(domainError(errors))
  }
  return Th.succeed(success())
}

export function domainResponse2<A>(errors: MO.AnyError[], success: () => A) {
  if (errors.length) {
    return Th.fail(MO.compositionE(CNK.from(errors)))
  }
  return Th.succeed(success())
}

export function domainError(errors: DomainError[]) {
  return MO.compositionE(CNK.from([MO.nextE(MO.structE(CNK.from(errors)))]))
}

export function domainE(key: string, message: string) {
  // TODO
  return MO.requiredKeyE<string, MO.AnyError>(key, domainEE(message))
}

export function domainEE(message: string) {
  return MO.leafE(MO.parseStringE(message))
}
