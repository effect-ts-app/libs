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
    .map(file => file.createReadStream())
}

export function openFile(fileName: string) {
  return Effect.acquireRelease(Effect.tryPromise(() => fs.open(fileName)), f => Effect.promise(() => f.close()))
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
  return Effect.sync(() => path.join(os.tmpdir(), folder, `${prefix}-` + crypto.randomUUID()))
    .flatMap(fp =>
      Effect.acquireRelease(
        Effect.tryPromise(() => fs.writeFile(fp, data, options))
          .map(_ => fp),
        p => Effect.promise(() => fs.unlink(p))
      )
    )
}
