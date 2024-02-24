/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type { ParseIssue } from "@effect/schema/ParseResult"
import type { Effect } from "effect-app"
import * as S from "effect-app/schema"
import { jwtDecode, type JwtDecodeOptions } from "jwt-decode"

export const parseJwt = <R, I, A>(
  schema: S.Schema<A, I, R>,
  options?: JwtDecodeOptions | undefined
): S.Schema<A, string, R> =>
  S
    .transformOrFail(
      S.string,
      S.unknown,
      (s, __, ast) =>
        S.ParseResult.try({
          try: () => jwtDecode(s, options),
          catch: (e: any) => S.ParseResult.type(ast, s, e?.message)
        }),
      (_): Effect<string, ParseIssue> => {
        throw new Error("not implemented")
      }
    )
    .compose(schema, { strict: false })
