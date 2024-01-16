/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/schema"
import type { ParseError } from "@effect/schema/ParseResult"

import { jwtDecode } from "jwt-decode"

export const jwt = S.transformOrFail(
  S.string,
  S.unknown,
  (s, __, ast) =>
    ParseResult.try({
      try: () => jwtDecode(s),
      catch: (e: any) => ParseResult.parseError(ParseResult.type(ast, s, e.message))
    }),
  (_): Effect<never, ParseError, string> => {
    throw new Error("not implemented")
  }
)
