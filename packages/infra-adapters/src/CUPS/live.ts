import type { FileOptions } from "@effect-app/infra/fileUtil.js"
import { tempFile } from "@effect-app/infra/fileUtil.js"
import cp from "child_process"
import { Effect, Predicate } from "effect-app"
import { NonEmptyString255 } from "effect-app/Schema"
import { pretty } from "effect-app/utils"
import fs from "fs"
import os from "os"
import path from "path"
import util from "util"
import { InfraLogger } from "../logger.js"
import { CUPS } from "./service.js"
import type { PrinterId } from "./service.js"

/**
 * @tsplus static CUPS.Ops Layer
 */
export function CUPSLayer(cupsServer?: URL) {
  return CUPS.toLayer(makeCUPS(cupsServer))
}

export function makeCUPS(cupsServer?: URL) {
  return Effect.sync(() => {
    function print(buffer: ArrayBuffer, printerId: PrinterId, ...options: string[]) {
      const _print = printBuffer({
        id: printerId,
        url: cupsServer
      }, options)
      return _print(buffer)
    }
    return {
      print,
      printFile: (filePath: string, printerId: PrinterId, ...options: string[]) =>
        printFile({
          id: printerId,
          url: cupsServer
        }, options)(filePath),
      getAvailablePrinters: getAvailablePrinters(cupsServer?.host)
    }
  })
}

const exec_ = util.promisify(cp.exec)
const exec = (command: string) =>
  Effect.andThen(
    InfraLogger.logDebug(`Executing: ${command}`),
    Effect.tap(
      Effect
        .tryPromise(() => exec_(command)),
      (r) => (InfraLogger.logDebug(`Executed`).pipe(Effect.annotateLogs("result", pretty(r))))
    )
  )
type PrinterConfig = { url?: URL | undefined; id: string }

function printFile(printer: PrinterConfig | undefined, options: string[]) {
  return (filePath: string) => printFile_(filePath, printer, options)
}

function printFile_(filePath: string, printer: PrinterConfig | undefined, options: string[]) {
  return exec(["lp", ...buildPrintArgs(filePath, printer, options)].join(" "))
}

function* buildPrintArgs(filePath: string, printer: PrinterConfig | undefined, options: string[]) {
  if (printer) {
    if (printer.url) {
      yield `-h ${printer.url.host}`
      if (printer.url.username) {
        yield `-U ${printer.url.username}`
      }
    }
    yield `-d "${printer.id}"`
    for (const o of options) {
      yield `-o ${o}`
    }
  }
  yield `"${filePath}"`
}

export const prepareTempDir = Effect.sync(() => {
  // TODO
  try {
    fs.mkdirSync(path.join(os.tmpdir(), "effect-ts-app"))
  } catch (err) {
    if (`${err}`.includes("EEXIST")) {
      return
    }
    throw err
  }
})

const makeTempFile = tempFile("effect-ts-app")
export const makePrintJobTempFile = makeTempFile("print-job")
export const makePrintJobTempFileArrayBuffer = (buffer: ArrayBuffer, options?: FileOptions) =>
  makePrintJobTempFile(Buffer.from(buffer), options)

function printBuffer(printer: PrinterConfig, options: string[]) {
  return (buffer: ArrayBuffer) =>
    makePrintJobTempFileArrayBuffer(buffer)
      .pipe(
        Effect.flatMap(printFile(printer, options)),
        Effect.scoped
      )
}

function getAvailablePrinters(host?: string) {
  return Effect.gen(function*() {
    const { stdout } = yield* exec(["lpstat", ...buildListArgs({ host }), "-s"].join(" "))
    return [...stdout.matchAll(/device for (\w+):/g)]
      .map((_) => _[1])
      .filter(Predicate.isNotNullable)
      .map((_) => NonEmptyString255(_))
  })
}

function* buildListArgs(config?: { host?: string | undefined }) {
  if (config?.host) {
    yield `-h ${config.host}`
  }
}
