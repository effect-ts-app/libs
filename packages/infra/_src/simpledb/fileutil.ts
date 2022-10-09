import fs from "fs"
import { promisify } from "util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const rename = promisify(fs.rename)
const exists = promisify(fs.exists)
// const mkdir = promisify(fs.mkdir)
// const unlinkFile = promisify(fs.unlink)

/**
 * Safe write file to .tmp and then rename
 */
export function writeTextFile(fileName: string, content: string) {
  const tmp = fileName + ".tmp"
  return (
    Effect.tryPromise(() => writeFile(tmp, content, "utf-8")) >
    Effect.tryPromise(() => rename(tmp, fileName))
  ).orDie
}

export function fileExists(fileName: string) {
  return Effect.tryPromise(() => exists(fileName)).orDie
}

export function readTextFile(fileName: string) {
  return Effect.tryPromise(() => readFile(fileName, "utf-8"))
}
