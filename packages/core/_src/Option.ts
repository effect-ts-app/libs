/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Option as Opt } from "@fp-ts/data/Option"

/**
 * @tsplus static fp-ts/data/Option.Ops omitableToNullable
 */
export function omitableToNullable<T>(om: Opt<T> | undefined) {
  return om ?? Opt.fromNullable(om)
}

/**
 * @tsplus static fp-ts/data/Option.Ops toBool
 */
export const toBool = Opt.match(
  () => false,
  () => true
)

/**
 * @tsplus static fp-ts/data/Option.Ops fromBool
 */
export const fromBool = (b: boolean) => (b ? Opt.some(true) : Opt.none)

/**
 * Access property, unwrapping Options along the path
 */
export function p<T, K extends KeysMatching<T, Opt<any>>>(
  k: K
): (v: Opt<T>) => Opt<_A<T[K]>>
export function p<T, K extends keyof T>(k: K): (v: Opt<T>) => Opt<T[K]>
export function p<T>(k: any) {
  return (v: Opt<T>) => v.flatMap(a => convert(a[k]))
}
function convert(a: any) {
  const aa = a as Opt<any>
  return aa.isSome() || aa.isNone() ? a : Opt.fromNullable(a)
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
): (...args: ARGS) => Opt<A> {
  return (...args) => {
    try {
      return Opt.some(f(raisePartial)(...args))
    } catch (e) {
      if (e instanceof PartialException) {
        return Opt.none
      }
      throw e
    }
  }
}
