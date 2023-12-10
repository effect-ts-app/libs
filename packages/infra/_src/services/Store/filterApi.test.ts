import { FilterBuilder, print } from "./filterApi/query.js"

const MyEntity = {
  query: FilterBuilder
    .make<MyEntity>()
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

it("works", () => {
  const f = MyEntity.query((where, f) =>
    where(f.something.id.contains("abc"))
      .and(() =>
        where(f.something.name.startsWith("a")) // or would we do "like", "a%"?
          .or(f.tag.in("a", "b"))
          .or(() =>
            where(f.name.neq("Alfredo"))
              .and(f.tag("c"))
          )
      )
      .and(f.isActive(true))
      .and(f.age.gte(12))
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
  const f = MyEntity.query((where, f) =>
    where(() =>
      where(f.something.id(1))
        .and(() =>
          where(f.something.name.startsWith("a")) // or would we do "like", "a%"?
            .or(f.tag.in("a", "b"))
            .or(() =>
              where(f.name.neq("Alfredo"))
                .and(f.tag("c"))
            )
        )
        .and(f.bio.contains("abc"))
        .and(f.isActive(true))
        .and(f.age.gte(12))
    )
      .or(f.name.startsWith("C"))
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
