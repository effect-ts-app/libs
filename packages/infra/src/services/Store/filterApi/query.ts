import { Array } from "effect-app"
import type { FieldValues } from "../../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../../filter/types/path/eager.js"
import type { Filter, Ops } from "./proxy.js"
import { makeProxy } from "./proxy.js"

export { Filter }

export type FilterScopes = {
  t: "or-scope"
  result: FilterResult[]
} | {
  t: "and-scope"
  result: FilterResult[]
} | {
  t: "where-scope"
  result: FilterResult[]
}

export type FilterR = {
  op: Ops

  path: string
  value: string // ToDO: Value[]
}

export type FilterResult =
  | {
    t: "where"
  } & FilterR
  | {
    t: "or"
  } & FilterR
  | {
    t: "and"
  } & FilterR
  | FilterScopes

export const print = (state: readonly FilterResult[]) => {
  let s = ""
  let l = 0
  const printN = (n: number) => {
    return n === 0 ? "" : Array.range(1, n).map(() => "  ").join("")
  }
  for (const e of state) {
    switch (e.t) {
      case "where":
        s += `${e.path} ${e.op} ${e.value}`
        break
      case "or":
        s += ` OR ${e.path} ${e.op} ${e.value}`
        break
      case "and":
        s += ` AND ${e.path} ${e.op} ${e.value}`
        break
      case "or-scope": {
        ;++l
        s += ` OR (\n${printN(l + 1)}${print(e.result)}\n${printN(l)})`
        ;--l
        break
      }
      case "and-scope": {
        ;++l
        s += ` AND (\n${printN(l + 1)}${print(e.result)}\n${printN(l)})`
        ;--l

        break
      }
      case "where-scope": {
        // ;++l
        s += `(\n${printN(l + 1)}${print(e.result)}\n)`
        // ;--l
        break
      }
    }
  }
  return s
}

export const makeFilter = <TFieldValues extends FieldValues>() => {
  // const recursive = {}
  // const and = Object.assign(() => {}, recursive)
  // const or = Object.assign(() => {}, recursive)
  // const where = Object.assign(() => {}, recursive)
  // recursive.and = and
  // recursive.or = or
  // recursive.where = where
  const state: FilterResult[] = []
  let current = state
  const where = (...args: any[]) => {
    if (typeof args[0] === "function") {
      const mine: any[] = []
      const previous = current
      current = mine
      const r = args[0](all)
      current = previous
      current.push({ t: "where-scope", result: mine })
      return r
    }
    if (args.length === 1) {
      current.push({ t: "where", ...args[0] })
      return all
    }
    current.push({
      t: "where",
      op: args.length === 2 ? "eq" : args[1],
      path: args[0],
      value: args[args.length - 1]
    })
    return all
  }
  const and = (...args: any[]) => {
    if (typeof args[0] === "function") {
      const mine: any[] = []
      const previous = current
      current = mine
      const r = args[0](all)
      current = previous
      current.push({ t: "and-scope", result: mine })
      return r
    }
    if (args.length === 1) {
      current.push({ t: "and", ...args[0] })
      return all
    }
    current.push({
      t: "and",
      op: args.length === 2 ? "eq" : args[1],
      path: args[0],
      value: args[args.length - 1]
    })
    return all
  }
  const or = (...args: any[]) => {
    if (typeof args[0] === "function") {
      const mine: any[] = []
      const previous = current
      current = mine
      const r = args[0](all)
      current = previous
      current.push({ t: "or-scope", result: mine })
      return r
    }
    if (args.length === 1) {
      current.push({ t: "or", ...args[0] })
      return all
    }
    current.push({ t: "or", op: args.length === 2 ? "eq" : args[1], path: args[0], value: args[args.length - 1] })
    return all
  }
  const fields = makeProxy() as Filter<TFieldValues>
  const all = Object.assign(where, {
    type: "new-kid",
    and,
    or,
    build() {
      return state
    }
  })
  return { all, fields }
}

/** @deprecated use Q */
export const QueryBuilder = {
  /** @deprecated use Q */
  make: <TFieldValues extends FieldValues>(): (
    fn: (f: FilterTest<TFieldValues>, fields: Filter<TFieldValues>) => QueryBuilder<TFieldValues>
  ) => QueryBuilder<TFieldValues> => {
    type F = ReturnType<typeof makeFilter<TFieldValues>>
    return (
      f: (
        n: F["all"],
        f: F["fields"]
      ) => QueryBuilder<TFieldValues>
    ) => {
      const fil = makeFilter<TFieldValues>()
      return f(fil.all, fil.fields)
    }
  }
}

export type Initial<TFieldValues extends FieldValues> = {
  where: FilterTest<TFieldValues>
  build(): FilterResult[]
}

export type Filts<TFieldValues extends FieldValues> = {
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    value: V
  ): QueryBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "neq",
    value: V
  ): QueryBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "gt" | "gte" | "lt" | "lte",
    value: V // only numbers?
  ): QueryBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends string
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
    value: V
  ): QueryBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "in" | "notIn",
    value: readonly V[]
  ): QueryBuilder<TFieldValues>
}

// type Filter<TFieldValues extends FieldValues> = {
//   (
//     fb: (f: Filts<TFieldValues>) => QueryBuilder<TFieldValues>
//   ): QueryBuilder<TFieldValues>
// } & Filts<TFieldValues>

export type FilterTest<TFieldValues extends FieldValues> = {
  (
    fb: (f: Filts<TFieldValues> & Initial<TFieldValues>) => QueryBuilder<TFieldValues>
  ): QueryBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(f: {
    path: TFieldName
    op: Ops
    value: V
  }): QueryBuilder<TFieldValues>
} & Filts<TFieldValues>
// const not = <A extends string>(s: A) => `!${s}`

// type FilterGroup<TFieldValues extends FieldValues> = (
//   fb: (f: QueryBuilder<TFieldValues>) => QueryBuilder<TFieldValues>
// ) => QueryBuilder<TFieldValues>

export interface QueryBuilder<TFieldValues extends FieldValues> {
  type: "new-kid"
  // TODO: as overloads?
  and: FilterTest<TFieldValues>
  or: FilterTest<TFieldValues>
  build(): FilterResult[]
  // where: <Filters extends Record<TFieldName extends FieldPath<TFieldValues>, V extends Value< FieldPathValue<TFieldValues, TFieldName>>>(filter: Filters) => QueryBuilder<TFieldValues>
}
