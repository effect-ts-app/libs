/* eslint-disable @typescript-eslint/no-explicit-any */
import { Misc, Union } from "ts-toolbelt"

// type SomeObject = {
//   0: Option<string>
//   a: {
//     b: Option<string>
//     g: Option<Option<string>>
//     h: Option<{ i: Option<boolean> }>
//   }
//   c: { d: Array<Option<{ e: Option<boolean> }>> }
// }
// type test0 = Transform<SomeObject>
// type test1 = Transform<SomeObject[]>

type OptionOf<A> = Union.Exclude<
  A extends Option.Some<infer X> ? X | null : A,
  Option.None
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export type TransformRoot<O> = O extends Option<any>
  ? Transform<OptionOf<O>>
  : Transform<O>
export type Transform<O> = O extends Misc.BuiltIn | Misc.Primitive
  ? O
  : {
      [K in keyof O]: OptionOf<O[K]> extends infer X
        ? X extends (infer Y)[]
          ? OptionOf<Transform<Y>>[]
          : X extends NonEmptyArray.NonEmptyArray<infer Y>
          ? NonEmptyArray.NonEmptyArray<OptionOf<Transform<Y>>>
          : X extends ROSet<infer Y>
          ? ROSet<OptionOf<Transform<Y>>>
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
      return encodeOptionsAsNullable_(Option.toNullable(value), cacheMap)
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
