import { pretty, typedKeysOf } from "@effect-app/core/utils"
import type { Clone } from "@fp-ts/optic"
import { cloneTrait } from "@fp-ts/optic"
import type { Types } from "effect/Match"
import get from "lodash/get.js"
import omit_ from "lodash/omit.js"
import pick from "lodash/pick.js"

export function assertUnreachable(x: never): never {
  throw new Error("Unknown case " + x)
}

export const omit: {
  <T extends object, K extends PropertyKey[]>(
    object: T | null | undefined,
    ...paths: K
  ): DistributiveOmit<T, K[number]>
  <T extends object, K extends keyof T>(object: T | null | undefined, ...paths: Array<Many<K>>): DistributiveOmit<T, K>
} = omit_

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

function anyOp_$<T>(self: T) {
  return {
    get subject() {
      return self
    }
  }
}

/**
 * @tsplus getter Object $$
 * @tsplus getter number $$
 * @tsplus getter bigint $$
 * @tsplus getter boolean $$
 * @tsplus getter regexp $$
 * @tsplus getter string $$
 */
export function anyOp$<T>(self: T): AnyOps<T> {
  return anyOp_$(self)
}

/**
 * @tsplus type Any.Ops
 * @tsplus type Object.Ops
 */
export interface AnyOps<T> {
  subject: T
}

/**
 * @tsplus fluent effect/io/Effect debug
 */
export function Effect_debug<R, E, A>(self: Effect<A, E, R>, name: string) {
  return self.tap((a) => {
    let r: string | A = a
    try {
      r = pretty(a)
    } catch { /* empty */ }
    return Effect.logDebug("print").annotateLogs(name, `${r}`)
  })
}

/**
 * @tsplus fluent effect/io/Effect debugUnsafe
 */
export function Effect_debugUnsafe<R, E, A>(self: Effect<A, E, R>, name: string) {
  return self.tap((a) => Effect.sync(() => console.log(name, a)))
}

export const clone = <A extends Object>(original: A, copy: A) => {
  if (cloneTrait in (original as any)) {
    const originalWithClone = original as A & Clone
    return originalWithClone[cloneTrait](copy)
  }
  return Object.setPrototypeOf(copy, Object.getPrototypeOf(original)) as A
}

export const copy = <A extends Object>(
  original: A,
  copy: Partial<A>
): A => {
  return clone(original, { ...original, ...copy })
}

/**
 * @tsplus fluent Object.Ops clone
 */
export const $clone = <A extends Object>({ subject: original }: ObjectOps<A>, copy: A) => {
  return clone(original, copy)
}

/**
 * @tsplus fluent Object.Ops copy
 */
export const $copy = <A extends Object>(
  { subject: original }: ObjectOps<A>,
  _copy: Partial<A>
): A => {
  return copy(original, _copy)
}

/**
 * @tsplus fluent Any.Ops debug
 * @tsplus fluent Object.Ops debug
 */
export function debug<A>(a: AnyOps<A>, name: string) {
  let r: string | A = a.subject
  try {
    r = pretty(a.subject)
  } catch { /* empty */ }
  return Effect
    .logDebug("print")
    .annotateLogs(name, `${r}`)
    .map(() => a.subject)
}

/**
 * @tsplus fluent Any.Ops debugUnsafe
 * @tsplus fluent Object.Ops debugUnsafe
 */
export function debugUnsafe<A>(a: AnyOps<A>, name: string) {
  console.log(name, a.subject)
  return a.subject
}

export function spread<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fields extends Record<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NewProps
>(fields: Fields, fnc: (fields: Fields) => NewProps) {
  return fnc(fields)
}

export function spreadS<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fields extends Record<any, any>
>(fields: Fields, fnc: (fields: Fields) => Fields) {
  return fnc(fields)
}

type Key<T> = T extends Record<infer TKey, any> ? TKey : never
type Values<T> = T extends { [s: string]: infer S } ? S : any

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
    }
  }
}

type BasicObjectOps<T extends object> = ReturnType<typeof object_$<T>>

/**
 * @tsplus getter Object $$
 */
export function object$<T extends object>(self: T): ObjectOps<T> {
  return object_$(self)
}

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

type Many<T> = T | ReadonlyArray<T>

/**
 * @tsplus fluent Object.Ops omit
 */
export function RecordOmitold<TT extends object, K extends keyof TT>(o: ObjectOps<TT>, ...paths: Many<K>[]) {
  return omit(o.subject, ...paths)
}
export const RecordOmit: {
  <TT extends object, K extends PropertyKey[]>(
    object: TT,
    ...paths: K
  ): DistributiveOmit<TT, K[number]>
  <TT extends object, K extends keyof TT>(object: TT, ...paths: Array<Many<K>>): DistributiveOmit<TT, K>
} = (o: ObjectOps<any>, ...paths: Many<any>[]) => omit(o.subject, ...paths)

/**
 * @tsplus fluent Object.Ops pick
 */
export function RecordPick<TT extends object, K extends keyof TT>(o: ObjectOps<TT>, ...paths: Many<K>[]) {
  return pick(o.subject, ...paths)
}

// TODO: "get" extension

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
 * @tsplus getter Any.Ops pretty
 */
export function AnyPretty<TT>(o: AnyOps<TT>) {
  return pretty(o.subject)
}

/** @tsplus getter Object.Ops matcher */
export function matchValue<TT extends object>(o: ObjectOps<TT>) {
  return Matcher.value(o.subject)
}

/** @tsplus pipeable Object.Ops matchTags */
export function matchValueTags<
  // eslint-disable-next-line @typescript-eslint/ban-types
  const I extends Object,
  P extends
    & {
      readonly [Tag in Types.Tags<"_tag", I> & string]: (
        _: Extract<I, { readonly _tag: Tag }>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) => any
    }
    & { readonly [Tag in Exclude<keyof P, Types.Tags<"_tag", I>>]: never }
>(m: P) {
  return (o: ObjectOps<I>) => Matcher.valueTags(m)(o.subject)
}

/**
 * @tsplus getter Object.Ops pretty
 */
export function RecordPretty<TT extends object>(o: ObjectOps<TT>) {
  return pretty(o.subject)
}

export function makeAzureFriendly(path: string) {
  return path.replace(/\//g, "___SL@SH___");
}

export function undoAzureFriendly<T extends string>(path: T): T {
  return path.replace(/___SL@SH___/g, "/") as T;
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
    return Option.some(arrayMoveDropUndefined(ar, index, newIndex))
  }
}

export function setMoveElDropUndefined<T>(el: T, newIndex: number) {
  return (arrInput: ReadonlySet<T | undefined>): Option<ReadonlySet<T>> =>
    [...arrInput].pipe(arMoveElDropUndefined(el, newIndex)).map((ar) => new Set(ar))
}
export * from "@effect-app/core/utils"

export { get, pick }

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K>
  : never

type RemoveNonArray<T> = T extends readonly any[] ? T : never
export function isNativeTuple<A>(a: A): a is RemoveNonArray<A> {
  return Array.isArray(a)
}
