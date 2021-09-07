import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import * as MO from "../_schema"

export const empty = CNK.empty<never>()
export function tree<A>(value: A, forest: MO.Forest<A> = empty): MO.Tree<A> {
  return {
    value,
    forest,
  }
}

export function makeUtils<B, C, D, E>(self: MO.Schema<unknown, B, C, D, E>) {
  return {
    parse: EParserFor(self),
    unsafe: EParserFor(self)["|>"](MO.unsafe),
  }
}

export function extendWithUtils<B, C, D, E>(self: MO.Schema<unknown, B, C, D, E>) {
  return Object.assign(self, makeUtils(self))
}

export type EParserFor<Self extends MO.SchemaAny> = MO.Parser.Parser<
  MO.EncodedOf<Self>,
  MO.ParserErrorOf<Self>,
  MO.ParsedShapeOf<Self>
>

export function EParserFor<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): MO.Parser.Parser<Encoded, any, ParsedShape> {
  return MO.Parser.for(schema)
}

export type EncSchemaForModel<M, Self extends MO.SchemaAny, MEnc> = MO.Schema<
  MO.ParserInputOf<Self>,
  M,
  MO.ConstructorInputOf<Self>,
  MEnc,
  MO.ApiOf<Self> & MO.ApiSelfType<M>
>
