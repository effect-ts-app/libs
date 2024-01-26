/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/prelude/schema"
import type { ParseIssue } from "@effect/schema/ParseResult"
import { jwtDecode, type JwtDecodeOptions } from "jwt-decode"

export const parseJwt = <R, I, A>(
  schema: Schema<R, I, A>,
  options?: JwtDecodeOptions | undefined
): Schema<R, string, A> =>
  S
    .transformOrFail(
      S.string,
      S.unknown,
      (s, __, ast) =>
        ParseResult.try({
          try: () => jwtDecode(s, options),
          catch: (e: any) => ParseResult.type(ast, s, e?.message)
        }),
      (_): Effect<never, ParseIssue, string> => {
        throw new Error("not implemented")
      }
    )
    .compose(schema, { strict: false })
