import type { ClientResponse } from "@effect/platform/Http/ClientResponse"

// there are issues with global imports with "as", so we re export here
export { Cache as EffectCache } from "effect/Cache"
export { Request as EffectRequest } from "effect/Request"

export { Client as HttpClient } from "@effect/platform/Http/Client"

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBody
 */
export const schemaJsonBody = <ParsedShape, Encoded, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => client.mapEffect((_) => _.json.flatMap(Parser.for(schema).condemnFail))

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBodyUnsafe
 */
export const schemaJsonBodyUnsafe = <ParsedShape, Encoded, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => client.mapEffect((_) => _.json.flatMap(Parser.for(schema).condemnDie))
