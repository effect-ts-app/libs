import { Option } from "@effect-ts/core"

/**
 * @tsplus static effect/Maybe.Ops fromOption
 * @tsplus getter ets/Maybe toMaybe
 */
export function fromOption<A>(o: Option.Option<A>) {
  return o._tag === "None" ? Maybe.none : Maybe.some(o.value)
}
