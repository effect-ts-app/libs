import { logError } from "@effect-app/infra/errorReporter"
import type { SupportedErrors } from "effect-app/client/errors"
import {
  InvalidStateError,
  NotFoundError,
  NotLoggedInError,
  OptimisticConcurrencyException,
  UnauthorizedError,
  ValidationError
} from "effect-app/client/errors"
import { HttpBody, HttpHeaders, type HttpServerRequest, type HttpServerResponse } from "../http.js"

import type {
  InsufficientScopeError,
  InvalidRequestError,
  InvalidTokenError,
  UnauthorizedError as JWTUnauthorizedError
} from "express-oauth2-jwt-bearer"

export class JWTError extends Data.TaggedClass("JWTError")<{
  error:
    | InsufficientScopeError
    | InvalidRequestError
    | InvalidTokenError
    | JWTUnauthorizedError
}> {}

const logRequestError = logError("Request")

export function defaultBasicErrorHandler<R>(
  _req: HttpServerRequest,
  res: HttpServerResponse,
  r2: Effect<HttpServerResponse, ValidationError, R>
) {
  const sendError = (code: number) => (body: unknown) =>
    Effect.sync(() => res.setBody(HttpBody.unsafeJson(body)).setStatus(code))
  return r2
    .tapErrorCause((cause) => cause.isFailure() ? logRequestError(cause) : Effect.unit)
    .catchTag("ValidationError", (err) => sendError(400)(err.errors))
    // final catch all; expecting never so that unhandled known errors will show up
    .catchAll((err: never) =>
      Effect
        .logError(
          "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
        )
        .map(() => err as unknown)
        .flatMap(Effect.die)
    )
}

const optimisticConcurrencySchedule = Schedule.once
  && Schedule.recurWhile<SupportedErrors | JWTError>((a) => a._tag === "OptimisticConcurrencyException")

export function defaultErrorHandler<R>(
  req: HttpServerRequest,
  res: HttpServerResponse,
  r2: Effect<HttpServerResponse, SupportedErrors | JWTError, R>
) {
  const r3 = req.method === "PATCH"
    ? r2.retry(optimisticConcurrencySchedule)
    : r2
  const sendError = <R, From, To>(code: number, schema: Schema<To, From, R>) => (body: To) =>
    schema
      .encode(body)
      .orDie
      .andThen((body) =>
        res
          .setStatus(code)
          .setBody(HttpBody.unsafeJson(body))
      )
  return r3
    .tapErrorCause((cause) => cause.isFailure() ? logRequestError(cause) : Effect.unit)
    .catchTags({
      "JWTError": (err) =>
        Effect.succeed(
          HttpServerResponse.unsafeJson({ message: err.error.message }, {
            status: err
              .error
              .status,
            headers: HttpHeaders.fromInput(err.error.headers)
          })
        ),
      "ValidationError": sendError(400, ValidationError),
      "NotFoundError": sendError(404, NotFoundError),
      "NotLoggedInError": sendError(401, NotLoggedInError),
      "UnauthorizedError": sendError(403, UnauthorizedError),
      "InvalidStateError": sendError(422, InvalidStateError),
      // 412 or 409.. https://stackoverflow.com/questions/19122088/which-http-status-code-to-use-to-reject-a-put-due-to-optimistic-locking-failure
      "OptimisticConcurrencyException": sendError(412, OptimisticConcurrencyException)
    })
    // final catch all; expecting never so that unhandled known errors will show up
    .catchAll((err: never) =>
      Effect
        .logError(
          "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
        )
        .map(() => err as unknown)
        .flatMap(Effect.die)
    )
}
