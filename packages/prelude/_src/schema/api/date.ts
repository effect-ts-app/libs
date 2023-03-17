/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-app/core/Function"
import { arbitrary, date } from "@effect-app/schema"

import { todayAtUTCNoon } from "../../utils.js"

export { matchTag } from "@effect-app/core/utils"

// workaround for strange date extension issue.
const subNow = (amount: number): Date => todayAtUTCNoon().subDays(amount)
const addNow = (amount: number): Date => todayAtUTCNoon().addDays(amount)

/**
 * As we want to use actual Date Objects in inputs,
 * and instead of leveraging the parser as a decoder from JSON, we wish to use it as a validator from Inputs.
 * This won't work with JSON because a Date is represented as an ISO string inside JSON, and when JSON is parsed, it remains a string.
 */
export const inputDate = pipe(
  date,
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
