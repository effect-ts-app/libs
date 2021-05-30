import * as S from "@effect-ts/schema"

import { pipe } from "../../Function"

export const Void = pipe(
  S.unknown,
  S.encoder(() => void 0),
  S.refine(
    (_u: unknown): _u is void => true,
    (n) => S.leafE(S.nonEmptyE(n))
  )
)

export type Void = S.ParsedShapeOf<typeof Void>
