import type { FieldValues } from "../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../filter/types/path/eager.js"

const FilterBuilder = {
  make: <TFieldValues extends FieldValues>(): Initial<TFieldValues> => {
    throw new Error("Not implemented")
  }
}

type Initial<TFieldValues extends FieldValues> = { where: Filter<TFieldValues> }

type Filter<TFieldValues extends FieldValues> = {
  (
    fb: (f: Initial<TFieldValues>) => FilterBuilder<TFieldValues>
  ): FilterBuilder<TFieldValues>
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

const not = <A extends string>(s: A) => `!${s}`

type FilterGroup<TFieldValues extends FieldValues> = (
  fb: (f: FilterBuilder<TFieldValues>) => FilterBuilder<TFieldValues>
) => FilterBuilder<TFieldValues>

interface FilterBuilder<TFieldValues extends FieldValues> {
  // TODO: as overloads?
  and: Filter<TFieldValues>
  or: Filter<TFieldValues>
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

  expect(f).toBe("TODO")
})
