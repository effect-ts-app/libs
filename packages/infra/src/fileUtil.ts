import crypto from "crypto"
import { Effect } from "effect-app"
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
  return Effect.map(openFile(fileName), (file) => file.createReadStream())
}

export function openFile(fileName: string) {
  return Effect.acquireRelease(Effect.tryPromise(() => fs.open(fileName)), (f) => Effect.promise(() => f.close()))
}

export function tempFile(
  folder: string
) {
  return (prefix: string) => (data: Data, options?: FileOptions) => tempFile_(folder, prefix, data, options)
}

type Data =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | internal.Stream

export type FileOptions =
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
  options?: FileOptions
) {
  return Effect.flatMap(
    Effect
      .sync(() => path.join(os.tmpdir(), folder, `${prefix}-` + crypto.randomUUID())),
    (fp) =>
      Effect.acquireRelease(
        Effect
          .map(
            Effect
              .tryPromise(() => fs.writeFile(fp, data, options)),
            (_) => fp
          ),
        (p) => Effect.promise(() => fs.unlink(p))
      )
  )
}

/**
 * Safe write file to .tmp and then rename
 */
export function writeTextFile(fileName: string, content: string) {
  const tmp = fileName + ".tmp"
  return Effect
    .andThen(
      Effect
        .tryPromise(() => fs.writeFile(tmp, content, "utf-8")),
      Effect.tryPromise(() => fs.rename(tmp, fileName))
    )
    .pipe(Effect.orDie)
}

export function fileExists(fileName: string) {
  return Effect.orDie(Effect
    .tryPromise(() => fs.stat(fileName).then((_) => _.isFile())))
}

export function readTextFile(fileName: string) {
  return Effect.tryPromise(() => fs.readFile(fileName, "utf-8"))
}
