export * as Record from "@effect-ts-app/core/Object"
export * as Fnc from "./Function.js"
export * as Utils from "./utils.js"

// we cannot export types colliding with namespaces from .ts files, only from .d.ts files with custom .js trick, applied in @effect-ts-app/core
// for app land, it may make sense to create an app/prelude?
export * from "@effect-ts-app/core/Prelude"

export * as Schema from "@effect-ts-app/schema"

export { Array as ROArray, Map as ROMap, Set as ROSet } from "@effect-ts-app/core/Prelude"
