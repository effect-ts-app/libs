/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { flow, pipe } from "../Function"
import * as S from "./_schema"
import { Constructor, Parser, These as Th } from "./_schema"

export function onParseOrConstruct<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: S.Schema<
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
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<
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
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: S.Schema<
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
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<
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
  return pipe(self, S.parser(flow(Parser.for(self), Th.chain(mod))))
}

export function onConstruct<
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (
    self: S.Schema<
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
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<
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
  return pipe(self, S.constructor(flow(Constructor.for(self), Th.chain(mod))))
}
export type DomainError = S.RequiredKeyE<any, any>
export function domainResponse<A>(errors: DomainError[], success: () => A) {
  if (errors.length) {
    return Th.fail(domainError(errors))
  }
  return Th.succeed(success())
}

export function domainResponse2<A>(errors: S.AnyError[], success: () => A) {
  if (errors.length) {
    return Th.fail(S.compositionE(CNK.from(errors)))
  }
  return Th.succeed(success())
}

export function domainError(errors: DomainError[]) {
  return S.compositionE(CNK.from([S.nextE(S.structE(CNK.from(errors)))]))
}

export function domainE(key: string, message: string) {
  // TODO
  return S.requiredKeyE<string, S.AnyError>(key, domainEE(message))
}

export function domainEE(message: string) {
  return S.leafE(S.parseStringE(message))
}
