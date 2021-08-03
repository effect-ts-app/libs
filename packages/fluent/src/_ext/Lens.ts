import * as LNS from "@effect-ts/monocle/Lens"
import { Lens } from "@effect-ts/monocle/Lens"

export const modify_ = <S, A>(sa: Lens<S, A>, f: (a: A) => A) => LNS.modify(f)(sa)

export const prop_ = <S, A, P extends keyof A>(sa: Lens<S, A>, prop: P) =>
  LNS.prop<A, P>(prop)(sa)
