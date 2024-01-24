/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/schema"
import type { ParseIssue } from "@effect/schema/ParseResult"

import { jwtDecode } from "jwt-decode"

export const parseJwt = <R, I, A>(schema: Schema<R, I, A>): Schema<R, string, A> =>
  S
    .transformOrFail(
      S.string,
      S.unknown,
      (s, __, ast) =>
        ParseResult.try({
          try: () => jwtDecode(s),
          catch: (e: any) => ParseResult.type(ast, s, e?.message)
        }),
      (_): Effect<never, ParseIssue, string> => {
        throw new Error("not implemented")
      }
    )
    .compose(schema as Schema<R, unknown, A>)
