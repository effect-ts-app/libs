import "@effect-app/fluent-extensions"

export * as Record from "@effect-app/core/Object"
export * as Fnc from "./Function.js"
export * as Utils from "./utils.js"

// we cannot export types colliding with namespaces from .ts files, only from .d.ts files with custom .js trick, applied in @effect-app/core
// for app land, it may make sense to create an app/prelude?
export * from "@effect-app/core/Prelude"

export * as S from "@effect-app/prelude/schema"

export { Set as ROSet } from "@effect-app/core/Prelude"
