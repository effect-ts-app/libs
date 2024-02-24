import { pretty } from "@effect-app/core/utils"
import { Effect } from "effect-app"
import { CUPS } from "./service.js"

/**
 * @tsplus static CUPS.Ops Fake
 */
export const FAKECups = CUPS.toLayer(Effect.sync(() => {
  return {
    print: (buffer, printerId, ...options) =>
      Effect
        .logInfo("Printing to fake printer")
        .zipRight(Effect.sync(() => ({ stdout: "fake", stderr: "" })))
        .annotateLogs("printerId", printerId)
        .annotateLogs("options", pretty(options))
        .annotateLogs("bufferSize", buffer.byteLength.toString()),
    getAvailablePrinters: Effect.sync(() => [])
  }
}))
