//

import * as S from "../_schema.js"

// export const empty = Chunk.empty<never>()
// export function tree<A>(value: A, forest: S.Forest<A> = empty): S.Tree<A> {
//   return {
//     value,
//     forest,
//   }
// }

export function makeUtils<Schema extends S.SchemaUPI>(self: Schema): Utils<Schema> {
  const p = EParserFor(self)
  return {
    parse: p,
    unsafe: S.unsafe(p)
  }
}

export type Utils<Schema extends S.SchemaUPI> = {
  parse: EParserFor<Schema>
  unsafe: UnsafeEParserFor<Schema>
}

export function extendWithUtils<Schema extends S.SchemaUPI>(self: Schema) {
  return Object.assign(self, makeUtils(self))
}

export function extendWithUtilsAnd<Schema extends S.SchemaUPI, Additional>(
  self: Schema,
  additional: (self: Schema & Utils<Schema>) => Additional
) {
  const extended = Object.assign(self, makeUtils(self))
  return Object.assign(extended, additional(extended))
}

export type EParserFor<Self extends S.SchemaAny> = S.Parser.Parser<
  S.From<Self>,
  S.ParserErrorOf<Self>,
  S.To<Self>
>

export type UnsafeEParserFor<Self extends S.SchemaAny> = (
  e: S.From<Self>
) => S.To<Self>

export function EParserFor<To, ConstructorInput, From, Api>(
  schema: S.Schema<unknown, To, ConstructorInput, From, Api>
): S.Parser.Parser<From, any, To> {
  return S.Parser.for(schema)
}

export type EncSchemaForClass<To, Self extends S.SchemaAny, MEnc> = S.Schema<
  S.ParserInputOf<Self>, // unknown lock to
  To,
  S.ConstructorInputOf<Self>,
  MEnc,
  S.ApiOf<Self> & S.ApiSelfType<To>
>
