import { Context, type Effect } from "effect-app"
import { NonEmptyString255 } from "effect-app/schema"
import type { makeCUPS } from "./live.js"

export const PrinterId = NonEmptyString255
export type PrinterId = NonEmptyString255

/**
 * @tsplus type CUPS
 * @tsplus companion CUPS.Ops
 */
export class CUPS extends Context.TagId("effect-app/CUPS")<CUPS, Effect.Success<ReturnType<typeof makeCUPS>>>() {}
