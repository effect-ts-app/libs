import { CustomId } from "@fp-ts/schema/annotation/AST"
import { ArbitraryHookId } from "@fp-ts/schema/annotation/Hook"

export { Hook } from "@fp-ts/schema/annotation/Hook"
export { Arbitrary } from "@fp-ts/schema/Arbitrary"
export { Parser } from "@fp-ts/schema/Parser"
export { Pretty } from "@fp-ts/schema/Pretty"
export { Infer, Schema } from "@fp-ts/schema/Schema"

export * from "./arb.js"
export * from "./strings.js"

export const Annotations = {
  CustomId,
  ArbitraryHookId
}
