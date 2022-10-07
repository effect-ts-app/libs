module.exports = function (fileInfo: { source: string }, api, options) {
  // transform `fileInfo.source` here
  // ...
  // return changed source
  const moduleMap = {
    "@effect-ts/core/Effect": "@effect/core/io/Effect",
    "@effect-ts/core/Effect/Layer": "@effect/core/io/Layer",
    "@effect-ts/core/Effect/Fiber": "@effect/core/io/Fiber",
    "@effect-ts/core/Effect/Cause": "@effect/core/io/Cause",
    "@effect-ts/system/Cause": "@effect/core/io/Cause",
    "@effect-ts/core/Has": "@tsplus/stdlib/service/Tag",
    "@effect-ts/system/Has": "@tsplus/stdlib/service/Tag",
    "@effect-ts/core/Collections/Immutable/Chunk": "@tsplus/stdlib/collections/Chunk",
    "@effect-ts/core/Support/AtomicBoolean": "@tsplus/stdlib/data/AtomicBoolean",
    "@effect-ts/core/Effect/Supervisor": "@effect/core/io/Supervisor",
    "@effect-ts/core/Function": "@tsplus/stdlib/data/Function",
    "@effect-ts/system/Function": "@tsplus/stdlib/data/Function",
  }

  // TODO
  // import type { _A, _R } from "@effect-ts/system/Utils"
  // _A<  = T.Success<

  // TODO: scope
  //const removedModules = ["@effect-ts/core/Effect/Managed"]
  let { source } = fileInfo
  for (const k of Object.keys(moduleMap)) {
    source = source.replaceAll(`"${k}"`, `"${moduleMap[k]}"`)
  }
  source = source
    .replaceAll(
      /RIO<\s*(\w+),\s*(\w+)>/g,
      (_, ...args) => `Effect<${args[0]}, never, ${args[1]}>`
    )
    .replaceAll(/& Has<(\w+)>/g, (_, ...m) => `| ${m[0]}`)
    .replaceAll(/Has<(\w+)>/g, (_, ...m) => `${m[0]}`)
    .replaceAll(".succeedWith(", ".sync(")
    .replaceAll(/.effectAsync([(<])/g, (_, m) => `.async${m[0]}`)
    .replaceAll(".chain", ".flatMap")
  return source
}
