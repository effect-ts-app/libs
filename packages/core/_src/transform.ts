/* eslint-disable @typescript-eslint/no-explicit-any */
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { Misc, Union } from "ts-toolbelt"

import * as O from "./Maybe.js"
import * as SET from "./Set.js"

// type SomeObject = {
//   0: O.Maybe<string>
//   a: {
//     b: O.Maybe<string>
//     g: O.Maybe<O.Maybe<string>>
//     h: O.Maybe<{ i: O.Maybe<boolean> }>
//   }
//   c: { d: Array<O.Maybe<{ e: O.Maybe<boolean> }>> }
// }
// type test0 = Transform<SomeObject>
// type test1 = Transform<SomeObject[]>

type MaybeOf<A> = Union.Exclude<A extends O.Some<infer X> ? X | null : A, O.None>
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export type TransformRoot<O> = O extends O.Maybe<any>
  ? Transform<MaybeOf<O>>
  : Transform<O>
export type Transform<O> = O extends Misc.BuiltIn | Misc.Primitive
  ? O
  : {
      [K in keyof O]: MaybeOf<O[K]> extends infer X
        ? X extends (infer Y)[]
          ? MaybeOf<Transform<Y>>[]
          : X extends NA.NonEmptyArray<infer Y>
          ? NA.NonEmptyArray<MaybeOf<Transform<Y>>>
          : X extends SET.Set<infer Y>
          ? SET.Set<MaybeOf<Transform<Y>>>
          : X extends readonly (infer Y)[]
          ? readonly MaybeOf<Transform<Y>>[]
          : Transform<X>
        : never
    }

export const encodeMaybesAsNullable = <T>(root: T): TransformRoot<T> =>
  encodeMaybesAsNullable_(root, new Map())

const encodeMaybesAsNullable_ = (value: any, cacheMap: Map<any, any>): any => {
  const cacheEntry = cacheMap.get(value)
  if (cacheEntry) {
    return cacheEntry
  }

  if (Array.isArray(value)) {
    const newAr: typeof value = []
    cacheMap.set(value, newAr)
    value.forEach((x) => newAr.push(encodeMaybesAsNullable_(x, cacheMap)))
    return newAr
  }

  if (value instanceof Date || value instanceof Function || value instanceof Promise) {
    return value
  }

  if (value instanceof Set) {
    const newValue = [...value]
    cacheMap.set(value, newValue)
    return newValue
  }

  if (value instanceof Object) {
    if (value._tag === "Some" || value._tag === "None") {
      return encodeMaybesAsNullable_(O.toNullable(value), cacheMap)
    }
    const newObj = {} as Record<string, any>
    cacheMap.set(value, newObj)

    Object.keys(value).forEach((key) => {
      newObj[key] = encodeMaybesAsNullable_(value[key], cacheMap)
    })
    return newObj
  }
  return value
}
