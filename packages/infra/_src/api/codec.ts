import * as S from "@effect-app/prelude/schema"

export function makeCodec<
  From,
  To extends { id: Id },
  Id
>(self: S.Schema<never, From, To>) {
  return [S.decodeSync(self), S.encodeSync(self)] as const
}
