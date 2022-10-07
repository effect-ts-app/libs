module.exports = function(fileInfo, api, options) {
  // transform `fileInfo.source` here
  // ...
  // return changed source
  const source = fileInfo.source.replaceAll('"@effect-ts/core/Effect"', '"@effect/core/io/Effect"')
  return source;
};