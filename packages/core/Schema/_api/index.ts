import * as MO from "../vendor"

export * from "./futureDate"

export * from "./Void"
export * from "./length"
export * from "./string"
export * from "./email"
export * from "./phoneNumber"

export * from "./dictionary"
export * from "./map"
export * from "./set"
export * from "./tuple"

export * from "./fromProps"
export * from "./fromArray"
export * from "./nonEmptyArray"

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

export type SchemaForModel<M, Self extends MO.SchemaAny, MEnc = never> = MO.Schema<
  MO.ParserInputOf<Self>,
  M,
  MO.ConstructorInputOf<Self>,
  [MEnc] extends [never] ? MO.EncodedOf<Self> : MEnc,
  MO.ApiOf<Self> & MO.ApiSelfType<M>
>

export * from "../custom/_api"
