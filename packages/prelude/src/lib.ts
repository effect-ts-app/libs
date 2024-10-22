import type { YieldWrap } from "effect/Utils"
import { Effect } from "./Prelude.js"

export * as Record from "effect-app/Object"
export * as Fnc from "./Function.js"
export * as Utils from "./utils.js"

export * from "effect"

// we cannot export types colliding with namespaces from .ts files, only from .d.ts files with custom .js trick, applied in @effect-app/core
// for app land, it may make sense to create an app/prelude?
export * from "./Prelude.js"

export {
  Array,
  Cause,
  Chunk,
  Config,
  Context,
  Duration,
  Effect,
  Either,
  Equal,
  Equivalence,
  Exit,
  FiberRef,
  HashMap,
  Layer,
  Option,
  Order,
  Ref,
  Schema,
  Scope
} from "./Prelude.js"

export * as Struct from "./Struct.js"

export * as SecretURL from "effect-app/Config/SecretURL"
export * as S from "effect-app/schema"
export { copy } from "effect-app/utils"

// Simply Effect! https://github.com/kasperpeulen/simply-effect
type InferE<Eff extends YieldWrap<Effect<any, any, any>>> = [
  Eff
] extends [never] ? never
  : [Eff] extends [YieldWrap<Effect<infer _A, infer E, infer _R>>] ? E
  : never
type InferR<Eff extends YieldWrap<Effect<any, any, any>>> = [
  Eff
] extends [never] ? never
  : [Eff] extends [YieldWrap<Effect<infer _A, infer _E, infer R>>] ? R
  : never

export function effect<
  Eff extends YieldWrap<Effect<any, any, any>>,
  AEff
>(
  f: () => Generator<Eff, AEff, never>
): Effect<AEff, InferE<Eff>, InferR<Eff>>
export function effect<
  Eff extends YieldWrap<Effect<any, any, any>>,
  AEff,
  Args extends any[]
>(
  f: (...args: Args) => Generator<Eff, AEff, never>
): (...args: Args) => Effect<AEff, InferE<Eff>, InferR<Eff>>
export function effect<
  Self,
  Eff extends YieldWrap<Effect<any, any, any>>,
  AEff
>(
  self: Self,
  f: (this: Self) => Generator<Eff, AEff, never>
): Effect<AEff, InferE<Eff>, InferR<Eff>>
export function effect<
  Eff extends YieldWrap<Effect<any, any, any>>,
  AEff,
  Args extends any[],
  Self
>(
  self: Self,
  f: (this: Self, ...args: Args) => Generator<Eff, AEff, never>
): (...args: Args) => Effect<AEff, InferE<Eff>, InferR<Eff>>
export function effect() {
  const f = arguments.length === 1 ? arguments[0] : arguments[1].bind(arguments[0])
  if (f.length === 0) return Effect.gen(f)
  return (...args: any) => Effect.gen(() => f(...args))
}
