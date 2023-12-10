import { assertUnreachable, get } from "@effect-app/prelude/utils"
import type { FilterR, FilterResult } from "./filterApi/query.js"
import {
  compareCaseInsensitive,
  gtCaseInsensitive,
  gteCaseInsensitive,
  ltCaseInsensitive,
  lteCaseInsensitive
} from "./utils.js"

const test = <E extends { id: string }>(p: FilterR, x: E) => {
  const k = get(x, p.path)
  switch (p.op) {
    case "in":
      return p.value.includes(k)
    case "notIn":
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
    case "notIncludes":
      return !(k as Array<string>).includes(p.value)
    case "contains":
      return (k as string).toLowerCase().includes(p.value.toLowerCase())
    case "endsWith":
      return (k as string).toLowerCase().endsWith(p.value.toLowerCase())
    case "startsWith":
      return (k as string).toLowerCase().startsWith(p.value.toLowerCase())
    case "notContains":
      return !(k as string).toLowerCase().includes(p.value.toLowerCase())
    case "notEndsWith":
      return !(k as string).toLowerCase().endsWith(p.value.toLowerCase())
    case "notStartsWith":
      return !(k as string).toLowerCase().startsWith(p.value.toLowerCase())
    case "neq":
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
    default: {
      return assertUnreachable(p.op)
    }
  }
}

// const or = <E extends { id: string }, NE extends E>(filters: readonly FilterResult[], x: E): Option<NE> =>
//   filters
//       .some((p) => {
//         if (p.t === "and-scope") {
//           return and(p.result, x)
//         }
//         if (p.t === "or-scope") {
//           return or(p.result, x)
//         }
//         if (p.t === "where-scope") {
//           return codeFilter2(filters)(x)
//         }
//         return test(p, x)
//       })
//     ? Option(x as unknown as NE)
//     : Option.none

// export const and = <E extends { id: string }, NE extends E>(filters: readonly FilterResult[], x: E): Option<NE> =>
//   filters
//       .every((p) => {
//         if (p.t === "and-scope") {
//           return and(p.result, x)
//         }
//         if (p.t === "or-scope") {
//           return or(p.result, x)
//         }
//         if (p.t === "where-scope") {
//           return codeFilter2(filters)(x)
//         }
//         return test(p, x)
//       })
//     ? Option(x as unknown as NE)
//     : Option.none

// // TODO: how to handle and/or outside scopes.
// // TODO: the scopes are not about and every, or some.. they're about logical grouping. It's a logical group + and/or etc.
// // TODO: how to convert this to code? would we compile an actual function body instead?!
// export function codeFilter2<E extends { id: string }, NE extends E>(filters: readonly FilterResult[]) {
//   // TODO: handle or, and, or-scope, and-scope, where-scope
//   return (x: E) =>
//     // AND
//     and<E, NE>(filters, x)
//   // OR
//   // or<E, NE>(filters, x)
// }

export function codeFilter3<E extends { id: string }>(filters: readonly FilterResult[]) {
  // TODO: handle or, and, or-scope, and-scope, where-scope
  return (x: E): boolean => {
    let result: null | true | false = null
    let op = "and"
    for (const f of filters) {
      if (f.t === "and" || f.t === "and-scope") {
        op = "and"
        result = result === null
          ? (f.t === "and-scope" ? codeFilter3(f.result)(x) : test(f, x))
          : result && (f.t === "and-scope"
            ? codeFilter3(f.result)(x)
            : test(f, x))
        if (!result) return false
        continue
      }
      if (f.t === "or" || f.t === "or-scope") {
        op = "or"
        result = result === null
          ? (f.t === "or-scope" ? codeFilter3(f.result)(x) : test(f, x))
          : result || (f.t === "or-scope"
            ? codeFilter3(f.result)(x)
            : test(f, x))
        if (result) return true
        continue
      }
      if (f.t === "where-scope") {
        // TODO
        // hmm, should we remember parent?
        if (op === "or") {
          result = result || codeFilter3(f.result)(x)
          if (result) return true
        } else if (op === "and") {
          result = result && codeFilter3(f.result)(x)
          if (!result) return false
        } else {
          result = codeFilter3(f.result)(x)
        }
        continue
      }
      if (op === "or") {
        result = result || test(f, x)
      } else if (op === "and") {
        result = result && test(f, x)
      } else {
        result = test(f, x)
      }
    }
    return !!result
  }
}
