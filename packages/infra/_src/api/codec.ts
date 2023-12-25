import * as S from "@effect-app/schema"

export function makeCodec<
  To extends { id: Id },
  From,
  Id
>(self: S.Schema<From, To>) {
  return [S.parseSync(self), S.encodeSync(self)] as const
}
