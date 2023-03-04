import type { Ordering } from "@effect/data/Ordering"

import * as Ord from "@effect/data/typeclass/Order"

export type { Ordering }

const compare = (x: any, y: any): Ordering => {
  return x < y ? -1 : x > y ? 1 : 0
}

/**
 * @tsplus static effect/data/typeclass/Order.Ops boolean
 */
export const boolean: Order<boolean> = { compare }

/**
 * @tsplus static effect/data/typeclass/Order.Ops number
 */

export const number: Order<number> = { compare }

/**
 * @tsplus static effect/data/typeclass/Order.Ops date
 */

export const date: Order<Date> = Ord.contramap((date: Date) => date.valueOf())(number)

/**
 * @tsplus static effect/data/typeclass/Order.Ops string
 */
export const string: Order<string> = { compare }

export * from "@effect/data/typeclass/Order"
