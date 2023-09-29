import { pretty } from "@effect-app/core/utils"
import { CUPS } from "./service.js"

const makeFakeCups = Effect.sync(() => {
  return {
    print: (buffer, printerId, ...options) =>
      Effect
        .logInfo("Printing to fake printer")
        .zipRight(Effect({ stdout: "fake", stderr: "" }))
        .annotateLogs("printerId", printerId)
        .annotateLogs("options", pretty(options))
        .annotateLogs("bufferSize", buffer.byteLength.toString()),
    getAvailablePrinters: Effect([])
  } satisfies CUPS
})

/**
 * @tsplus static CUPS.Ops Fake
 */
export const FAKECups = makeFakeCups.toLayer(CUPS)
