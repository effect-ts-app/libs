// @ts-expect-error wtf
import { HttpClientError } from "@effect/platform/Http/ClientError"
import type { ClientResponse } from "@effect/platform/Http/ClientResponse"
import type { Headers } from "@effect/platform/Http/Headers"

// there are issues with global imports with "as", so we re export here
export { Client as HttpClient } from "@effect/platform/Http/Client"
export { Cache as EffectCache } from "effect/Cache"
export { Request as EffectRequest } from "effect/Request"

export interface ResponseWithBody<A> extends Pick<ClientResponse, "headers" | "status" | "remoteAddress"> {
  readonly body: A
}

// TODO: consider rebuilding the text/json helpers to use a cached effect
// https://discord.com/channels/795981131316985866/1098177242598756412/1168565257569046712

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
export const schemaJsonBody = <R, To, From, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.json.flatMap(schema.decodeUnknown))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBodyUnsafe
 */
export const schemaJsonBodyUnsafe = <To, From, A, B>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema<To, From>
) => {
  return client.mapEffect((_) => _.json.map(schema.decodeUnknownSync))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJson
 */
export const schemaJson = <
  R,
  From extends {
    readonly status?: number
    readonly headers?: Headers
    readonly body?: unknown
  },
  To,
  A,
  B
>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap(schema.decodeUnknown))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonUnsafe
 */
export const schemaJsonUnsafe = <
  R,
  From extends {
    readonly status?: number
    readonly headers?: Headers
    readonly body?: unknown
  },
  To,
  A,
  B
>(
  client: HttpClient<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap(schema.decodeUnknown))
}

/** @tsplus getter effect/platform/Http/Client demandJson */
export const demandJson = <R, E>(client: HttpClient<R, E, ClientResponse>) =>
  client
    .mapRequest((_) => _.acceptJson)
    .transform((r, request) =>
      r.tap((response) =>
        response.headers.get("Content-Type").value?.startsWith("application/json")
          ? Effect.unit
          : Effect.fail(HttpClientError.ResponseError({
            request,
            response,
            reason: "Decode",
            error: "not json response: " + response.headers.get("Content-Type").value
          }))
      )
    )
