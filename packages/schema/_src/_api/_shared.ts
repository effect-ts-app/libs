//

import type {
  ApiOf,
  ApiSelfType,
  ConstructorInputOf,
  From,
  ParserErrorOf,
  ParserInputOf,
  Schema,
  SchemaAny,
  SchemaUPI,
  To
} from "_src/custom.js"
import { unsafe } from "../custom/_api/condemn.js"
import * as Parser from "../custom/Parser.js"

// export const empty = Chunk.empty<never>()
// export function tree<A>(value: A, forest: Forest<A> = empty): Tree<A> {
//   return {
//     value,
//     forest,
//   }
// }

export function makeUtils<Schema extends SchemaUPI>(self: Schema): Utils<Schema> {
  const p = EParserFor(self)
  return {
    parse: p,
    unsafe: unsafe(p)
  }
}

export type Utils<Schema extends SchemaUPI> = {
  parse: EParserFor<Schema>
  unsafe: UnsafeEParserFor<Schema>
}

export function extendWithUtils<Schema extends SchemaUPI>(self: Schema) {
  return Object.assign(self, makeUtils(self))
}

export function extendWithUtilsAnd<Schema extends SchemaUPI, Additional>(
  self: Schema,
  additional: (self: Schema & Utils<Schema>) => Additional
) {
  const extended = Object.assign(self, makeUtils(self))
  return Object.assign(extended, additional(extended))
}

export type EParserFor<Self extends SchemaAny> = Parser.Parser<
  From<Self>,
  ParserErrorOf<Self>,
  To<Self>
>

export type UnsafeEParserFor<Self extends SchemaAny> = (
  e: From<Self>
) => To<Self>

export function EParserFor<To, ConstructorInput, From, Api>(
  schema: Schema<unknown, To, ConstructorInput, From, Api>
): Parser.Parser<From, any, To> {
  return Parser.for(schema)
}

export type EncSchemaForClass<To, Self extends SchemaAny, MEnc> = Schema<
  ParserInputOf<Self>, // unknown lock to
  To,
  ConstructorInputOf<Self>,
  MEnc,
  ApiOf<Self> & ApiSelfType<To>
>
