import { Effect } from "effect-app"
import { pretty } from "effect-app/utils"
import { InfraLogger } from "../logger.js"
import { CUPS } from "./service.js"

/**
 * @tsplus static CUPS.Ops Fake
 */
export const FAKECups = CUPS.toLayer(Effect.sync(() => {
  return {
    print: (buffer, printerId, ...options) =>
      InfraLogger
        .logInfo("Printing to fake printer")
        .pipe(
          Effect.zipRight(Effect.sync(() => ({ stdout: "fake", stderr: "" }))),
          Effect
            .annotateLogs({
              printerId,
              "options": pretty(options),
              "bufferSize": buffer.byteLength.toString()
            })
        ),
    printFile: (filePath, printerId, ...options) =>
      InfraLogger
        .logInfo("Printing to fake printer")
        .pipe(
          Effect.zipRight(Effect.sync(() => ({ stdout: "fake", stderr: "" }))),
          Effect
            .annotateLogs({
              printerId,
              filePath,
              "options": pretty(options)
            })
        ),
    getAvailablePrinters: Effect.sync(() => [])
  }
}))
