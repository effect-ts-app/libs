/* eslint-disable @typescript-eslint/no-explicit-any */
import generate from "@babel/generator"
import { parse } from "@babel/parser"
import type { Preset } from "eslint-plugin-codegen"
import * as fs from "fs"

function normalise(str: string) {
  try {
    return generate(
      parse(str, { sourceType: "module", plugins: ["typescript"] }) as any
    )
      .code
    // .replace(/'/g, `"`)
    // .replace(/\/index/g, "")
    // .replace(/([\n\s]+ \|)/g, " |").replaceAll(": |", ":")
    // .replaceAll(/[\s\n]+\|/g, " |")
    // .replaceAll("\n", ";")
    // .replaceAll(" ", "")
    // TODO: remove all \n and whitespace?
  } catch (e) {
    return str
  }
}

export const model: Preset<{
  writeFullTypes?: boolean
}> = ({ meta }) => {
  try {
    const targetContent = fs.readFileSync(meta.filename).toString()

    const processed: string[] = []

    const sourcePath = meta.filename
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw Error(`Source path is not a file: ${sourcePath}`)
    }

    const clss = targetContent.matchAll(/(.*)export class (\w+)[^{]*(Extended(Tagged)?Class)|ExtendedTaggedRequest/g)
    const them = []
    for (const cls of clss) {
      let modelName = null
      if (cls && !cls[1] && cls[2]) {
        modelName = cls[2]
      } else continue
      if (processed.includes(modelName)) continue
      processed.push(modelName)

      them.push([
        `export namespace ${modelName} {`,
        `  export interface Encoded extends S.Struct.Encoded<typeof ${modelName}["fields"]> {}`,
        "}"
      ])
    }
    const expectedContent = [
      "//",
      `/* eslint-disable */`,
      ...them.flat().filter((x): x is string => !!x),
      `/* eslint-enable */`,
      "//"
    ]
      .join("\n")

    // do not re-emit in a different style, or a loop will occur
    if (normalise(meta.existingContent) === normalise(expectedContent)) {
      return meta.existingContent
    }
    return expectedContent
  } catch (e) {
    return (
      "/** Got exception: "
      + ("stack" in (e as any) ? (e as any).stack : "")
      + JSON.stringify(e)
      + "*/"
    )
  }
}
