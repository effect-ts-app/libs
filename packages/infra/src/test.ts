import { Arbitrary } from "effect"
import { Predicate, S } from "effect-app"
import { copy } from "effect-app/utils"
import type { PropertySignature } from "effect/Schema"
import { generate } from "./arbs.js"

const isPropertySignature = (u: unknown): u is PropertySignature.All =>
  Predicate.hasProperty(u, S.PropertySignatureTypeId)

const defaults = (fields: S.Struct.Fields) => {
  const keys = Object.keys(fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {}
  for (const key of keys) {
    const field = fields[key]
    if (isPropertySignature(field)) {
      const ast = field.ast
      const defaultValue = ast._tag === "PropertySignatureDeclaration" ? ast.defaultValue : ast.to.defaultValue
      if (defaultValue !== undefined) {
        out[key] = defaultValue()
      }
    }
  }
  return out
}

/**
 * Given the schema for an object-like structure, creates a function that generates random instances of that object with some values provided.
 */
export const createRandomInstance = <A extends object, I, R>(s: S.Schema<A, I, R> & { fields: S.Struct.Fields }) => {
  const gen = generate(Arbitrary.make(s))
  return (overrides?: Partial<A>) => {
    const v = { ...gen.value, ...defaults(s.fields) }
    return overrides ? copy(v, overrides) : v
  }
}

/**
 * Like `createRandomInstance`, but takes encoded values rather than decoded ones.
 */
export const createRandomInstanceI = <A extends object, I>(s: S.Schema<A, I, never> & { fields: S.Struct.Fields }) => {
  const gen = generate(Arbitrary.make(s))
  const encode = S.encodeSync(s)
  const decode = S.decodeSync(s)
  return (overrides?: Partial<I>) => {
    const v = { ...gen.value, ...defaults(s.fields) }
    if (!overrides) return v
    return decode({ ...encode(v), ...overrides })
  }
}

export * from "./arbs.js"
