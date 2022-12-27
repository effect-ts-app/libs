import * as ARR from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { Predicate, Refinement } from "@effect-ts/system/Function"

import type { Opt } from "../../Option.js"

export function find_<A, B extends A>(
  as: Set<A>,
  refinement: Refinement<A, B>
): B | undefined
export function find_<A>(set: Set<A>, predicate: Predicate<A>): A | undefined
export function find_<A>(set: Set<A>, predicate: Predicate<A>) {
  return [...set].find(predicate)
}

export function findFirst_<A, B extends A>(
  set: Set<A>,
  refinement: Refinement<A, B>
): Opt<B>
export function findFirst_<A>(set: Set<A>, predicate: Predicate<A>): Opt<A>
export function findFirst_<A>(set: Set<A>, predicate: Predicate<A>): Opt<A> {
  return ARR.find_([...set], predicate)
}

export function findFirstMap_<A, B>(
  set: Set<A>,
  f: (a: A) => Opt<B>
): Opt<B> {
  return ARR.findFirstMap_([...set], f)
}
