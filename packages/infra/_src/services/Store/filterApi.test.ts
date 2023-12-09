import type { FieldValues } from "../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../filter/types/path/eager.js"

const FilterBuilder = {
  make: <T extends FieldValues>() => {
    return null as unknown as FilterBuilder<T>
  }
}

type Filter<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues>,
  V extends FieldPathValue<TFieldValues, TFieldName>
>(
  path: TFieldName,
  value: V
) => FilterBuilder<TFieldValues>

interface FilterBuilder<TFieldValues extends FieldValues> {
  and: ((fb: FilterBuilder<TFieldValues>) => FilterBuilder<TFieldValues>) | Filter<TFieldValues>
  or: ((fb: FilterBuilder<TFieldValues>) => FilterBuilder<TFieldValues>) | Filter<TFieldValues>

  where: Filter<TFieldValues>
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
  const filter = FilterBuilder.make<MyEntity>()
  filter
    .where("something.id", 1)
    .and((_) => _.where("something.name", "a"))
    .and("isActive", true)
    .and("age", 12)
})
