import * as ARR from "@effect-ts/core/Collections/Immutable/Array"
import { Set } from "@effect-ts/core/Collections/Immutable/Set"
import { Option } from "@effect-ts/core/Option"
import { Predicate, Refinement } from "@effect-ts/system/Function"

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
): Option<B>
export function findFirst_<A>(set: Set<A>, predicate: Predicate<A>): Option<A>
export function findFirst_<A>(set: Set<A>, predicate: Predicate<A>): Option<A> {
  return ARR.find_([...set], predicate)
}

export function findFirstMap_<A, B>(set: Set<A>, f: (a: A) => Option<B>): Option<B> {
  return ARR.findFirstMap_([...set], f)
}
