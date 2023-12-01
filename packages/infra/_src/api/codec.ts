import * as MO from "@effect-app/schema"
import { Encoder, Parser } from "@effect-app/schema"

export function makeCodec<
  To extends { id: Id },
  ConstructorInput,
  From,
  Api,
  Id
>(self: MO.Schema<unknown, To, ConstructorInput, From, Api>) {
  const decode = MO.condemnDie(Parser.for(self))
  // TODO: strict
  const encode = Encoder.for(self)
  return [decode, encode] as const
}
