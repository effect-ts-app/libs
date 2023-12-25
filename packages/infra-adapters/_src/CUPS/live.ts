import { pretty } from "@effect-app/core/utils"
import { NonEmptyString255, S } from "@effect-app/schema"
import cp from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import util from "util"
import { tempFile } from "../fileUtil.js"
import { CUPS } from "./service.js"
import type { PrinterId } from "./service.js"

/**
 * @tsplus static CUPS.Ops Layer
 */
export function CUPSLayer(cupsServer?: URL) {
  return makeCUPS(cupsServer).toLayer(CUPS)
}

export function makeCUPS(cupsServer?: URL) {
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
      .tap((r) => (Effect.logDebug(`Executed`).annotateLogs("result", pretty(r))))
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
const makePrintJobTempFile = makeTempFile("print-job")

function printBuffer(printer: PrinterConfig, options: string[]) {
  return (buffer: ArrayBuffer) =>
    makePrintJobTempFile(Buffer.from(buffer))
      .flatMap(printFile(printer, options))
      .scoped
}

function getAvailablePrinters(host?: string) {
  return Effect.gen(function*($) {
    const { stdout } = yield* $(exec(["lpstat", ...buildListArgs({ host }), "-s"].join(" ")))
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

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultDate = <From>(s: S.Schema<From, Date>) => S.withDefaultConstructor(s, () => new Date())

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultNullable = <From, To>(s: S.Schema<From, To | null>) => S.withDefaultConstructor(s, () => null)

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultArray = <From, T>(s: S.Schema<From, ReadonlyArray<T>>) => S.withDefaultConstructor(s, () => [])
