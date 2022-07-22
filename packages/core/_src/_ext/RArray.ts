import type { Array as ROArray } from "../Prelude.js"
import { Array as ROArrayOps } from "../Prelude.js"

/**
 * @tsplus operator ets/Array &
 * @tsplus fluent ets/Array concat
 */
export function concat_<A, B>(self: ROArray<A>, that: ROArray<B>): ROArray<A | B> {
  return ROArrayOps.concat_(self, that)
}

/**
 * Concatenates two ets/Array together
 *
 * @tsplus operator ets/Array +
 */
export const concatOperator: <A>(self: ROArray<A>, that: ROArray<A>) => ROArray<A> =
  concat_

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ets/Array + 1.0
 */
export function prependOperatorStrict<A>(a: A, self: ROArray<A>): ROArray<A> {
  return ROArrayOps.prepend_(self, a)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ets/Array >
 */
export function prependOperator<A, B>(a: A, self: ROArray<B>): ROArray<A | B> {
  return prepend_(self, a)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus fluent ets/Array prepend
 */
export function prepend_<A, B>(tail: ROArray<A>, head: B): ROArray<A | B> {
  const len = tail.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i + 1] = tail[i]
  }
  r[0] = head
  return r as unknown as ROArray<A | B>
}

/**
 * Appends `a` to ROArray<A>
 *
 * @tsplus fluent ets/Array append
 * @tsplus operator ets/Array <
 */
export function append_<A, B>(init: ROArray<A>, end: B): ROArray<A | B> {
  const len = init.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = init[i]
  }
  r[len] = end
  return r as unknown as ROArray<A | B>
}

/**
 * @tsplus operator ets/Array + 1.0
 */
export const appendOperator: <A>(self: ROArray<A>, a: A) => ROArray<A> = append_
