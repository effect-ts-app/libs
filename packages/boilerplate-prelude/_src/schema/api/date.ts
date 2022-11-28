/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-ts-app/core/Function"
import { arbitrary, date, encoder, leafE, parseDateE, Parser, parser } from "@effect-ts-app/schema"
import * as Th from "@effect-ts-app/schema/custom/These"

import { todayAtUTCNoon } from "../../utils.js"

export { matchTag } from "@effect-ts/core/Utils"

// workaround for strange date extension issue.
const subNow = (amount: number): Date => todayAtUTCNoon().subDays(amount)
const addNow = (amount: number): Date => todayAtUTCNoon().addDays(amount)

const dateParser = Parser.for(date)

function isProbablyADate(u: unknown): u is Date {
  return (u instanceof Object && "toISOString" in u && "getTime" in u)
}

/**
 * As we want to use actual Date Objects in inputs,
 * and instead of leveraging the parser as a decoder from JSON, we wish to use it as a validator from Inputs.
 * This won't work with JSON because a Date is represented as an ISO string inside JSON, and when JSON is parsed, it remains a string.
 */
export const inputDate = pipe(
  date,
  parser((u, env) =>
    // if it quacks like a ... Date..
    u instanceof Date || isProbablyADate(u)
      ? Number.isNaN(u.getTime())
        ? Th.fail(leafE(parseDateE(u)))
        : Th.succeed(u)
      : dateParser(u, env)
  ),
  encoder((i): Date => i.toISOString() as unknown as Date /* sue me*/),
  arbitrary(FC =>
    FC.date({
      min: subNow(350),
      max: addNow(350)
    })
  )
)

export type inputDate = Date
export type InputDate = inputDate

export const reasonablePastDate = date["|>"](
  arbitrary(FC =>
    FC.date({
      min: subNow(350),
      max: subNow(1)
    })
  )
)
export type reasonablePastDate = Date
export type ReasonablePastDate = reasonablePastDate

export const reasonableFutureDate = date["|>"](
  arbitrary(FC =>
    FC.date({
      min: addNow(350),
      max: addNow(1)
    })
  )
)
export type ReasonableFutureDate = Date

export const reasonableDate = date["|>"](
  arbitrary(FC =>
    FC.date({
      min: subNow(350),
      max: addNow(350)
    })
  )
)
export type reasonableDate = Date
export type ReasonableDate = reasonableDate
