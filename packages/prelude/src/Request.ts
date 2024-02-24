import type { Schema } from "@effect-app/schema"
import type { ClientResponse } from "@effect/platform/Http/ClientResponse"
import type { Headers } from "@effect/platform/Http/Headers"
import { type HttpClient, HttpClientError, HttpHeaders } from "./http.js"
import { Effect, S } from "./lib.js"

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
  client: HttpClient.Client<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.json.flatMap(S.decodeUnknown(schema)))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBodyUnsafe
 */
export const schemaJsonBodyUnsafe = <To, From, A, B>(
  client: HttpClient.Client<A, B, ClientResponse>,
  schema: Schema<To, From>
) => {
  return client.mapEffect((_) => _.json.map(S.decodeUnknownSync(schema)))
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
  client: HttpClient.Client<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap(S.decodeUnknown(schema)))
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
  client: HttpClient.Client<A, B, ClientResponse>,
  schema: Schema<To, From, R>
) => {
  return client.mapEffect((_) => _.responseWithJsonBody.flatMap(S.decodeUnknown(schema)))
}

/** @tsplus getter effect/platform/Http/Client demandJson */
export const demandJson = <R, E>(client: HttpClient.Client<R, E, ClientResponse>) =>
  client
    .mapRequest((_) => _.acceptJson)
    .transform((r, request) =>
      r.tap((response) =>
        HttpHeaders.get(response.headers, "Content-Type").value?.startsWith("application/json")
          ? Effect.unit
          : Effect.fail(HttpClientError.ResponseError({
            request,
            response,
            reason: "Decode",
            error: "not json response: " + HttpHeaders.get(response.headers, "Content-Type").value
          }))
      )
    )
