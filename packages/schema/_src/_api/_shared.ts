//

import * as MO from "../_schema.js"

// export const empty = Chunk.empty<never>()
// export function tree<A>(value: A, forest: MO.Forest<A> = empty): MO.Tree<A> {
//   return {
//     value,
//     forest,
//   }
// }

export function makeUtils<Schema extends MO.SchemaUPI>(self: Schema): Utils<Schema> {
  return {
    parse: EParserFor(self),
    unsafe: EParserFor(self) >= MO.unsafe,
  }
}

export type Utils<Schema extends MO.SchemaUPI> = {
  parse: EParserFor<Schema>
  unsafe: UnsafeEParserFor<Schema>
}

export function extendWithUtils<Schema extends MO.SchemaUPI>(self: Schema) {
  return Object.assign(self, makeUtils(self))
}

export function extendWithUtilsAnd<Schema extends MO.SchemaUPI, Additional>(
  self: Schema,
  additional: (self: Schema & Utils<Schema>) => Additional
) {
  const extended = Object.assign(self, makeUtils(self))
  return Object.assign(extended, additional(extended))
}

export type EParserFor<Self extends MO.SchemaAny> = MO.Parser.Parser<
  MO.EncodedOf<Self>,
  MO.ParserErrorOf<Self>,
  MO.ParsedShapeOf<Self>
>

export type UnsafeEParserFor<Self extends MO.SchemaAny> = (
  e: MO.EncodedOf<Self>
) => MO.ParsedShapeOf<Self>

export function EParserFor<ParsedShape, ConstructorInput, Encoded, Api>(
  schema: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): MO.Parser.Parser<Encoded, any, ParsedShape> {
  return MO.Parser.for(schema)
}

export type EncSchemaForModel<ParsedShape, Self extends MO.SchemaAny, MEnc> = MO.Schema<
  MO.ParserInputOf<Self>, // unknown lock to
  ParsedShape,
  MO.ConstructorInputOf<Self>,
  MEnc,
  MO.ApiOf<Self> & MO.ApiSelfType<ParsedShape>
>
