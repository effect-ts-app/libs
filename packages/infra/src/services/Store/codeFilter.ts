import { ReadonlyArray } from "effect-app"
import { assertUnreachable, get } from "effect-app/utils"
import type { FilterR, FilterResult } from "./filterApi/query.js"
import { compare, greaterThan, greaterThanExclusive, lowerThan, lowerThanExclusive } from "./utils.js"

export const codeFilterStatement = <E>(p: FilterR, x: E) => {
  const k = get(x, p.path)
  switch (p.op) {
    case "in":
      return p.value.includes(k)
    case "notIn":
      return !p.value.includes(k)
    case "lt":
      return lowerThan(k, p.value)
    case "lte":
      return lowerThanExclusive(k, p.value)
    case "gt":
      return greaterThan(k, p.value)
    case "gte":
      return greaterThanExclusive(k, p.value)
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
          .every((_) => !compare(get(_, p.path.split(".-1.")[1]!), p.value))
        : !compare(k, p.value)
    case "eq":
    case undefined:
      return p.path.includes(".-1.")
        ? (get(x, p.path.split(".-1.")[0]) as any[])
          // TODO: or vs and
          .some((_) => compare(get(_, p.path.split(".-1.")[1]!), p.value))
        : compare(k, p.value)
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
//         return codeFilterStatement(p, x)
//       })
//     ? Option.some(x as unknown as NE)
//     : Option.none()

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
//         return codeFilterStatement(p, x)
//       })
//     ? Option.some(x as unknown as NE)
//     : Option.none()

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

export const codeFilter3 = <E>(state: readonly FilterResult[]) => (sut: E) => codeFilter3_(state, sut)
export const codeFilter3_ = <E>(state: readonly FilterResult[], sut: E, statements: any[] = []): boolean => {
  let s = ""
  let l = 0
  const printN = (n: number) => {
    return n === 0 ? "" : ReadonlyArray.range(1, n).map(() => "  ").join("")
  }
  // TODO: path str updates

  const process = (e: FilterR) => codeFilterStatement(e, sut)
  for (const e of state) {
    switch (e.t) {
      case "where":
        statements.push(() => process(e))
        s += `statements[${statements.length - 1}]()`
        break
      case "or":
        statements.push(() => process(e))
        s += " || " + `statements[${statements.length - 1}]()`
        break
      case "and":
        statements.push(() => process(e))
        s += " && " + `statements[${statements.length - 1}]()`
        break
      case "or-scope": {
        ;++l
        s += ` || (\n${printN(l + 1)}${codeFilter3_(e.result, sut, statements)}\n${printN(l)})`
        ;--l
        break
      }
      case "and-scope": {
        ;++l
        s += ` && (\n${printN(l + 1)}${codeFilter3_(e.result, sut, statements)}\n${printN(l)})`
        ;--l

        break
      }
      case "where-scope": {
        // ;++l
        s += `(\n${printN(l + 1)}${codeFilter3_(e.result, sut, statements)}\n)`
        // ;--l
        break
      }
    }
  }
  return eval(s)
}
