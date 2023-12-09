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
    t: "in",
    value: readonly V[]
  ): FilterBuilder<TFieldValues>
}

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
  FilterBuilder
    .make<MyEntity>()
    .where("something.id", 1)
    .and((_) =>
      _
        .where("something.name", "a")
        .or("name", "in", ["a", "b"])
    )
    .and("isActive", true)
    .and("age", 12)
})
