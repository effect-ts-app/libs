import type { Preset } from 'eslint-plugin-codegen';
import { pipe, ReadonlyArray } from "effect"

/**
 * Adds file meta
 */
export const meta: Preset<{ sourcePrefix?: string }> = ({ meta, options }) => {
  const sourcePrefix = options.sourcePrefix || "src/"
  const moduleName = pipe(
    meta.filename.substring(meta.filename.indexOf(sourcePrefix) + sourcePrefix.length, meta.filename.length - 3)
            .split("/"),
            Array.dedupeAdjacent
  ).join("/")
  const expectedContent = `export const meta = { moduleName: "${moduleName}" }`

  try {
    if (expectedContent === meta.existingContent) {
      return meta.existingContent;
    }
  } catch {}

  return expectedContent;
};
