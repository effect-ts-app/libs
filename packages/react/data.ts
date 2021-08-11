/* eslint-disable @typescript-eslint/ban-types */
import { Tagged } from "@effect-ts/core/Case"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"
import * as T from "@effect-ts-app/core/Effect"
import * as O from "@effect-ts-app/core/Option"
import { useCallback, useEffect, useRef, useState } from "react"

import { ServiceContext } from "./context"

export { matchTag } from "@effect-ts/core/Utils"

export class Initial extends Tagged("Initial")<{}> {}

export class Loading extends Tagged("Loading")<{}> {}

export class Done<E, A> extends Tagged("Done")<{
  readonly current: E.Either<E, A>
  readonly previous: O.Option<A>
}> {
  static succeed<A, E = never>(a: A) {
    return new Done<E, A>({ current: E.right(a), previous: O.none })
  }
  static fail<E, A = never>(e: E, previous?: A) {
    return new Done<E, A>({
      current: E.left(e),
      previous: previous === undefined ? O.none : O.some(previous),
    })
  }

  static refresh<E, A>(d: Done<E, A>) {
    return new Refreshing(d)
  }
}

export class Refreshing<E, A> extends Tagged("Refreshing")<{
  readonly current: E.Either<E, A>
  readonly previous: O.Option<A>
}> {
  static succeed<A, E = never>(a: A) {
    return new Refreshing<E, A>({ current: E.right(a), previous: O.none })
  }
  static fail<E, A = never>(e: E, previous?: A) {
    return new Refreshing<E, A>({
      current: E.left(e),
      previous: previous === undefined ? O.none : O.some(previous),
    })
  }
  static fromDone<E, A>(d: Done<E, A>) {
    return new Refreshing(d)
  }
}

export type QueryResult<E, A> = Initial | Loading | Refreshing<E, A> | Done<E, A>

export function isSuccess<E, A>(
  qr: QueryResult<E, A>
): qr is (Done<E, A> | Refreshing<E, A>) & { current: E.Right<A> } {
  return (qr._tag === "Done" || qr._tag === "Refreshing") && qr.current._tag === "Right"
}

export function isFailed<E, A>(
  qr: QueryResult<E, A>
): qr is (Done<E, A> | Refreshing<E, A>) & { current: E.Left<E> } {
  return (qr._tag === "Done" || qr._tag === "Refreshing") && qr.current._tag === "Left"
}

export type ResultTuple<Result> = readonly [result: Result, refresh: () => void]
export type QueryResultTuple<E, A> = ResultTuple<QueryResult<E, A>>

export const { fail, succeed } = Done

export function makeUseQuery<R>(useServiceContext: () => ServiceContext<R>) {
  /**
   * Takes an Effect and turns it into a QueryResult and refresh function.
   *
   * NOTE:
   * Pass a stable Effect, otherwise will request at every render.
   * E.g memoize for a parameterised effect:
   * ```
   *  const findSomething = useMemo(() => Something.find(id), [id])
   *  const [result] = useQuery(findSomething)
   * ```
   */
  return <E, A>(self: T.Effect<R, E, A>): QueryResultTuple<E, A> => {
    const { runWithErrorLog } = useServiceContext()
    const resultInternal = useRef<QueryResult<E, A>>(new Initial())
    const [result, setResult] = useState<QueryResult<E, A>>(resultInternal.current)
    const [signal, setSignal] = useState(() => Symbol())
    const refresh = useCallback(() => setSignal(Symbol()), [])

    useEffect(() => {
      const set = (result: QueryResult<E, A>) =>
        setResult((resultInternal.current = result))

      set(
        resultInternal.current._tag === "Initial" ||
          resultInternal.current._tag === "Loading"
          ? new Loading()
          : new Refreshing(resultInternal.current)
      )

      return runWithErrorLog(pipe(queryResult(self), T.map(set)))
    }, [self, runWithErrorLog, signal])

    return [result, refresh] as const
  }
}

export function queryResult<R, E, A>(
  self: T.Effect<R, E, A>
): T.Effect<R, never, QueryResult<E, A>> {
  return self["|>"](T.fold(fail, succeed))
}

export function matchQuery<E, A, Result>(_: {
  Initial: () => Result
  Loading: () => Result
  Error: (e: E, previous: O.Option<A>, isRefreshing: boolean) => Result
  Success: (a: A, isRefreshing: boolean) => Result
}) {
  return (r: QueryResult<E, A>) =>
    r["|>"](
      matchTag({
        Initial: _.Initial,
        Loading: _.Loading,
        Refreshing: (r) =>
          r.current["|>"](
            E.fold(
              (e) => _.Error(e, r.previous, true),
              (a) => _.Success(a, true)
            )
          ),
        Done: (r) =>
          r.current["|>"](
            E.fold(
              (e) => _.Error(e, r.previous, false),
              (a) => _.Success(a, false)
            )
          ),
      })
    )
}
