/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JSONSchema, SubSchema } from "../../JsonSchema/index.js"
import { Ref as SchemaRef } from "../../JsonSchema/index.js"

export interface References {
  ref: Ref<Map<string, SubSchema>>
}

export const References = Tag<References>()

export class UnsupportedOperation {
  readonly _tag = "UnsupportedOperation"
  constructor(readonly errors: ROArray<string>) {}
}

export interface ConfigExtensionRef {
  openapiRef?: string
}

export interface ConfigExtensionMeta {
  openapiMeta?: any
}

export type Schema = Effect<References, never, JSONSchema | SubSchema>

export const SchemaURI = "SchemaURI" as const
export type SchemaURI = typeof SchemaURI

export function referenced(x?: ConfigExtensionRef) {
  return (schema: Schema): Schema => {
    if (x && typeof x.openapiRef !== "undefined") {
      const { openapiRef } = x
      return Effect.gen(function* (_) {
        const { ref } = yield* _(References)
        const jsonSchema = yield* _(schema)
        yield* _(ref.update((m) => m.set(openapiRef, jsonSchema)))
        return SchemaRef(`#/components/schemas/${openapiRef}`)
      })
    }
    return schema
  }
}

export class SchemaType<E, A> {
  _E!: E
  _A!: A
  _URI!: SchemaURI
  constructor(public Schema: Schema) {}
}

export const succeed = (_: SubSchema) => Effect.succeed(_)
export const dieMessage = (_: string) => Effect.die(new UnsupportedOperation([_]))

export function described(description: string) {
  return Effect.$.map(
    (schema: SubSchema): SubSchema => ({
      ...schema,
      description,
    })
  )
}

export function titled(title: string) {
  return Effect.$.map(
    (schema: SubSchema): SubSchema => ({
      ...schema,
      title,
    })
  )
}
