import { get } from "@effect-app/prelude/utils"
import type { FilterR, FilterResult } from "./filterApi/query.js"
import {
  compareCaseInsensitive,
  gtCaseInsensitive,
  gteCaseInsensitive,
  ltCaseInsensitive,
  lteCaseInsensitive
} from "./utils.js"

const test = <E extends { id: string }>(p: FilterR, k: E[any]) => {
  switch (p.op) {
    case "in":
      return p.value.includes(k)
    case "not-in":
      return !p.value.includes(k)
    case "lt":
      return ltCaseInsensitive(k, p.value)
    case "lte":
      return lteCaseInsensitive(k, p.value)
    case "gt":
      return gtCaseInsensitive(k, p.value)
    case "gte":
      return gteCaseInsensitive(k, p.value)
    case "includes":
      return (k as Array<string>).includes(p.value)
    case "not-includes":
      return !(k as Array<string>).includes(p.value)
    case "contains":
      return (k as string).toLowerCase().includes(p.value.toLowerCase())
    case "ends-with":
      return (k as string).toLowerCase().endsWith(p.value.toLowerCase())
    case "starts-with":
      return (k as string).toLowerCase().startsWith(p.value.toLowerCase())
    case "not-contains":
      return !(k as string).toLowerCase().includes(p.value.toLowerCase())
    case "not-ends-with":
      return !(k as string).toLowerCase().endsWith(p.value.toLowerCase())
    case "not-starts-with":
      return !(k as string).toLowerCase().startsWith(p.value.toLowerCase())
  }
}

const or = <E extends { id: string }, NE extends E>(filters: readonly FilterR[], x: E): Option<NE> =>
  filters
      .some((p) => {
        const k = get(x, p.path)
        switch (p.op) {
          case "not-eq":
            return !compareCaseInsensitive(k, p.value)
          case "eq":
          case undefined:
            return compareCaseInsensitive(k, p.value)
          default:
            return test(p, k)
        }
      })
    ? Option(x as unknown as NE)
    : Option.none

export const and = <E extends { id: string }, NE extends E>(filters: readonly FilterR[], x: E): Option<NE> =>
  filters
      .every((p) => {
        const k = get(x, p.path)
        switch (p.op) {
          case "not-eq":
            return p.path.includes(".-1.")
              ? (get(x, p.path.split(".-1.")[0]) as any[])
                // TODO: or vs and
                .every((_) => !compareCaseInsensitive(get(_, p.path.split(".-1.")[1]!), p.value))
              : !compareCaseInsensitive(k, p.value)
          case "eq":
          case undefined:
            return p.path.includes(".-1.")
              ? (get(x, p.path.split(".-1.")[0]) as any[])
                // TODO: or vs and
                .some((_) => compareCaseInsensitive(get(_, p.path.split(".-1.")[1]!), p.value))
              : compareCaseInsensitive(k, p.value)
          default:
            return test(p, k)
        }
      })
    ? Option(x as unknown as NE)
    : Option.none

export function codeFilter2<E extends { id: string }, NE extends E>(filters: readonly FilterResult[]) {
  // TODO: handle or, and, or-scope, and-scope, where-scope
  return (x: E) =>
    // OR
    or<E, NE>(filters, x)
  // AND
  // and<E, NE>(filters, x)
}
