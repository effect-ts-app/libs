/* eslint-disable @typescript-eslint/no-explicit-any */
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { Misc, Union } from "ts-toolbelt"

import * as O from "./Option"
import * as SET from "./Set"

// type SomeObject = {
//   0: O.Option<string>
//   a: {
//     b: O.Option<string>
//     g: O.Option<O.Option<string>>
//     h: O.Option<{ i: O.Option<boolean> }>
//   }
//   c: { d: Array<O.Option<{ e: O.Option<boolean> }>> }
// }
// type test0 = Transform<SomeObject>
// type test1 = Transform<SomeObject[]>

type OptionOf<A> = Union.Exclude<A extends O.Some<infer X> ? X | null : A, O.None>
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export type TransformRoot<O> = O extends O.Option<any>
  ? Transform<OptionOf<O>>
  : Transform<O>
export type Transform<O> = O extends Misc.BuiltIn | Misc.Primitive
  ? O
  : {
      [K in keyof O]: OptionOf<O[K]> extends infer X
        ? X extends (infer Y)[]
          ? OptionOf<Transform<Y>>[]
          : X extends NA.NonEmptyArray<infer Y>
          ? NA.NonEmptyArray<OptionOf<Transform<Y>>>
          : X extends SET.Set<infer Y>
          ? SET.Set<OptionOf<Transform<Y>>>
          : X extends readonly (infer Y)[]
          ? readonly OptionOf<Transform<Y>>[]
          : Transform<X>
        : never
    }

export const encodeOptionsAsNullable = <T>(root: T): TransformRoot<T> =>
  encodeOptionsAsNullable_(root, new Map())

const encodeOptionsAsNullable_ = (value: any, cacheMap: Map<any, any>): any => {
  const cacheEntry = cacheMap.get(value)
  if (cacheEntry) {
    return cacheEntry
  }

  if (Array.isArray(value)) {
    const newAr: typeof value = []
    cacheMap.set(value, newAr)
    value.forEach((x) => newAr.push(encodeOptionsAsNullable_(x, cacheMap)))
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
      return encodeOptionsAsNullable_(O.toNullable(value), cacheMap)
    }
    const newObj = {} as Record<string, any>
    cacheMap.set(value, newObj)

    Object.keys(value).forEach((key) => {
      newObj[key] = encodeOptionsAsNullable_(value[key], cacheMap)
    })
    return newObj
  }
  return value
}
