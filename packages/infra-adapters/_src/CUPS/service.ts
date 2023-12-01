import { TagClass } from "@effect-app/prelude/service"
import { NonEmptyString255 } from "@effect-app/schema"

export const PrinterId = NonEmptyString255
export type PrinterId = NonEmptyString255

/**
 * @tsplus type CUPS
 * @tsplus companion CUPS.Ops
 */
export abstract class CUPS extends TagClass<CUPS>() {
  abstract print: (buffer: ArrayBuffer, printerId: PrinterId, ...options: string[]) => Effect<never, unknown, {
    stdout: string
    stderr: string
  }>
  abstract getAvailablePrinters: Effect<never, unknown, NonEmptyString255[]>
}
