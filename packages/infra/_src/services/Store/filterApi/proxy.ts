import type { FieldValues } from "../../../filter/types.js"
import type { FieldPath } from "../../../filter/types/path/eager.js"

type NullOrUndefined<T, Fallback> = null extends T ? null : undefined extends T ? null : Fallback

// TODO: includes | notIncludes
export type Ops =
  | "endsWith"
  | "startsWith"
  | "notEndsWith"
  | "notStartsWith"
  | "contains"
  | "notContains"
  | "in"
  | "notIn"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
type F<T extends FieldValues> = {
  path: FieldPath<T>
  op: Ops
  value: string
} /* | {
  op: "in" | "notIn"
  path: FieldPath<T>
  value: readonly string[]
}*/

type G<T extends FieldValues, Val> = {
  (value: Val): F<T>
  startsWith: (value: string) => F<T>
  notStartsWith: (value: string) => F<T>
  endsWith: (value: string) => F<T>
  notEndsWith: (value: string) => F<T>
  contains: (value: string) => F<T>
  notContains: (value: string) => F<T>
  in: (...value: readonly string[]) => F<T>
  notIn: (...value: readonly string[]) => F<T>
  eq: (value: Val) => F<T>
  neq: (value: Val) => F<T>
  gt: (value: Val) => F<T>
  gte: (value: Val) => F<T>
  lt: (value: Val) => F<T>
  lte: (value: Val) => F<T>
}

export type Filter<T extends FieldValues, Ext = never> = {
  [K in keyof T]-?: [T[K]] extends [Record<any, any> | undefined | null]
    ? Filter<T[K], NullOrUndefined<T[K], Ext>> & G<T, T[K] | Ext>
    : [T[K]] extends [Record<any, any>] ? Filter<T[K], NullOrUndefined<T[K], Ext>> & G<T, T[K] | Ext>
    : G<T, T[K] | Ext>
}
const ops: Ops[] = [
  "contains",
  "startsWith",
  "endsWith",
  "notContains",
  "notStartsWith",
  "notEndsWith",
  "in",
  "notIn",
  "eq",
  "neq",
  "gte",
  "gt",
  "lt",
  "lte"
]
export const makeProxy = (parentProp?: string): any =>
  new Proxy(
    Object.assign(() => {}, {
      _proxies: {} as Record<string, any>
    }),
    {
      apply(_target, _thisArg, argArray) {
        return ({ op: "eq", value: argArray[0], path: parentProp })
      },
      get(target, prop) {
        if (typeof prop !== "string") return undefined
        if (target._proxies[prop]) {
          return target._proxies[prop]
        }

        if (ops.includes(prop as any)) {
          return (value: any) => ({ op: prop, path: parentProp, value })
        }
        let fullProp = prop
        if (parentProp) {
          fullProp = `${parentProp}.${prop}`
        }
        const p = makeProxy(fullProp)
        target._proxies[prop] = p
        return p
      }
    }
  )
