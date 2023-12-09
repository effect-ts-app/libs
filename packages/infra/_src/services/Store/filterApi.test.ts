import type { FieldValues } from "../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../filter/types/path/eager.js"

const FilterBuilder = {
  make: <TFieldValues extends FieldValues>(): Initial<TFieldValues> => {
    throw new Error("Not implemented")
  }
}

type Initial<TFieldValues extends FieldValues> = { where: Filter<TFieldValues> }

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
    op: "startsWith" | "endsWith" | "!startsWith" | "!endsWith",
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

type Filter<TFieldValues extends FieldValues> = {
  (
    fb: (f: Filts<TFieldValues>) => FilterBuilder<TFieldValues>
  ): FilterBuilder<TFieldValues>
} & Filts<TFieldValues>

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
    .and((where) =>
      where("something.name", "startsWith", "a") // or would we do "like", "a%"?
        .or("tag", "in", ["a", "b"])
        .or((where) =>
          where("name", "!=", "Alfredo")
            .and("tag", "c")
        )
    )
    .and("isActive", true)
    .and("age", ">=", 12)

  expect(f).toBe("TODO")
})

// ref https://stackoverflow.com/questions/1241142/sql-logic-operator-precedence-and-and-or
it("root-or", () => {
  const f = FilterBuilder
    .make<MyEntity>()
    .where((q) =>
      q("something.id", 1)
        .and((where) =>
          where
            .where((_) =>
              _("something.name", "startsWith", "a") // or would we do "like", "a%"?
                .or("tag", "in", ["a", "b"])
                .or((where) =>
                  where("name", "!=", "Alfredo")
                    .and("tag", "c")
                )
            )
            .and("isActive", true)
        )
        .and("isActive", true)
        .and("age", ">=", 12)
    )
    .or("name", "startsWith", "C")

  expect(f).toBe("TODO")
})
