import type { Preset } from 'eslint-plugin-codegen';

/**
 * Adds file meta
 */
export const meta: Preset<{ sourcePrefix?: string }> = ({ meta, options }) => {
  const sourcePrefix = options.sourcePrefix || "src/"
  const moduleName = meta.filename.substring(meta.filename.indexOf(sourcePrefix) + sourcePrefix.length, meta.filename.length - 3)
  const expectedContent = `export const meta = { moduleName: "${moduleName}" }`

  try {
    if (expectedContent === meta.existingContent) {
      return meta.existingContent;
    }
  } catch {}

  return expectedContent;
};
