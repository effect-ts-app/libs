// TODO: Convert to effect/core

/* eslint-disable @typescript-eslint/ban-types */
import { Tagged } from "@effect-ts/core/Case"

import type { Left, Right } from "@tsplus/stdlib/data/Either"

export { matchTag } from "@effect-ts/core/Utils"

export class Initial extends Tagged("Initial")<{}> {}

export class Loading extends Tagged("Loading")<{}> {}

export class Refreshing<E, A> extends Tagged("Refreshing")<{
  readonly current: Either<E, A>
  readonly previous: Maybe<A>
}> {
  static succeed<A, E = never>(a: A) {
    return new Refreshing<E, A>({ current: Either.right(a), previous: Maybe.none })
  }
  static fail<E, A = never>(e: E, previous?: A) {
    return new Refreshing<E, A>({
      current: Either.left(e),
      previous: previous === undefined ? Maybe.none : Maybe.some(previous)
    })
  }
  static fromDone<E, A>(d: Done<E, A>) {
    return new Refreshing(d)
  }
}

export class Done<E, A> extends Tagged("Done")<{
  readonly current: Either<E, A>
  readonly previous: Maybe<A>
}> {
  static succeed<A, E = never>(this: void, a: A) {
    return new Done<E, A>({ current: Either.right(a), previous: Maybe.none })
  }
  static fail<E, A = never>(this: void, e: E, previous?: A) {
    return new Done<E, A>({
      current: Either.left(e),
      previous: previous === undefined ? Maybe.none : Maybe.some(previous)
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
): qr is Result<E, A> & { current: Right<A> } {
  return qr.hasValue() && qr.current.isRight()
}

/**
 * @tsplus fluent QueryResult hasValue
 */
export function hasValue<E, A>(
  qr: QueryResult<E, A>
): qr is Done<E, A> | Refreshing<E, A> {
  return qr.isDone() || qr.isRefreshing()
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
): qr is Result<E, A> & { current: Left<E> } {
  return qr.hasValue() && qr.current.isLeft()
}

export type ResultTuple<Result> = readonly [result: Result, refresh: () => void]
export type QueryResultTuple<E, A> = ResultTuple<QueryResult<E, A>>

export const { fail, succeed } = Done

/**
 * @tsplus getter effect/core/io/Effect asQueryResult
 */
export function queryResult<R, E, A>(
  self: Effect<R, E, A>
): Effect<R, never, QueryResult<E, A>> {
  return self.fold(fail, succeed)
}
