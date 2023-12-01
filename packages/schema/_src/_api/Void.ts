import { pipe } from "@effect-app/core/Function"
import * as S from "../custom.js"
import { withDefaults } from "../custom.js"

export const Void = pipe(
  S.unknown,
  S.encoder(() => void 0),
  S.refine(
    (_u: unknown): _u is void => true,
    (n) => S.leafE(S.customE(n, "void"))
  ),
  S.named("void"),
  withDefaults
)

export type Void = S.To<typeof Void>
