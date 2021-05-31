/* eslint-disable @typescript-eslint/no-explicit-any */
import * as E from "@effect-ts/core/Either"
import { Has, Tag } from "@effect-ts/core/Has"
import {
  accessService,
  accessServiceM,
  chain_,
  fail,
  mapError,
  succeed,
  succeedWith,
  Sync,
} from "@effect-ts/core/Sync"

export type ShapeFn<T> = Pick<
  T,
  {
    [k in keyof T]: T[k] extends (
      ...args: infer ARGS
    ) => Sync<infer R, infer E, infer A>
      ? ((...args: ARGS) => Sync<R, E, A>) extends T[k]
        ? k
        : never
      : never
  }[keyof T]
>

export type ShapeCn<T> = Pick<
  T,
  {
    [k in keyof T]: T[k] extends Sync<any, any, any> ? k : never
  }[keyof T]
>

export type ShapePu<T> = Omit<
  T,
  | {
      [k in keyof T]: T[k] extends (...args: any[]) => any ? k : never
    }[keyof T]
  | {
      [k in keyof T]: T[k] extends Sync<any, any, any> ? k : never
    }[keyof T]
>

export type DerivedLifted<
  T,
  Fns extends keyof ShapeFn<T>,
  Cns extends keyof ShapeCn<T>,
  Values extends keyof ShapePu<T>
> = {
  [k in Fns]: T[k] extends (...args: infer ARGS) => Sync<infer R, infer E, infer A>
    ? (...args: ARGS) => Sync<R & Has<T>, E, A>
    : never
} &
  {
    [k in Cns]: T[k] extends Sync<infer R, infer E, infer A>
      ? Sync<R & Has<T>, E, A>
      : never
  } &
  {
    [k in Values]: Sync<Has<T>, never, T[k]>
  }

export type IO<E, A> = Sync<unknown, E, A>
export type RIO<R, A> = Sync<R, never, A>
export type UIO<A> = Sync<unknown, never, A>

export const encaseEither = <E, A>(ei: E.Either<E, A>): IO<E, A> =>
  E.fold_(ei, fail, succeed)

export function deriveLifted<T>(
  H: Tag<T>
): <
  Fns extends keyof ShapeFn<T> = never,
  Cns extends keyof ShapeCn<T> = never,
  Values extends keyof ShapePu<T> = never
>(
  functions: Fns[],
  constants: Cns[],
  values: Values[]
) => DerivedLifted<T, Fns, Cns, Values> {
  return (functions, constants, values) => {
    const ret = {} as any

    for (const k of functions) {
      ret[k] = (...args: any[]) => accessServiceM(H)((h) => h[k](...args))
    }

    for (const k of constants) {
      ret[k] = accessServiceM(H)((h) => h[k])
    }

    for (const k of values) {
      ret[k] = accessService(H)((h) => h[k])
    }

    return ret as any
  }
}

export const orDie = mapError((err) => {
  throw err
})

/**
 * Lifts an `Either` into a `Sync` value.
 */
export function fromEither<E, A>(f: () => E.Either<E, A>) {
  return chain_(succeedWith(f), E.fold(fail, succeed))
}

export * from "@effect-ts/core/Sync"
