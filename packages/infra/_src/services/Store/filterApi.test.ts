import type { FieldValues } from "../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../filter/types/path/eager.js"

type FilterResult = {
  t: "where"
  type: string
  path: string
  value: string
} | {
  t: "or"
  type: string
  path: string
  value: string
} | {
  t: "and"
  type: string
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
    console.log("n", n)
    return n === 0 ? "" : ReadonlyArray.range(1, n).map(() => "  ").join("")
  }
  for (const e of state) {
    switch (e.t) {
      case "where":
        s += `${e.path} ${e.type} ${e.value}`
        break
      case "or":
        s += ` OR ${e.path} ${e.type} ${e.value}`
        break
      case "and":
        s += ` AND ${e.path} ${e.type} ${e.value}`
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

const FilterBuilder = {
  make: <TFieldValues extends FieldValues>(): Initial<TFieldValues> => {
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
      current.push({
        t: "where",
        type: args.length === 2 ? "eq" : args[1],
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
      current.push({
        t: "and",
        type: args.length === 2 ? "eq" : args[1],
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
      current.push({ t: "or", type: args.length === 2 ? "eq" : args[1], path: args[0], value: args[args.length - 1] })
      return all
    }
    const all = {
      where,
      and,
      or,
      build() {
        return state
      }
    }
    return all
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
  bio: string
  isActive: boolean
  roles: readonly string[]
  tag: "a" | "b" | "c"
  age?: number
  something?: {
    id: number
    name: string
  }
}

it("works", () => {
  const f = FilterBuilder
    .make<MyEntity>()
    .where("something.id", 1)
    .and((_) =>
      _
        .where("something.name", "startsWith", "a") // or would we do "like", "a%"?
        .or("tag", "in", ["a", "b"])
        .or((_) =>
          _
            .where("name", "!=", "Alfredo")
            .and("tag", "c")
        )
    )
    .and("isActive", true)
    .and("age", ">=", 12)

  const s = f.build()
  console.log(JSON.stringify(s, undefined, 2))
  expect(print(s)).toBe("TODO")
})

// ref https://stackoverflow.com/questions/1241142/sql-logic-operator-precedence-and-and-or
it("root-or", () => {
  const f = FilterBuilder
    .make<MyEntity>()
    .where((_) =>
      _
        .where("something.id", 1)
        .and((_) =>
          _
            .where("something.name", "startsWith", "a") // or would we do "like", "a%"?
            .or("tag", "in", ["a", "b"])
            .or((_) =>
              _
                .where("name", "!=", "Alfredo")
                .and("tag", "c")
            )
        )
        .and("bio", "contains", "abc")
        .and("isActive", true)
        .and("age", ">=", 12)
    )
    .or("name", "startsWith", "C")

  const s = f.build()
  console.log(JSON.stringify(s, undefined, 2))
  expect(print(s)).toBe("TODO")
})
