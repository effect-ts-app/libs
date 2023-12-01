/* eslint-disable @typescript-eslint/no-explicit-any */

import { flow, pipe } from "@effect-app/core/Function"

import * as MO from "./_schema.js"
import { Constructor, Parser, These as Th } from "./_schema.js"

export function include<Fields extends Record<string, MO.AnyProperty>>(fields: Fields) {
  return <NewProps extends Record<string, MO.AnyProperty>>(
    fnc: (fields: Fields) => NewProps
  ) => include_(fields, fnc)
}

export function include_<
  Fields extends Record<string, MO.AnyProperty>,
  NewProps extends Record<string, MO.AnyProperty>
>(fields: Fields, fnc: (fields: Fields) => NewProps) {
  return fnc(fields)
}

export function onParseOrConstruct<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends MO.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>) => onParseOrConstruct_(self, mod)
}

export function onParseOrConstruct_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>,
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
  Errors extends MO.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>) => onParse_(self, mod)
}

export function onParse_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>,
  mod: (i: To) => Th.These<Errors, To>
) {
  return pipe(self, MO.parser(flow(Parser.for(self), Th.chain(mod))))
}

export function onConstruct<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends MO.AnyError
>(mod: (i: To) => Th.These<Errors, To>) {
  return (self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>) => onConstruct_(self, mod)
}

export function onConstruct_<
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>,
  mod: (i: To) => Th.These<Errors, To>
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
    return Th.fail(MO.compositionE(Chunk.fromIterable(errors)))
  }
  return Th.succeed(success())
}

export function domainError(errors: DomainError[]) {
  return MO.compositionE(Chunk.fromIterable([MO.nextE(MO.structE(Chunk.fromIterable(errors)))]))
}

export function domainE(key: string, message: string) {
  // TODO
  return MO.requiredKeyE<string, MO.AnyError>(key, domainEE(message))
}

export function domainEE(message: string) {
  return MO.leafE(MO.parseStringE(message))
}
