import { logError } from "@effect-app/infra/errorReporter"
import type { Schema } from "@effect-app/schema"
import { setBody, setStatus } from "@effect/platform/HttpServerResponse"
import { Cause, Data, Effect, S, Schedule } from "effect-app"
import type { SupportedErrors } from "effect-app/client/errors"
import {
  InvalidStateError,
  NotFoundError,
  NotLoggedInError,
  OptimisticConcurrencyException,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError
} from "effect-app/client/errors"
import { HttpBody, HttpHeaders, type HttpServerRequest, HttpServerResponse } from "effect-app/http"
import type {
  InsufficientScopeError,
  InvalidRequestError,
  InvalidTokenError,
  UnauthorizedError as JWTUnauthorizedError
} from "express-oauth2-jwt-bearer"
import { InfraLogger } from "../../logger.js"

export class JWTError extends Data.TaggedClass("JWTError")<{
  error:
    | InsufficientScopeError
    | InvalidRequestError
    | InvalidTokenError
    | JWTUnauthorizedError
}> {}

const logRequestError = logError("Request")

export function defaultBasicErrorHandler<R>(
  _req: HttpServerRequest.HttpServerRequest,
  res: HttpServerResponse.HttpServerResponse,
  r2: Effect<HttpServerResponse.HttpServerResponse, ValidationError, R>
) {
  const sendError = (code: number) => (body: unknown) =>
    Effect.sync(() => setBody(res, HttpBody.unsafeJson(body)).pipe(setStatus(code)))
  return r2.pipe(
    Effect.tapErrorCause((cause) => Cause.isFailure(cause) ? logRequestError(cause) : Effect.void),
    Effect.catchTag("ValidationError", (err) => sendError(400)(err.errors)),
    Effect
      // final catch all; expecting never so that unhandled known errors will show up
      .catchAll((err: never) =>
        InfraLogger
          .logError(
            "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
          )
          .pipe(
            Effect.map(() => err as unknown),
            Effect.flatMap(Effect.die)
          )
      )
  )
}

const optimisticConcurrencySchedule = Schedule.once
  && Schedule.recurWhile<{ _tag: string }>((a) => a._tag === "OptimisticConcurrencyException")

export function defaultErrorHandler<R, A extends { _tag: string } = never>(
  req: HttpServerRequest.HttpServerRequest,
  res: HttpServerResponse.HttpServerResponse,
  r2: Effect<HttpServerResponse.HttpServerResponse, SupportedErrors | JWTError, R>,
  customErrorSchema?: Schema<A, unknown>
) {
  const r3 = req.method === "PATCH"
    ? Effect.retry(r2, optimisticConcurrencySchedule)
    : r2
  const sendError = <R, From, To>(code: number, schema: Schema<To, From, R>) => (body: To) =>
    S
      .encode(schema)(body)
      .pipe(
        Effect.orDie,
        Effect.andThen((body) => res.pipe(setStatus(code), setBody(HttpBody.unsafeJson(body))))
      )
  return r3
    .pipe(
      Effect.tapErrorCause((cause) => Cause.isFailure(cause) ? logRequestError(cause) : Effect.void),
      Effect.tapErrorCause((cause) =>
        Effect.annotateCurrentSpan({
          "exception.escaped": true,
          "exception.message": "Request Error",
          "exception.stacktrace": Cause.pretty(cause),
          "exception.type": Cause.squashWith(
            cause,
            (_) => _._tag
            // Predicate.hasProperty(_, "_tag")
            //   ? _._tag
            //   : Predicate.hasProperty(_, "name")
            //   ? _.name
            //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            //   : `${_}`
          ),
          "error.type": cause._tag
        })
      ),
      Effect
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
          "ServiceUnavailableError": sendError(503, ServiceUnavailableError),
          // 412 or 409.. https://stackoverflow.com/questions/19122088/which-http-status-code-to-use-to-reject-a-put-due-to-optimistic-locking-failure
          "OptimisticConcurrencyException": sendError(412, OptimisticConcurrencyException)
        }),
      customErrorSchema
        ? Effect.catchAll((x) =>
          S.is(customErrorSchema)(x)
            // TODO: customize error code
            ? sendError(422, customErrorSchema)(x)
            : Effect.fail(x)
        )
        : (x) => x,
      Effect
        // final catch all; expecting never so that unhandled known errors will show up
        .catchAll((err: never) =>
          InfraLogger
            .logError(
              "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
            )
            .pipe(
              Effect.map(() => err as unknown),
              Effect.flatMap(Effect.die)
            )
        )
    )
}
