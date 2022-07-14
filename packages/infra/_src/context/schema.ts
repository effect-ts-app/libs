import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import * as MO from "@effect-ts-app/core/Schema"
import { Encoder, Parser } from "@effect-ts-app/core/Schema"
import { ParserEnv } from "@effect-ts-app/core/Schema/custom/Parser"

export function makeCodec<
  ParsedShape extends { id: Id },
  ConstructorInput,
  Encoded,
  Api,
  Id
>(self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>) {
  const parse = Parser.for(self) >= MO.condemnDie
  // TODO: strict
  const decode = (e: Encoded, env?: ParserEnv) => parse(e, env)
  const encode = Encoder.for(self)

  const encodeToMap = toMap(encode)
  return [decode, encode, encodeToMap] as const
}

function toMap<E, A extends { id: Id }, Id>(encode: (a: A) => E) {
  return (a: ROArray<A>) =>
    ROArray.map_(a, (task) => [task.id as A["id"], encode(task)] as const)["|>"](
      Map.make
    )
}
