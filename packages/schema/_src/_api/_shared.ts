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
  const p = EParserFor(self)
  return {
    parse: p,
    unsafe: MO.unsafe(p)
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
  MO.From<Self>,
  MO.ParserErrorOf<Self>,
  MO.To<Self>
>

export type UnsafeEParserFor<Self extends MO.SchemaAny> = (
  e: MO.From<Self>
) => MO.To<Self>

export function EParserFor<To, ConstructorInput, From, Api>(
  schema: MO.Schema<unknown, To, ConstructorInput, From, Api>
): MO.Parser.Parser<From, any, To> {
  return MO.Parser.for(schema)
}

export type EncSchemaForClass<To, Self extends MO.SchemaAny, MEnc> = MO.Schema<
  MO.ParserInputOf<Self>, // unknown lock to
  To,
  MO.ConstructorInputOf<Self>,
  MEnc,
  MO.ApiOf<Self> & MO.ApiSelfType<To>
>
