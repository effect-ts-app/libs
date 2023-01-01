import { Option } from "../../Prelude.js"

export function find_<A, B extends A>(
  as: ROSet<A>,
  refinement: Refinement<A, B>
): B | undefined
export function find_<A>(set: ROSet<A>, predicate: Predicate<A>): A | undefined
export function find_<A>(set: ROSet<A>, predicate: Predicate<A>) {
  return [...set].find(predicate)
}

export function findFirst_<A, B extends A>(
  set: ROSet<A>,
  refinement: Refinement<A, B>
): Option<B>
export function findFirst_<A>(set: ROSet<A>, predicate: Predicate<A>): Option<A>
export function findFirst_<A>(set: ROSet<A>, predicate: Predicate<A>): Option<A> {
  return Option.fromNullable([...set].find(predicate))
}

export function findFirstMap_<A, B>(
  set: ROSet<A>,
  f: (a: A) => Option<B>
): Option<B> {
  return [...set].findFirstMap(f)
}
