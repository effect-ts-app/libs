/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Option } from "@fp-ts/data/Option"

export { Option as Opt } from "@fp-ts/data/Option"

/**
 * @tsplus static fp-ts/data/Option.Ops omitableToNullable
 */
export function omitableToNullable<T>(om: Option<T> | undefined) {
  return om ?? Option.fromNullable(om)
}

/**
 * @tsplus static fp-ts/data/Option.Ops toBool
 */
export const toBool = Option.match(
  () => false,
  () => true
)

/**
 * @tsplus static fp-ts/data/Option.Ops fromBool
 */
export const fromBool = (b: boolean) => (b ? Option.some(true) : Option.none)

/**
 * Access property, unwrapping Options along the path
 */
export function p<T, K extends KeysMatching<T, Option<any>>>(
  k: K
): (v: Option<T>) => Option<_A<T[K]>>
export function p<T, K extends keyof T>(k: K): (v: Option<T>) => Option<T[K]>
export function p<T>(k: any) {
  return (v: Option<T>) => v.flatMap(a => convert(a[k]))
}
function convert(a: any) {
  return Option.isSome(a) || Option.isNone(a) ? a : Option.fromNullable(a)
}
export type _A<A> = A extends Some<infer Y> ? Y : never
type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

export const PartialExceptionTypeId = Symbol()
export type PartialExceptionTypeId = typeof PartialExceptionTypeId

export class PartialException {
  readonly _typeId: PartialExceptionTypeId = PartialExceptionTypeId
}

function raisePartial<X>(): X {
  throw new PartialException()
}

/**
 * Simulates a partial function
 * @tsplus static fp-ts/data/Option.Ops partial
 */
export function partial<ARGS extends any[], A>(
  f: (miss: <X>() => X) => (...args: ARGS) => A
): (...args: ARGS) => Option<A> {
  return (...args) => {
    try {
      return Option.some(f(raisePartial)(...args))
    } catch (e) {
      if (e instanceof PartialException) {
        return Option.none
      }
      throw e
    }
  }
}
