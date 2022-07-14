import { pipe } from "@effect-ts-app/core/Function"
import * as MO from "../custom/index.js"
import { withDefaults } from "../custom/index.js"

export const Void = pipe(
  MO.unknown,
  MO.encoder(() => void 0),
  MO.refine(
    (_u: unknown): _u is void => true,
    (n) => MO.leafE(MO.nonEmptyE(n))
  ),
  MO.named("void"),
  withDefaults
)

export type Void = MO.ParsedShapeOf<typeof Void>
