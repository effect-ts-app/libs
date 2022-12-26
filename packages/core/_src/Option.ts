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
export function p(k: any) {
  return (v: any) => Opt.flatMap<any, any>(a => convert(a[k]))(v)
}
function convert(a: any) {
  return Opt.isSome(a) || Opt.isNone(a) ? a : Opt.fromNullable(a)
}
export type _A<A> = A extends Opt.Some<infer Y> ? Y : never
type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]
