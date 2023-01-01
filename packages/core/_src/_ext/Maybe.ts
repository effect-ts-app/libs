import { Option as OptionLegacy } from "@effect-ts/core"
import { Option } from "../Prelude.js"

/**
 * @tsplus getter Opt toOption
 * @tsplus static ets/Option.Ops toOption
 */
export function toOption<A>(o: Option<A>): OptionLegacy.Option<A> {
  return o._tag === "None" ? OptionLegacy.none : OptionLegacy.some(o.value)
}

/**
 * @tsplus static fp-ts-data/Option.Ops fromOption
 * @tsplus getter ets/Option toOpt
 */
export function fromOption<A>(o: OptionLegacy.Option<A>) {
  return o._tag === "None" ? Option.none : Option.some(o.value)
}

export const PartialExceptionTypeId = Symbol()
export type PartialExceptionTypeId = typeof PartialExceptionTypeId

export class PartialException {
  readonly _typeId: PartialExceptionTypeId = PartialExceptionTypeId
}

function raisePartial<X>(): X {
  throw new PartialException()
}

/**
 * Simulates a partial function
 * @tsplus static fp-ts/data/Option.Ops partial
 */
export function partial<ARGS extends any[], A>(
  f: (miss: <X>() => X) => (...args: ARGS) => A
): (...args: ARGS) => Option<A> {
  return (...args) => {
    try {
      return Option.some(f(raisePartial)(...args))
    } catch (e) {
      if (e instanceof PartialException) {
        return Option.none
      }
      throw e
    }
  }
}
