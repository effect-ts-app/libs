/* eslint-disable @typescript-eslint/no-explicit-any */

import { flow, pipe } from "@effect-ts-app/core/Function"

import * as MO from "./_schema.js"
import { Constructor, Parser, These as Th } from "./_schema.js"

export function include<Props extends Record<string, MO.AnyProperty>>(props: Props) {
  return <NewProps extends Record<string, MO.AnyProperty>>(
    fnc: (props: Props) => NewProps
  ) => include_(props, fnc)
}

export function include_<
  Props extends Record<string, MO.AnyProperty>,
  NewProps extends Record<string, MO.AnyProperty>
>(props: Props, fnc: (props: Props) => NewProps) {
  return fnc(props)
}

export function onParseOrConstruct<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>) =>
    onParseOrConstruct_(self, mod)
}

export function onParseOrConstruct_<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>
) {
  return pipe(self, onParse(mod), onConstruct(mod))
}

export function onParse<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>) =>
    onParse_(self, mod)
}

export function onParse_<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>
) {
  return pipe(self, MO.parser(flow(Parser.for(self), Th.chain(mod))))
}

export function onConstruct<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(mod: (i: ParsedShape) => Th.These<Errors, ParsedShape>) {
  return (self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>) =>
    onConstruct_(self, mod)
}

export function onConstruct_<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api,
  Errors extends MO.AnyError
>(
  self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
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
    return Th.fail(MO.compositionE(Chunk.from(errors)))
  }
  return Th.succeed(success())
}

export function domainError(errors: DomainError[]) {
  return MO.compositionE(Chunk.from([MO.nextE(MO.structE(Chunk.from(errors)))]))
}

export function domainE(key: string, message: string) {
  // TODO
  return MO.requiredKeyE<string, MO.AnyError>(key, domainEE(message))
}

export function domainEE(message: string) {
  return MO.leafE(MO.parseStringE(message))
}
