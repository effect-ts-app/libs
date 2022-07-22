import type { None, Some } from "@effect-ts/core/Option"

export * from "@effect-ts/core/Option"

/**
 * @tsplus type ets/Maybe
 */
export type Maybe<A> = None | Some<A>
