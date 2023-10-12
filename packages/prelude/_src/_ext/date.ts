import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subWeeks,
  subYears
} from "date-fns"

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

/**
 * @tsplus fluent Date addMinutes
 */
export const DateAddMinutes: (date: Date, amount: number) => Date = addMinutes

/**
 * @tsplus fluent Date subMinutes
 */
export const DateSubMinutes: (date: Date, amount: number) => Date = subMinutes

/**
 * @tsplus fluent Date addSeconds
 */
export const DateAddSeconds: (date: Date, amount: number) => Date = addSeconds

/**
 * @tsplus fluent Date subSeconds
 */
export const DateSubSeconds: (date: Date, amount: number) => Date = subSeconds

/**
 * @tsplus fluent Date addYears
 */
export const DateAddYears: (date: Date, amount: number) => Date = addYears

/**
 * @tsplus fluent Date subYears
 */
export const DateSubYears: (date: Date, amount: number) => Date = subYears

/**
 * @tsplus fluent Date addMonths
 */
export const DateAddMonths: (date: Date, amount: number) => Date = addMonths

/**
 * @tsplus fluent Date subMonths
 */
export const DateSubMonths: (date: Date, amount: number) => Date = subMonths

/**
 * @tsplus fluent Date addWeeks
 */
export const DateAddWeeks: (date: Date, amount: number) => Date = addWeeks

/**
 * @tsplus fluent Date subWeeks
 */
export const DateSubWeeks: (date: Date, amount: number) => Date = subWeeks
