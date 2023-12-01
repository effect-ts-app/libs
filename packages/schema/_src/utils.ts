/* eslint-disable @typescript-eslint/no-explicit-any */

import { flow, pipe } from "@effect-app/core/Function"

import * as S from "./_schema.js"
import { Constructor, Parser, These as Th } from "./_schema.js"

export function include<Fields extends Record<string, S.AnyField>>(fields: Fields) {
  return <NewProps extends Record<string, S.AnyField>>(
    fnc: (fields: Fields) => NewProps
  ) => include_(fields, fnc)
}

export function include_<
  Fields extends Record<string, S.AnyField>,
  NewProps extends Record<string, S.AnyField>
>(fields: Fields, fnc: (fields: Fields) => NewProps) {
  return fnc(fields)
}

export function onParseOrConstruct<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: S.Schema<ParserInput, To, ConstructorInput, From, Api>) => onParseOrConstruct_(self, mod)
}

export function onParseOrConstruct_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>,
  mod: (i: To) => Th.These<Errors, To>
) {
  return pipe(self, onParse(mod), onConstruct(mod))
}

export function onParse<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: S.Schema<ParserInput, To, ConstructorInput, From, Api>) => onParse_(self, mod)
}

export function onParse_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>,
  mod: (i: To) => Th.These<Errors, To>
) {
  return pipe(self, S.parser(flow(Parser.for(self), Th.chain(mod))))
}

export function onConstruct<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: S.Schema<ParserInput, To, ConstructorInput, From, Api>) => onConstruct_(self, mod)
}

export function onConstruct_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends S.AnyError
>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>,
  mod: (i: To) => Th.These<Errors, To>
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
    return Th.fail(S.compositionE(Chunk.fromIterable(errors)))
  }
  return Th.succeed(success())
}

export function domainError(errors: DomainError[]) {
  return S.compositionE(Chunk.fromIterable([S.nextE(S.structE(Chunk.fromIterable(errors)))]))
}

export function domainE(key: string, message: string) {
  // TODO
  return S.requiredKeyE<string, S.AnyError>(key, domainEE(message))
}

export function domainEE(message: string) {
  return S.leafE(S.parseStringE(message))
}
