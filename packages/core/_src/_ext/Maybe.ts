import { Option } from "@effect-ts/core"

/**
 * @tsplus getter Maybe toOption
 * @tsplus static ets/Maybe.Ops toOption
 */
export function toOption<A>(o: Maybe<A>): Option.Option<A> {
  return o._tag === "None" ? Option.none : Option.some(o.value)
}

/**
 * @tsplus static Maybe.Ops fromOption
 * @tsplus getter ets/Maybe toMaybe
 */
export function fromOption<A>(o: Option.Option<A>) {
  return o._tag === "None" ? Maybe.none : Maybe.some(o.value)
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
 * @tsplus static Maybe.Ops partial
 */
export function partial<ARGS extends any[], A>(
  f: (miss: <X>() => X) => (...args: ARGS) => A
): (...args: ARGS) => Maybe<A> {
  return (...args) => {
    try {
      return Maybe.some(f(raisePartial)(...args))
    } catch (e) {
      if (e instanceof PartialException) {
        return Maybe.none
      }
      throw e
    }
  }
}
