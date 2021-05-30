import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import { flow, pipe } from "@effect-ts/core/Function"
import * as Sy from "@effect-ts/core/Sync"
import * as T from "@effect-ts-app/core/ext/Effect"
import * as S from "@effect-ts-app/core/ext/Schema"
import { Encoder, Parser } from "@effect-ts-app/core/ext/Schema"

export function makeCodec<
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape extends { id: Id },
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api,
  Id
>(
  self: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) {
  // TODO: strict
  const decode = flow(Parser.for(self)["|>"](S.condemn), T.orDie)
  const enc = Encoder.for(self)

  const encode = (u: ParsedShape) => Sy.succeedWith(() => enc(u))
  const encodeToMap = toMap(encode)
  return [decode, encode, encodeToMap] as const
}

function toMap<E, A extends { id: Id }, Id>(encode: (a: A) => Sy.UIO<E>) {
  return (a: A.Array<A>) =>
    pipe(
      A.map_(a, (task) => Sy.tuple(Sy.succeed(task.id as A["id"]), encode(task))),
      Sy.collectAll,
      Sy.map(Map.make)
    )
}
