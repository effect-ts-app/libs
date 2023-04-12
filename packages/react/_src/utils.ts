// eslint-disable-next-line import/no-duplicates
import { isAfter, isBefore } from "date-fns"
// eslint-disable-next-line import/no-duplicates
import { set } from "date-fns/fp"

export function assertUnreachable(x: never): never {
  throw new Error("Unknown case " + x)
}

export type OptPromise<T extends () => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>> | ReturnType<T>

export const typedValuesOf = <T extends PropertyKey, T2>(obj: Record<T, T2>) => Object.values(obj) as readonly T2[]

export function access<T extends string, T2>(t: Record<T, T2>) {
  return (key: T) => t[key] as T2
}

export function todayAtUTCNoon() {
  const localDate = new Date()
  const utcDateAtNoon = Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    12
  )
  return new Date(utcDateAtNoon)
}

export function spread<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends Record<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NewProps
>(props: Props, fnc: (props: Props) => NewProps) {
  return fnc(props)
}

export function spreadS<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends Record<any, any>
>(props: Props, fnc: (props: Props) => Props) {
  return fnc(props)
}

export function makeAzureFriendly(path: string) {
  return path.replace(/\//g, "___SL@SH___")
}

export function undoAzureFriendly<T extends string>(path: T): T {
  return path.replace(/___SL@SH___/g, "/") as T
}

export const setTimeToStartOfDay = set({
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0
})

export const setTimeToMidday = set({
  hours: 12,
  minutes: 0,
  seconds: 0,
  milliseconds: 0
})

export const setTimeToEndOfDay = set({
  hours: 23,
  minutes: 59,
  seconds: 59,
  milliseconds: 999
})

export function todayAtNoon() {
  return setTimeToMidday(new Date())
}

export function isBetween(minDate?: Date, maxDate?: Date) {
  return (d: Date) => !((minDate && isBefore(d, minDate)) || (maxDate && isAfter(d, maxDate)))
}

export function isBetweenMidnightAndEndOfDay(minDate?: Date, maxDate?: Date) {
  return isBetween(
    minDate && setTimeToStartOfDay(minDate),
    maxDate && setTimeToEndOfDay(maxDate)
  )
}

export function arrayMove<T>(
  arrInput: readonly T[],
  oldIndex: number,
  newIndex: number
) {
  const arr: (T | undefined)[] = [...arrInput]
  while (oldIndex < 0) {
    oldIndex += arr.length
  }
  while (newIndex < 0) {
    newIndex += arr.length
  }
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
  return arr
}

export function arrayMoveDropUndefined<T>(
  arrInput: readonly (T | undefined)[],
  oldIndex: number,
  newIndex: number
): T[] {
  return arrayMove(arrInput, oldIndex, newIndex).filter((x): x is T => x !== undefined)
}

export function arMoveElDropUndefined<T>(el: T, newIndex: number) {
  return (arrInput: ReadonlyArray<T | undefined>): Option<ReadonlyArray<T>> => {
    const ar = [...arrInput]
    const index = ar.findIndex((x) => x === el)
    if (index === -1) {
      return Option.none
    }
    return Option(arrayMoveDropUndefined(ar, index, newIndex))
  }
}

export function setMoveElDropUndefined<T>(el: T, newIndex: number) {
  return (arrInput: ReadonlySet<T | undefined>): Option<ReadonlySet<T>> =>
    [...arrInput]["|>"](arMoveElDropUndefined(el, newIndex)).map((ar) => new Set(ar))
}
export * from "@effect-app/core/Function"
export * from "@effect-app/core/utils"
export { default as get } from "lodash/get.js"
export { default as omit } from "lodash/omit.js"
export { default as pick } from "lodash/pick.js"

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K>
  : never

type RemoveNonArray<T> = T extends readonly any[] ? T : never
export function isNativeTuple<A>(a: A): a is RemoveNonArray<A> {
  return Array.isArray(a)
}

export const LazySymbol = Symbol("lazy")

interface Lazy {
  [LazySymbol]: Record<symbol, any>
}

export function lazy<T extends object, T2>(creator: (target: T) => T2) {
  const key = Symbol(creator.name)
  const f = (target: T): T2 => {
    let lazy = (target as unknown as Lazy)[LazySymbol]
    if (!lazy) {
      lazy = {}
      Object.defineProperty(target, LazySymbol, { enumerable: false, value: lazy })
    } else if (lazy[key]) {
      return lazy[key]
    }
    const value = creator(target)
    lazy[key] = value
    return value
  }
  Object.defineProperty(f, "name", {
    enumerable: false,
    value: `Lazy<${creator.name}>`
  })
  return f
}
