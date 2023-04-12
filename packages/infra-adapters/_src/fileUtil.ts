import crypto from "crypto"
import type { Abortable } from "events"
import type { Mode, ObjectEncodingOptions, OpenMode } from "fs"
import fs from "fs/promises"
import os from "os"
import path from "path"
import type internal from "stream"

export function readFile(fileName: string) {
  return Effect.tryPromise(() => fs.readFile(fileName))
}

export function createReadableStream(fileName: string) {
  return openFile(fileName)
    .map((file) => file.createReadStream())
}

export function openFile(fileName: string) {
  return Effect.tryPromise(() => fs.open(fileName)).acquireRelease((f) => Effect.promise(() => f.close()))
}

export function tempFile(
  folder: string
) {
  return (prefix: string) => (data: Data, options?: Options) => tempFile_(folder, prefix, data, options)
}

type Data =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | internal.Stream

type Options =
  | (ObjectEncodingOptions & {
    mode?: Mode | undefined
    flag?: OpenMode | undefined
  } & Abortable)
  | BufferEncoding
  | null
export function tempFile_(
  folder: string,
  prefix: string,
  data: Data,
  options?: Options
) {
  return Effect(path.join(os.tmpdir(), folder, `${prefix}-` + crypto.randomUUID()))
    .flatMap((fp) =>
      Effect
        .tryPromise(() => fs.writeFile(fp, data, options))
        .map((_) => fp)
        .acquireRelease(
          (p) => Effect.promise(() => fs.unlink(p))
        )
    )
}

/**
 * Safe write file to .tmp and then rename
 */
export function writeTextFile(fileName: string, content: string) {
  const tmp = fileName + ".tmp"
  return (
    Effect.tryPromise(() => fs.writeFile(tmp, content, "utf-8"))
      > Effect.tryPromise(() => fs.rename(tmp, fileName))
  )
    .orDie
}

export function fileExists(fileName: string) {
  return Effect
    .tryPromise(() => fs.stat(fileName).then((_) => _.isFile()))
    .orDie
}

export function readTextFile(fileName: string) {
  return Effect.tryPromise(() => fs.readFile(fileName, "utf-8"))
}
