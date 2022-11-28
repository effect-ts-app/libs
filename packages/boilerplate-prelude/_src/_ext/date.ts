import { addDays, addHours, subDays, subHours } from "date-fns"

declare global {
  /**
   * @tsplus type Date
   */
  interface Date {}
}

/**
 * @tsplus fluent Date addDays
 */
export const DateAddDays: (date: Date, amount: number) => Date = addDays
/**
 * @tsplus fluent Date subDays
 */
export const DateSubDays: (date: Date, amount: number) => Date = subDays

/**
 * @tsplus fluent Date addHours
 */
export const DateAddHours: (date: Date, amount: number) => Date = addHours
/**
 * @tsplus fluent Date subHours
 */
export const DateSubHours: (date: Date, amount: number) => Date = subHours
