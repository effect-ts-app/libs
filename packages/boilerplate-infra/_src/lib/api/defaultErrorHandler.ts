import type express from "express"
import type {
  InvalidStateError,
  NotFoundError,
  NotLoggedInError,
  OptimisticConcurrencyException,
  UnauthorizedError,
  ValidationError
} from "../../errors.js"
import type { RequestContext } from "../RequestContext.js"

export function defaultBasicErrorHandler<R>(
  _req: express.Request,
  res: express.Response,
  _requestContext: RequestContext,
  r2: Effect<R, ValidationError, void>
) {
  return r2
    .catchTag("ValidationError", err =>
      Effect.sync(() => {
        res.status(400).send(err.errors)
      }))
    // final catch all; expecting never so that unhandled known errors will show up
    .catchAll((err: never) =>
      Effect.logError(
        "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
      )
        .map(() => err as unknown)
        .flatMap(Effect.die)
    )
}

const optimisticConcurrencySchedule = Schedule.once &&
  Schedule.recurWhile<SupportedErrors>(a => a._tag === "OptimisticConcurrencyException")

export function defaultErrorHandler<R>(
  req: express.Request,
  res: express.Response,
  _: RequestContext,
  r2: Effect<R, SupportedErrors, void>
) {
  const r3 = (
    req.method === "PATCH"
      ? r2.retry(optimisticConcurrencySchedule)
      : r2
  )
  return r3
    .catchTag("ValidationError", err =>
      Effect.sync(() => {
        res.status(400).send(err.errors)
      }))
    .catchTag("NotFoundError", err =>
      Effect.sync(() => {
        res.status(404).send(err)
      }))
    .catchTag("NotLoggedInError", err =>
      Effect.sync(() => {
        res.status(401).send(err)
      }))
    .catchTag("UnauthorizedError", err =>
      Effect.sync(() => {
        res.status(403).send(err)
      }))
    .catchTag("InvalidStateError", err =>
      Effect.sync(() => {
        res.status(422).send(err)
      }))
    .catchTag("OptimisticConcurrencyException", err =>
      Effect.sync(() => {
        // 412 or 409.. https://stackoverflow.com/questions/19122088/which-http-status-code-to-use-to-reject-a-put-due-to-optimistic-locking-failure
        res.status(412).send(err)
      }))
    // final catch all; expecting never so that unhandled known errors will show up
    .catchAll((err: never) =>
      Effect.logError(
        "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect" + err
      )
        .map(() => err as unknown)
        .flatMap(Effect.die)
    )
}

export type SupportedErrors =
  | ValidationError
  | NotFoundError
  | NotLoggedInError
  | UnauthorizedError
  | InvalidStateError
  | OptimisticConcurrencyException
