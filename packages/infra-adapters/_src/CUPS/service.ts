import { TagClass } from "@effect-app/prelude/service"
import { ReasonableString } from "@effect-app/schema"

export const PrinterId = ReasonableString
export type PrinterId = ReasonableString

/**
 * @tsplus type CUPS
 * @tsplus companion CUPS.Ops
 */
export abstract class CUPS extends TagClass<Tag<CUPS>>() {
  abstract print: (buffer: ArrayBuffer, printerId: PrinterId, ...options: string[]) => Effect<never, unknown, {
    stdout: string
    stderr: string
  }>
  abstract getAvailablePrinters: Effect<never, unknown, ReasonableString[]>
}
