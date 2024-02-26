import type { Schema } from "@effect-app/schema"
import type { ClientResponse } from "@effect/platform/Http/ClientResponse"
import type { Headers } from "@effect/platform/Http/Headers"
import { HttpClient, HttpClientError, HttpClientRequest, HttpHeaders } from "./http.js"
import { Effect, Option, S } from "./lib.js"

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
  Effect.map(response.json, (body): ResponseWithBody<unknown> => ({
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
  return HttpClient.mapEffect(client, (_) => Effect.flatMap(_.json, S.decodeUnknown(schema)))
}

/**
 * @tsplus fluent effect/platform/Http/Client schemaJsonBodyUnsafe
 */
export const schemaJsonBodyUnsafe = <To, From, A, B>(
  client: HttpClient.Client<A, B, ClientResponse>,
  schema: Schema<To, From>
) => {
  return HttpClient.mapEffect(client, (_) => Effect.map(_.json, S.decodeUnknownSync(schema)))
}

/**
 * @tsplus fluent effect/platform/Http/Client responseWithSchemaBody
 */
export const responseWithSchemaBody = <
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
  return HttpClient.mapEffect(
    client,
    (_) =>
      Effect.flatMap(
        responseWithJsonBody(_),
        (_) => Effect.map(S.decodeUnknown(schema)(_.body), (body) => ({ ..._, body }))
      )
  )
}

/** @tsplus getter effect/platform/Http/Client demandJson */
export const demandJson = <R, E>(client: HttpClient.Client<R, E, ClientResponse>) =>
  HttpClient
    .mapRequest(client, (_) => HttpClientRequest.acceptJson(_))
    .pipe(HttpClient.transform((r, request) =>
      Effect.tap(r, (response) =>
        Option
            .getOrUndefined(HttpHeaders
              .get(response.headers, "Content-Type"))
            ?.startsWith("application/json")
          ? Effect.unit
          : Effect.fail(HttpClientError.ResponseError({
            request,
            response,
            reason: "Decode",
            error: "not json response: " + Option.getOrUndefined(HttpHeaders.get(response.headers, "Content-Type"))
          })))
    ))
