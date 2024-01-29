import type { Preset } from 'eslint-plugin-codegen';

/**
 * Adds file meta
 */
export const meta: Preset<{
}> = ({ meta }) => {
  const moduleName = meta.filename.substring(meta.filename.indexOf("_src/") > -1 ? meta.filename.indexOf("_src/") + 5 : meta.filename.indexOf("src/") + 4, meta.filename.length - 3)
  const expectedContent = `export const meta = { moduleName: "${moduleName}" }`

  try {
    if (expectedContent === meta.existingContent) {
      return meta.existingContent;
    }
  } catch {}

  return expectedContent;
};
