import { typedKeysOf } from "@effect-ts-app/core/utils"
import * as Tuple from "@effect-ts/core/Collections/Immutable/Tuple"

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

type Key<T> = T extends Record<infer TKey, any> ? TKey : never
type Values<T> =  T extends { [s: string]: infer S } ? S : any

function object_$<T extends object>(self: T) {
  return {
    get subject() {
      return self
    },

    // TODO: move to extensions
    spread<P>(this: void, fnc: (t: T) => P) {
      return spread(self, fnc)
    },
    spreadS(this: void, fnc: (t: T) => T) {
      return spreadS(self, fnc)
    },
  }
}

type BasicObjectOps<T extends object> = ReturnType<typeof object_$<T>>

/**
 * @tsplus getter Object $$
 */
export function object$<T extends object>(self: T): ObjectOps<T> { return object_$(self) }

/**
 * @tsplus type Object.Ops
 */
export interface ObjectOps<T extends object> extends BasicObjectOps<T> {}

function entries<TT extends object>(o: TT): [Key<TT>, Values<TT>][] {
  return Object.entries(o) as any
}


/**
 * @tsplus getter Object.Ops entries
 */
export function RecordEntries<TT extends object>(o: ObjectOps<TT>) {
  return entries(o.subject)
}

/**
 * @tsplus getter Object.Ops keys
 */
export function RecordKeys<TT extends object>(o: ObjectOps<TT>) {
  return typedKeysOf(o.subject)
}

/**
 * @tsplus getter Object.Ops values
 */
export function RecordValues<TT extends object>(o: ObjectOps<TT>): Values<TT>[] {
  return Object.values(o.subject)
}

/**
 * @tsplus getter Object.Ops pretty
 */
export function RecordPretty<TT extends object>(o: ObjectOps<TT>) {
  return pretty(o.subject)
}


export function makeAzureFriendly(path: string) {
  return path.replace(/\//g, "___SL@SH___")
}

export function undoAzureFriendly<T extends string>(path: T): T {
  return path.replace(/___SL@SH___/g, "/") as T
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
  return (arrInput: ReadonlyArray<T | undefined>): Maybe<ReadonlyArray<T>> => {
    const ar = [...arrInput]
    const index = ar.findIndex(x => x === el)
    if (index === -1) {
      return Maybe.none
    }
    return Maybe(arrayMoveDropUndefined(ar, index, newIndex))
  }
}

export function setMoveElDropUndefined<T>(el: T, newIndex: number) {
  return (arrInput: ReadonlySet<T | undefined>): Maybe<ReadonlySet<T>> =>
    [...arrInput]["|>"](arMoveElDropUndefined(el, newIndex)).map(ar => new Set(ar))
}
export * from "@effect-ts-app/core/utils"
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

export function lazyGetter<T extends object, T2>(creator: (target: T) => T2) {
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

export function pretty(o: unknown) {
  return JSON.stringify(o, undefined, 2)
}


// added readonly or it won't work with readonly types
export function isTuple(self: unknown): self is Tuple.Tuple<readonly unknown[]> {
  return typeof self === "object" && self != null && Tuple.TupleSym in self
}

export function exhaustiveMatch<T extends string>() {
  return <Out extends Record<T, (t: T) => any>>(handlers: Out) => (t: T): ReturnType<Out[keyof Out]> => handlers[t](t)
}

export function exhaustiveMatch_<T extends string>(t: T) {
  return <Out extends Record<T, (t: T) => any>>(handlers: Out): ReturnType<Out[keyof Out]> => handlers[t](t)
}
