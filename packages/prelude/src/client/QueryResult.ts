// TODO: Convert to effect/core

/* eslint-disable @typescript-eslint/ban-types */
import type { Cause } from "@effect-app/core"
import { Data, Effect, Option } from "@effect-app/core"
import * as Either from "effect/Either"

// TODO: re-eval https://github.com/tim-smart/effect-rx/blob/main/packages/rx/src/Result.ts
export class Initial extends Data.TaggedClass("Initial")<{}> {}

export class Loading extends Data.TaggedClass("Loading")<{}> {}

export class Refreshing<E, A> extends Data.TaggedClass("Refreshing")<{
  readonly current: Either.Either<A, Cause.Cause<E>>
  readonly previous: Option<A>
}> {
  static succeed<A, E = never>(a: A) {
    return new Refreshing<E, A>({ current: Either.right(a), previous: Option.none() })
  }
  static fail<E, A = never>(e: Cause.Cause<E>, previous?: A) {
    return new Refreshing<E, A>({
      current: Either.left(e),
      previous: previous === undefined ? Option.none() : Option.some(previous)
    })
  }
  static fromDone<E, A>(d: Done<E, A>) {
    return new Refreshing(d)
  }
}

export class Done<E, A> extends Data.TaggedClass("Done")<{
  readonly current: Either.Either<A, Cause.Cause<E>>
  readonly previous: Option<A>
}> {
  static succeed<A, E = never>(this: void, a: A) {
    return new Done<E, A>({ current: Either.right(a), previous: Option.none() })
  }
  static fail<E, A = never>(this: void, e: Cause.Cause<E>, previous?: A) {
    return new Done<E, A>({
      current: Either.left(e),
      previous: previous === undefined ? Option.none() : Option.some(previous)
    })
  }

  static refresh<E, A>(d: Done<E, A>) {
    return new Refreshing(d)
  }
}

/**
 * @tsplus type QueryResult
 */
export type QueryResult<E, A> = Initial | Loading | Refreshing<E, A> | Done<E, A>

type Result<E, A> = Omit<Done<E, A>, "current"> | Omit<Refreshing<E, A>, "current">

/**
 * @tsplus fluent QueryResult isSuccess
 */
export function isSuccess<E, A>(
  qr: QueryResult<E, A>
): qr is Result<E, A> & { current: Either.Right<Cause.Cause<E>, A> } {
  return hasValue(qr) && Either.isRight(qr.current)
}

/**
 * @tsplus fluent QueryResult hasValue
 */
export function hasValue<E, A>(
  qr: QueryResult<E, A>
): qr is Done<E, A> | Refreshing<E, A> {
  return isDone(qr) || isRefreshing(qr)
}

/**
 * @tsplus fluent QueryResult isRefreshing
 */
export function isRefreshing<E, A>(
  qr: QueryResult<E, A>
): qr is Refreshing<E, A> {
  return qr._tag === "Refreshing"
}

/**
 * @tsplus fluent QueryResult isDone
 */
export function isDone<E, A>(
  qr: QueryResult<E, A>
): qr is Done<E, A> {
  return qr._tag === "Done"
}

/**
 * @tsplus fluent QueryResult isInitializing
 */
export function isInitializing<E, A>(
  qr: QueryResult<E, A>
): qr is Initial | Loading {
  return qr._tag === "Initial" || qr._tag === "Loading"
}

/**
 * @tsplus fluent QueryResult isFailed
 */
export function isFailed<E, A>(
  qr: QueryResult<E, A>
): qr is Result<E, A> & { current: Either.Left<Cause.Cause<E>, A> } {
  return hasValue(qr) && Either.isLeft(qr.current)
}

export type ResultTuple<Result> = readonly [result: Result, refresh: () => void]
export type QueryResultTuple<E, A> = ResultTuple<QueryResult<E, A>>

export const { fail, succeed } = Done

/**
 * @tsplus getter effect/io/Effect asQueryResult
 */
export function queryResult<R, E, A>(
  self: Effect<A, E, R>
): Effect<QueryResult<E, A>, never, R> {
  return Effect.match(self, { onFailure: fail, onSuccess: succeed })
}
