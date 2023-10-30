import type { ClientResponse } from "@effect/platform/Http/ClientResponse"
import type { Headers } from "@effect/platform/Http/Headers"

// there are issues with global imports with "as", so we re export here
export { Client as HttpClient } from "@effect/platform/Http/Client"
export { Cache as EffectCache } from "effect/Cache"
export { Request as EffectRequest } from "effect/Request"

export interface ResponseWithBody<A> extends Pick<ClientResponse, "headers" | "status" | "remoteAddress"> {
  readonly body: A
}

/**
 * @tsplus getter effect/platform/Http/ClientResponse responseWithJsonBody
 */
export const responseWithJsonBody = (
  response: ClientResponse
) =>
  response.json.map((body): ResponseWithBody<unknown> => ({
    body,
    headers: response.headers,
    status: response.status,
    remoteAddress: response.remoteAddress
  }))

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBody
 */
export const schemaJsonBody = <ParsedShape, Encoded, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => {
  const parse = Parser.for(schema).condemnCustom
  return client.mapEffect((_) => _.json.flatMap(parse))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBodyUnsafe
 */
export const schemaJsonBodyUnsafe = <ParsedShape, Encoded, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => {
  const _parse = Parser.for(schema).condemnCustom
  const parse = flow(_parse, Effect.orDie)
  return client.mapEffect((_) => _.json.flatMap(parse))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJson
 */
export const schemaJson = <
  Encoded extends {
    readonly status?: number
    readonly headers?: Headers
    readonly body?: unknown
  },
  ParsedShape,
  A,
  B
>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => {
  const parse = Parser.for(schema).condemnFail
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap(parse))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonUnsafe
 */
export const schemaJsonUnsafe = <
  Encoded extends {
    readonly status?: number
    readonly headers?: Headers
    readonly body?: unknown
  },
  ParsedShape,
  A,
  B
>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema.Schema<unknown, ParsedShape, any, Encoded, any>
) => {
  const parse = Parser.for(schema).condemnDie
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap((_) => parse(_)))
}
