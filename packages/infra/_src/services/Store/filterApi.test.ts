import { codeFilter3 } from "./codeFilter.js"
import { buildWhereCosmosQuery3 } from "./Cosmos/query.js"
import { print, QueryBuilder } from "./filterApi/query.js"

const MyEntity = {
  query: QueryBuilder
    .make<MyEntity>()
}

const removeWhitespace = (a: string) => a.replaceAll(/\s+/g, " ").replaceAll(/^\s+/g, "").replaceAll(/\s+$/g, "")

interface MyEntity {
  id: string
  name: string
  bio: string | null
  isActive: boolean
  state: { _tag: "a"; val: number } | { _tag: "b"; val: string } | { _tag: "c"; noVal: boolean }
  roles: readonly string[]
  tag: "a" | "b" | "c"
  age?: number
  something: {
    id: number
    name: string
  } | null
}

describe("works", () => {
  const f = MyEntity.query((where, f) =>
    where(f.something.id.eq(1))
      .and(() =>
        where(f.something.name.startsWith("a")) // or would we do "like", "a%"?
          .or(f.tag.in("a", "b"))
          .or(() =>
            where(f.name.neq("Alfredo"))
              .and(f.tag("c"))
          )
      )
      // .and(f.state._tag("a"))
      .and("state._tag", "a")
      .and(f.isActive(true))
      .and(f.age.gte(12))
  )

  const s = f.build()
  console.log(JSON.stringify(s, undefined, 2))
  it("print", () =>
    expect(print(s)).toBe(
      `something.id eq 1 AND (
    something.name startsWith a OR tag in a OR (
    name neq Alfredo AND tag eq c
  )
  ) AND state._tag eq a AND isActive eq true AND age gte 12`
    ))
  const values: MyEntity[] = [{
    id: "1",
    name: "Patrick",
    bio: "something",
    age: 13,
    isActive: true,
    state: { _tag: "a", val: 1 },
    roles: ["admin"],
    tag: "c",
    something: { id: 1, name: "abc" }
  }, {
    id: "1",
    name: "Patrick",
    bio: "something",
    age: 11,
    isActive: true,
    state: { _tag: "b", val: "2" },
    roles: ["admin"],
    tag: "a",
    something: { id: 1, name: "abc" }
  }]

  it("print codef", () => {
    expect(values.filter(codeFilter3(s))).toStrictEqual([values[0]])
  })

  it("codeFilter1", () => {
    expect(values.filter(codeFilter3(s))).toStrictEqual([values[0]])
  })
  it("codeFilter2", () => {
    expect(values.filter(
      codeFilter3(
        MyEntity
          .query((where, f) =>
            where(f.something.id.eq(0))
              .and(() =>
                where(f.something.name.startsWith("a"))
                  .or(f.tag.in("a", "b"))
              )
          )
          .build()
      )
    ))
      .toStrictEqual([])

    expect(values.filter(
      codeFilter3(
        MyEntity
          .query((where, f) => where(f.something.id.eq(0)))
          .build()
      )
    ))
      .toStrictEqual([])

    expect(values.filter(
      codeFilter3(
        MyEntity
          .query((where, f) => where(f.something.id.eq(1)))
          .build()
      )
    ))
      .toStrictEqual(values)

    expect(values.filter(
      codeFilter3(
        MyEntity
          .query((where, f) => where(f.age.eq(11)))
          .build()
      )
    ))
      .toStrictEqual([values[1]])
  })

  it("cosmos", () => {
    const r = buildWhereCosmosQuery3(s, "MyEntity", "marker")
    expect(removeWhitespace(r.query)).toBe(removeWhitespace(`
        SELECT f
    FROM MyEntity f
    WHERE f.id != @id AND f.something.id = @v0 AND (
    STARTSWITH(f.something.name, @v1, true) OR ARRAY_CONTAINS(@v2, f.tag) OR (
    f.name <> @v3 AND f.tag = @v4
  )
  ) AND f.state._tag = @v5 AND f.isActive = @v6 AND f.age >= @v7`))
    expect(r.parameters).toEqual([
      {
        "name": "@id",
        "value": "marker"
      },
      {
        "name": "@v0",
        "value": 1
      },
      {
        "name": "@v1",
        "value": "a"
      },
      {
        "name": "@v2",
        "value": "a"
      },
      {
        "name": "@v3",
        "value": "Alfredo"
      },
      {
        "name": "@v4",
        "value": "c"
      },
      {
        "name": "@v5",
        "value": "a"
      },
      {
        "name": "@v6",
        "value": true
      },
      {
        "name": "@v7",
        "value": 12
      }
    ])
  })
})

// ref https://stackoverflow.com/questions/1241142/sql-logic-operator-precedence-and-and-or
describe("root-or", () => {
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

  it("print", () => {
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
  it("cosmos", () => {
    const r = buildWhereCosmosQuery3(s, "MyEntity", "marker")
    expect(removeWhitespace(r.query)).toBe(removeWhitespace(`    SELECT f
       FROM MyEntity f
          
          WHERE f.id != @id AND (
    f.something.id = @v0 AND (
      STARTSWITH(f.something.name, @v1, true) OR ARRAY_CONTAINS(@v2, f.tag) OR (
      f.name <> @v3 AND f.tag = @v4
    )
    ) AND CONTAINS(f.bio, @v5, true) AND f.isActive = @v6 AND f.age >= @v7
  ) OR STARTSWITH(f.name, @v8, true) `))
    expect(r.parameters).toEqual([
      {
        "name": "@id",
        "value": "marker"
      },
      {
        "name": "@v0",
        "value": 1
      },
      {
        "name": "@v1",
        "value": "a"
      },
      {
        "name": "@v2",
        "value": "a"
      },
      {
        "name": "@v3",
        "value": "Alfredo"
      },
      {
        "name": "@v4",
        "value": "c"
      },
      {
        "name": "@v5",
        "value": "abc"
      },
      {
        "name": "@v6",
        "value": true
      },
      {
        "name": "@v7",
        "value": 12
      },
      {
        "name": "@v8",
        "value": "C"
      }
    ])
  })
})
