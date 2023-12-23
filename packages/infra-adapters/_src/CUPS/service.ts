import { NonEmptyString255 } from "@effect-app/schema"
import type { makeCUPS } from "./live.js"

export const PrinterId = NonEmptyString255
export type PrinterId = NonEmptyString255

/**
 * @tsplus type CUPS
 * @tsplus companion CUPS.Ops
 */
export class CUPS extends TagClass<CUPS.Id, Effect.Success<ReturnType<typeof makeCUPS>>, CUPS>() {}
export namespace CUPS {
  export interface Id {
    readonly id: unique symbol
  }
}
