/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/prelude/schema"
import type { ParseIssue } from "@effect/schema/ParseResult"
import { jwtDecode, type JwtDecodeOptions } from "jwt-decode"

export const parseJwt = <R, I, A>(
  schema: Schema<A, I, R>,
  options?: JwtDecodeOptions | undefined
): Schema<A, string, R> =>
  S
    .transformOrFail(
      S.string,
      S.unknown,
      (s, __, ast) =>
        ParseResult.try({
          try: () => jwtDecode(s, options),
          catch: (e: any) => ParseResult.type(ast, s, e?.message)
        }),
      (_): Effect<string, ParseIssue> => {
        throw new Error("not implemented")
      }
    )
    .compose(schema, { strict: false })
