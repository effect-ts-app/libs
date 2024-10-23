import { Array, pipe } from "effect"
import type { Preset } from "eslint-plugin-codegen"

/**
 * Adds file meta
 */
export const meta: Preset<{ sourcePrefix?: string }> = ({ meta, options }) => {
  const sourcePrefix = options.sourcePrefix || "src/"
  const moduleName = pipe(
    meta
      .filename
      .substring(meta.filename.indexOf(sourcePrefix) + sourcePrefix.length, meta.filename.length - 3)
      .split("/"),
    Array.dedupeAdjacent
  )
    .filter((_) => _ !== "resources")
    .join("/")
  const expectedContent = `export const meta = { moduleName: "${moduleName}" } as const`

  try {
    if (expectedContent === meta.existingContent) {
      return meta.existingContent
    }
  } catch {}

  return expectedContent
}
