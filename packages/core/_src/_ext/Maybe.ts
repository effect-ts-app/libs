import { Option } from "@effect-ts/core"

/**
 * @tsplus getter Opt toOption
 * @tsplus static ets/Opt.Ops toOption
 */
export function toOption<A>(o: Opt<A>): Option.Option<A> {
  return o._tag === "None" ? Option.none : Option.some(o.value)
}

/**
 * @tsplus static Opt.Ops fromOption
 * @tsplus getter ets/Opt toOpt
 */
export function fromOption<A>(o: Option.Option<A>) {
  return o._tag === "None" ? Opt.none : Opt.some(o.value)
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
 * @tsplus static Opt.Ops partial
 */
export function partial<ARGS extends any[], A>(
  f: (miss: <X>() => X) => (...args: ARGS) => A
): (...args: ARGS) => Opt<A> {
  return (...args) => {
    try {
      return Opt.some(f(raisePartial)(...args))
    } catch (e) {
      if (e instanceof PartialException) {
        return Opt.none
      }
      throw e
    }
  }
}
