/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/schema"

import { jwtDecode } from "jwt-decode"

export const jwt = S.transformOrFail(
  S.string,
  S.unknown,
  (s, __, ast) =>
    ParseResult.try({
      try: () => jwtDecode(s),
      catch: (e: any) => ParseResult.parseError(ParseResult.type(ast, s, e.message))
    }),
  (_): ParseResult.ParseResult<string> => {
    throw new Error("not implemented")
  }
)
