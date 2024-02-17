import { NonEmptyString255 } from "effect-app/schema"
import type { makeCUPS } from "./live.js"

export const PrinterId = NonEmptyString255
export type PrinterId = NonEmptyString255

/**
 * @tsplus type CUPS
 * @tsplus companion CUPS.Ops
 */
export class CUPS extends TagClassId<CUPS, Effect.Success<ReturnType<typeof makeCUPS>>>()("effect-app/CUPS") {}
