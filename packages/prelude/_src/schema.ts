import type { SchemaAny, schemaField } from "./schema/_schema.js"

// codegen:start {preset: barrel, include: ./schema/*, exclude: [./schema/events.ts, ./schema/overrides.ts]}
export * from "./schema/_schema.js"
export * from "./schema/api.js"
export * from "./schema/shared.js"
// codegen:end

export { Email, PhoneNumber } from "./schema/shared.js"

/**
 * Allow anonymous access
 */
export function allowAnonymous(cls: any) {
  Object.assign(cls, { allowAnonymous: true })
  return cls
}

export interface EncodedClass<T> {
  new(a: T): T
}

export function EncodedClassBase<T>() {
  class Encoded {
    constructor(a: T) {
      Object.assign(this, a)
    }
  }
  return Encoded as EncodedClass<T>
}
export function EncodedClass<Cls extends { [schemaField]: SchemaAny }>() {
  return EncodedClassBase<EncodedFromApi<Cls>>()
}
