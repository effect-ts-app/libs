import * as MO from "@effect-app/schema"
import { Encoder, Parser } from "@effect-app/schema"

export function makeCodec<
  ParsedShape extends { id: Id },
  ConstructorInput,
  Encoded,
  Api,
  Id
>(self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>) {
  const decode = MO.condemnDie(Parser.for(self))
  // TODO: strict
  const encode = Encoder.for(self)
  return [decode, encode] as const
}
