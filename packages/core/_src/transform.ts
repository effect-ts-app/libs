/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Misc, Union } from "ts-toolbelt"

import * as O from "./Option.js"
import type * as SET from "./Set.js"

// type SomeObject = {
//   0: O.Opt<string>
//   a: {
//     b: O.Opt<string>
//     g: O.Opt<O.Opt<string>>
//     h: O.Opt<{ i: O.Opt<boolean> }>
//   }
//   c: { d: Array<O.Opt<{ e: O.Opt<boolean> }>> }
// }
// type test0 = Transform<SomeObject>
// type test1 = Transform<SomeObject[]>

type OptOf<A> = Union.Exclude<
  A extends O.Some<infer X> ? X | null : A,
  O.None
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export type TransformRoot<O> = O extends O.Opt<any> ? Transform<OptOf<O>>
  : Transform<O>
export type Transform<O> = O extends Misc.BuiltIn | Misc.Primitive ? O
  : {
    [K in keyof O]: OptOf<O[K]> extends infer X ? X extends (infer Y)[] ? OptOf<Transform<Y>>[]
    : X extends NA.NonEmptyReadonlyArray<infer Y> ? NA.NonEmptyReadonlyArray<OptOf<Transform<Y>>>
    : X extends SET.Set<infer Y> ? SET.Set<OptOf<Transform<Y>>>
    : X extends readonly (infer Y)[] ? readonly OptOf<Transform<Y>>[]
    : Transform<X>
      : never
  }

export const encodeOptsAsNullable = <T>(root: T): TransformRoot<T> => encodeOptsAsNullable_(root, new Map())

const encodeOptsAsNullable_ = (value: any, cacheMap: Map<any, any>): any => {
  const cacheEntry = cacheMap.get(value)
  if (cacheEntry) {
    return cacheEntry
  }

  if (Array.isArray(value)) {
    const newAr: typeof value = []
    cacheMap.set(value, newAr)
    value.forEach(x => newAr.push(encodeOptsAsNullable_(x, cacheMap)))
    return newAr
  }

  if (
    value instanceof Date ||
    value instanceof Function ||
    value instanceof Promise
  ) {
    return value
  }

  if (value instanceof Set) {
    const newValue = [...value]
    cacheMap.set(value, newValue)
    return newValue
  }

  if (value instanceof Object) {
    if (value._tag === "Some" || value._tag === "None") {
      return encodeOptsAsNullable_(O.getOrNull(value), cacheMap)
    }
    const newObj = {} as Record<string, any>
    cacheMap.set(value, newObj)

    Object.keys(value).forEach(key => {
      newObj[key] = encodeOptsAsNullable_(value[key], cacheMap)
    })
    return newObj
  }
  return value
}
