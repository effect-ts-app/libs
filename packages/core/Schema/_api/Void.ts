import { pipe } from "../../Function"
import * as MO from "../custom"

export const Void = pipe(
  MO.unknown,
  MO.encoder(() => void 0),
  MO.refine(
    (_u: unknown): _u is void => true,
    (n) => MO.leafE(MO.nonEmptyE(n))
  )
)

export type Void = MO.ParsedShapeOf<typeof Void>
