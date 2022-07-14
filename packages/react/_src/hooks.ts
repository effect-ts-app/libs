import { Cause } from "@effect-ts/core/Effect/Cause"
import * as Ex from "@effect-ts/core/Effect/Exit"
import { Exit } from "@effect-ts/core/Effect/Exit"
import * as Ei from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"
import { equals } from "@effect-ts/system/Structural/HasEquals"
import React from "react"

export type PromiseExit<E = unknown, A = unknown> = Promise<Exit<E, A>>

export function onFail<E, T>(cb: (a: Cause<E>) => T) {
  return Ex.fold<E, unknown, T, void>(cb, () => void 0)
}

export function onSuccess<A, T>(cb: (a: A) => T) {
  return Ex.fold<unknown, A, void, T>(() => void 0, cb)
}

/**
 *
const something = {}
assert.strictEqual(shallowEqual({ a: O.none }, { a: O.none }), true)
assert.strictEqual(shallowEqual({ a: O.some(1)}, { a: O.some(1) }), true)
assert.strictEqual(shallowEqual({ a: O.some(something)}, { a: O.some(something) }), true)
assert.strictEqual(shallowEqual({ a: O.some(something)}, { a: O.none }), false)

assert.strictEqual(shallowEqual({ a: Ei.left(something)}, { a: Ei.left(something) }), true)
assert.strictEqual(shallowEqual({ a: Ei.right(something)}, { a: Ei.left(something) }), false)
assert.strictEqual(shallowEqual({ a: Ei.left(1)}, { a: Ei.left(2) }), false)
assert.strictEqual(shallowEqual({ a: Ei.right(1)}, { a: Ei.right(2) }), false)

// Works by default
assert.strictEqual(shallowEqual(1, 1), true)
assert.strictEqual(shallowEqual(1, 0), false)
assert.strictEqual(shallowEqual(O.none, O.none), true)
assert.strictEqual(shallowEqual(O.some(something), O.some(something)), true)
assert.strictEqual(shallowEqual(O.some(something), O.none), false)

assert.strictEqual(shallowEqual(Ei.left(something), Ei.left(something)), true)
assert.strictEqual(shallowEqual(Ei.right(something), Ei.left(something)), false)
assert.strictEqual(shallowEqual(Ei.left(1), Ei.left(2)), false)
assert.strictEqual(shallowEqual(Ei.right(1), Ei.right(2)), false)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shallowEqual(objA: any, objB: any) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.hasOwnProperty.call(objB, keysA[i])) {
      return false
    }
    // supports effect-ts hash and equals implementations
    if (!equals(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memo<T extends React.ComponentType<any>>(f: T) {
  return React.memo(f, shallowEqual)
}

export function useEffect(effect: React.EffectCallback, deps: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useEffect(effect, mapDeps(deps))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(callback, mapDeps(deps))
}

export function useMemo<T>(factory: () => T, deps: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, mapDeps(deps))
}

function mapDeps(deps: React.DependencyList) {
  return deps.map(convertDep)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertDep(x: any) {
  return typeof x !== "object" || x === null
    ? x
    : O.isSome(x) || O.isNone(x)
    ? O.toNullable(x)
    : Ei.isLeft(x)
    ? x.left
    : Ei.isRight(x)
    ? x.right
    : x
}
