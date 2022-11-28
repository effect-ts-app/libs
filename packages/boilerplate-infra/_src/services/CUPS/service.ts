export const PrinterId = ReasonableString
export type PrinterId = ReasonableString

export interface CUPS {
  print: (buffer: ArrayBuffer, printerId: PrinterId) => Effect<never, unknown, {
    stdout: string
    stderr: string
  }>
  getAvailablePrinters: Effect<never, unknown, ReasonableString[]>
}

/**
 * @tsplus type CUPS.Ops
 */
export interface CUPSOps extends Tag<CUPS> {}
export const CUPS: CUPSOps = Tag<CUPS>()
