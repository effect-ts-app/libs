/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as O from "@effect-ts/core/Option"

export * from "./MaybeBase.js"

export const fromBool = (b: boolean) => (b ? O.some(true) : O.none)

/**
 * Access property, unwrapping Maybes along the path
 */
export function p<T, K extends KeysMatching<T, Maybe<any>>>(
  k: K
): (v: Maybe<T>) => Maybe<_A<T[K]>>
export function p<T, K extends keyof T>(k: K): (v: Maybe<T>) => Maybe<T[K]>
export function p(k: any) {
  return (v: any) => O.chain_<any, any>(v, (a) => convert(a[k]))
}
function convert(a: any) {
  return O.isSome(a) || O.isNone(a) ? a : O.fromNullable(a)
}
export type _A<A> = A extends O.Some<infer Y> ? Y : never
type KeysMatching<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]

export * as $ from "./MaybeAspects.js"
