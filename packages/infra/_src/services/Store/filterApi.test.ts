import type { FieldValues } from "../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../filter/types/path/eager.js"

type FilterResult = {
  t: "where"
  op: string
  path: string
  value: string
} | {
  t: "or"
  op: string
  path: string
  value: string
} | {
  t: "and"
  op: string
  path: string
  value: string
} | {
  t: "or-scope"
  result: FilterResult[]
} | {
  t: "and-scope"
  result: FilterResult[]
} | {
  t: "where-scope"
  result: FilterResult[]
}

const print = (state: readonly FilterResult[]) => {
  let s = ""
  let l = 0
  const printN = (n: number) => {
    return n === 0 ? "" : ReadonlyArray.range(1, n).map(() => "  ").join("")
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

const makeFilter = <TFieldValues extends FieldValues>() => {
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
  const all = {
    where,
    and,
    or,
    build() {
      return state
    }
  }
  return { all, fields }
}

const FilterBuilder = {
  make: <TFieldValues extends FieldValues>(): (
    fn: (f: Initial<TFieldValues>, fields: Filter<TFieldValues>) => FilterBuilder<TFieldValues>
  ) => FilterBuilder<TFieldValues> => {
    type F = ReturnType<typeof makeFilter<TFieldValues>>
    return (
      f: (
        n: F["all"],
        f: F["fields"]
      ) => FilterBuilder<TFieldValues>
    ) => {
      const fil = makeFilter<TFieldValues>()
      return f(fil.all, fil.fields)
    }
  }
}

type Initial<TFieldValues extends FieldValues> = { where: FilterTest<TFieldValues>; build(): any }

type Filts<TFieldValues extends FieldValues> = {
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    value: V
  ): FilterBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "!=",
    value: V
  ): FilterBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: ">" | ">=" | "<" | "<=",
    value: V // only numbers?
  ): FilterBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "!contains" | "!startsWith" | "!endsWith",
    value: V // only strings?
  ): FilterBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "in" | "not-in",
    value: readonly V[]
  ): FilterBuilder<TFieldValues>
}

// type Filter<TFieldValues extends FieldValues> = {
//   (
//     fb: (f: Filts<TFieldValues>) => FilterBuilder<TFieldValues>
//   ): FilterBuilder<TFieldValues>
// } & Filts<TFieldValues>

type FilterTest<TFieldValues extends FieldValues> = {
  (
    fb: (f: Filts<TFieldValues> & Initial<TFieldValues>) => FilterBuilder<TFieldValues>
  ): FilterBuilder<TFieldValues>
  <
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(f: {
    path: TFieldName
    op: "startsWith" | "endsWith" | "contains" | "!contains" | "!startsWith" | "!endsWith"
    value: V
  }): FilterBuilder<TFieldValues>
} & Filts<TFieldValues>
// const not = <A extends string>(s: A) => `!${s}`

// type FilterGroup<TFieldValues extends FieldValues> = (
//   fb: (f: FilterBuilder<TFieldValues>) => FilterBuilder<TFieldValues>
// ) => FilterBuilder<TFieldValues>

interface FilterBuilder<TFieldValues extends FieldValues> {
  // TODO: as overloads?
  and: FilterTest<TFieldValues>
  or: FilterTest<TFieldValues>
  build(): any
  // where: <Filters extends Record<TFieldName extends FieldPath<TFieldValues>, V extends Value< FieldPathValue<TFieldValues, TFieldName>>>(filter: Filters) => FilterBuilder<TFieldValues>
}

interface MyEntity {
  id: string
  name: string
  bio: string | null
  isActive: boolean
  roles: readonly string[]
  tag: "a" | "b" | "c"
  age?: number
  something: {
    id: number
    name: string
  } | null
}

type F<T extends FieldValues> = {
  path: FieldPath<T>
  op: "endsWith" | "startsWith" | "contains" // | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  value: string
} /* | {
  op: "in" | "notIn"
  path: FieldPath<T>
  value: readonly string[]
}*/

type G<T extends FieldValues, Val> = {
  (value: Val): F<T>
  startsWith: (value: string) => F<T>
  endsWith: (value: string) => F<T>
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

type NullOrUndefined<T, Fallback> = null extends T ? null : undefined extends T ? null : Fallback

type Filter<T extends FieldValues, Ext = never> = {
  [K in keyof T]-?: [T[K]] extends [Record<any, any> | undefined | null]
    ? Filter<T[K], NullOrUndefined<T[K], Ext>> & G<T, T[K] | Ext>
    : [T[K]] extends [Record<any, any>] ? Filter<T[K], NullOrUndefined<T[K], Ext>> & G<T, T[K] | Ext>
    : G<T, T[K] | Ext>
}
const makeProxy = (parentProp?: string): any =>
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

        if (
          ["contains", "startsWith", "endsWith", "in", "notIn", "eq", "neq", "gte", "gt", "lt", "lte"].includes(prop)
        ) {
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

const MyEntity = {
  query: FilterBuilder
    .make<MyEntity>()
}

it("works", () => {
  const f = MyEntity.query((q, fields) =>
    q
      .where(fields.something.id.contains("abc"))
      .and((_) =>
        _
          .where(fields.something.name.startsWith("a")) // or would we do "like", "a%"?
          .or(fields.tag.in("a", "b"))
          .or((_) =>
            _
              .where(fields.name.neq("Alfredo"))
              .and(fields.tag("c"))
          )
      )
      .and(fields.isActive(true))
      .and(fields.age.gte(12))
  )

  const s = f.build()
  console.log(JSON.stringify(s, undefined, 2))
  expect(print(s)).toBe(
    `something.id contains abc AND (
    something.name startsWith a OR tag in a OR (
    name neq Alfredo AND tag eq c
  )
  ) AND isActive eq true AND age gte 12`
  )
})

// ref https://stackoverflow.com/questions/1241142/sql-logic-operator-precedence-and-and-or
it("root-or", () => {
  const f = MyEntity.query((q, fields) =>
    q
      .where((_) =>
        _
          .where(fields.something.id(1))
          .and((_) =>
            _
              .where(fields.something.name.startsWith("a")) // or would we do "like", "a%"?
              .or(fields.tag.in("a", "b"))
              .or((_) =>
                _
                  .where(fields.name.neq("Alfredo"))
                  .and(fields.tag("c"))
              )
          )
          .and(fields.bio.contains("abc"))
          .and(fields.isActive(true))
          .and(fields.age.gte(12))
      )
      .or(fields.name.startsWith("C"))
  )

  const s = f.build()
  console.log(JSON.stringify(s, undefined, 2))
  expect(print(s)).toBe(
    `(
  something.id eq 1 AND (
    something.name startsWith a OR tag in a OR (
    name neq Alfredo AND tag eq c
  )
  ) AND bio contains abc AND isActive eq true AND age gte 12
) OR name startsWith C`
  )
})
