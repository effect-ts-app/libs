/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/prelude/schema"

import { jwtDecode } from "jwt-decode"

export const jwt = S.transform(S.string, S.unknown, (_) => jwtDecode(_), (_): string => {
  throw new Error("not implemented")
})
