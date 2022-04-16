import { Lens, modify, prop } from "@effect-ts/monocle/Lens"

export const modify_ = <S, A>(sa: Lens<S, A>, f: (a: A) => A) => modify(f)(sa)

export const prop_ = <S, A, P extends keyof A>(sa: Lens<S, A>, p: P) =>
  prop<A, P>(p)(sa)
