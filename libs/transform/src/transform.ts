module.exports = function(fileInfo: { source: string }, api, options) {
  // transform `fileInfo.source` here
  // ...
  // return changed source
  const source = fileInfo.source
    .replaceAll('"@effect-ts/core/Effect"', '"@effect/core/io/Effect"')
    .replaceAll(/RIO<\s*(\w+),\s*(\w+)>/g, (_, args) => `Effect<${args[0]}, never, ${args[1]}>`)
  return source;
};