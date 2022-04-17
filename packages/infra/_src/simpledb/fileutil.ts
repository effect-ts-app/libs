import fs from "fs"
import { promisify } from "util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const exists = promisify(fs.exists)
// const mkdir = promisify(fs.mkdir)
// const unlinkFile = promisify(fs.unlink)

export function writeTextFile(fileName: string, content: string) {
  return Effect.tryPromise(() => writeFile(fileName, content, "utf-8")).orDie()
}

export function fileExists(fileName: string) {
  return Effect.tryPromise(() => exists(fileName)).orDie()
}

export function readTextFile(fileName: string) {
  return Effect.tryPromise(() => readFile(fileName, "utf-8"))
}
