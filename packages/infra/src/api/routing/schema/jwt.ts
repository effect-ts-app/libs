/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "effect-app/schema"
import { jwtDecode, type JwtDecodeOptions } from "jwt-decode"

export const parseJwt = <R, I, A>(
  schema: S.Schema<A, I, R>,
  options?: JwtDecodeOptions
): S.Schema<A, string, R> =>
  S
    .transformToOrFail(
      S.String,
      S.Unknown,
      (s, __, ast) =>
        S.ParseResult.try({
          try: () => jwtDecode(s, options),
          catch: (e: any) => new S.ParseResult.Type(ast, s, e?.message)
        })
    )
    .pipe(S.compose(schema, { strict: false }))
