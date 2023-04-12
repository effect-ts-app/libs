import { pretty } from "@effect-app/core/utils"
import { CUPS } from "./service.js"

const makeFakeCups = Effect.sync(() => {
  return {
    print: (buffer, printerId, ...options) =>
      Effect
        .logInfo("Printing to fake printer")
        .zipRight(Effect({ stdout: "fake", stderr: "" }))
        .logAnnotate("printerId", printerId)
        .logAnnotate("options", pretty(options))
        .logAnnotate("bufferSize", buffer.byteLength.toString()),
    getAvailablePrinters: Effect([])
  } satisfies CUPS
})

/**
 * @tsplus static CUPS.Ops Fake
 */
export const FAKECups = makeFakeCups.toLayer(CUPS)
