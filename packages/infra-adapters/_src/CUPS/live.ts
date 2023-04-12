import cp from "child_process"
import util from "util"
import { tempFile } from "../fileUtil.js"

import { isTruthy, pretty } from "@effect-app/core/utils"
import { ReasonableString } from "@effect-app/schema"
import fs from "fs"
import os from "os"
import path from "path"
import { CUPS } from "./service.js"
import type { PrinterId } from "./service.js"

/**
 * @tsplus static CUPS.Ops Live
 */
export function LiveCUPS(cupsServer?: URL) {
  return makeCUPS(cupsServer).toLayer(CUPS)
}

function makeCUPS(cupsServer?: URL) {
  return Effect.sync(() => {
    function print_(buffer: ArrayBuffer, printerId: PrinterId, ...options: string[]) {
      const print = printBuffer({
        id: printerId,
        url: cupsServer
      }, options)
      return print(buffer)
    }
    return {
      print: print_,
      getAvailablePrinters: getAvailablePrinters(cupsServer?.host)
    }
  })
}

const exec_ = util.promisify(cp.exec)
const exec = (command: string) =>
  Effect.logDebug(`Executing: ${command}`)
    > Effect
      .tryPromise(() => exec_(command))
      .tap((r) => (Effect.logDebug(`Executed`).logAnnotate("result", pretty(r))))
type PrinterConfig = { url?: URL; id: string }

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
const makePrintJobTempFile = makeTempFile("print-job")

function printBuffer(printer: PrinterConfig, options: string[]) {
  return (buffer: ArrayBuffer) =>
    makePrintJobTempFile(Buffer.from(buffer))
      .flatMap(printFile(printer, options))
      .scoped
}

function getAvailablePrinters(host?: string) {
  return Do(($) => {
    const { stdout } = $(exec(["lpstat", ...buildListArgs({ host }), "-s"].join(" ")))
    return [...stdout.matchAll(/device for (\w+):/g)]
      .map((_) => _[1])
      .filter(isTruthy)
      .map(ReasonableString)
  })
}

function* buildListArgs(config?: { host?: string }) {
  if (config?.host) {
    yield `-h ${config.host}`
  }
}
