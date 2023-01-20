import { Option } from "../Prelude.js"

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
