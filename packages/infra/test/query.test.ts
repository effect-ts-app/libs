/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Effect, flow, Layer, Option, pipe, S, Struct } from "effect-app"
import { inspect } from "util"
import { expect, it } from "vitest"
import { and, make, one, or, order, page, project, toFilter, where } from "../src/services/query.js"
import { makeRepo, RepositoryDefaultImpl2 } from "../src/services/RepositoryBase.js"
import { memFilter, MemoryStoreLive } from "../src/services/Store/Memory.js"

const str = S.Struct({ _tag: S.Literal("string"), value: S.String })
const num = S.Struct({ _tag: S.Literal("number"), value: S.Number })
const someUnion = S.Union(str, num)

export class Something extends S.Class<Something>()({
  id: S.StringId.withDefault,
  displayName: S.NonEmptyString255,
  n: S.Date.withDefault,
  union: someUnion.pipe(S.withDefaultConstructor(() => ({ _tag: "string" as const, value: "hi" })))
}) {}
export declare namespace Something {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Encoded extends S.Schema.Encoded<typeof Something> {}
}

const MakeSomeService = Effect.succeed({ a: 1 })
export class SomeService extends Context.TagMakeId("SomeService", MakeSomeService)<SomeService>() {}

const q = make<Something.Encoded>()
  .pipe( // provided automatically inside Repo.q2()
    where("displayName", "Verona"),
    or(
      where("displayName", "Riley"),
      and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
    ),
    order("displayName"),
    page({ take: 10 }),
    project(
      S.transformToOrFail(
        S.Struct({ id: S.StringId, displayName: S.String }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
        S.Struct(Struct.pick(Something.fields, "id", "displayName")),
        (_) => Effect.andThen(SomeService, _)
      )
    )
  )

const items = [
  new Something({ displayName: S.NonEmptyString255("Verona"), n: new Date("2020-01-01T00:00:00Z") }),
  new Something({ displayName: S.NonEmptyString255("Riley") }),
  new Something({
    displayName: S.NonEmptyString255("Riley"),
    n: new Date("2020-01-01T00:00:00Z"),
    union: { _tag: "number", value: 1 }
  })
]

// TODO: .merge queries?
// where(x, y).or(a, b) + where(z, v) = (where(x, y) or(a,b)) and where(z, v)) ?

it("merge", () => {
  const a = make().pipe(where("a", "b"), or("c", "d"))
  const b = make().pipe(where("d", "e"), or("f", "g"))

  const merge = (b: any) => (a: any) => pipe(a, and(() => b))

  const r = pipe(a, merge(b), toFilter, (_) => _.filter)

  // TODO: instead this should probably scope the first where/or together e.g (where x, or y) and (...)
  const expected = make().pipe(
    where("a", "b"),
    or("c", "d"),
    and(where("d", "e"), or("f", "g")),
    toFilter,
    (_) => _.filter
  )

  console.log(JSON.stringify({ r, expected }, undefined, 2))
  expect(r).toEqual(expected)
})

it("works", () => {
  console.log("raw", inspect(q, undefined, 25))
  const interpreted = toFilter(q)
  console.log("interpreted", inspect(interpreted, undefined, 25))

  const processed = memFilter(interpreted)(items.map((_) => S.encodeSync(Something)(_)))

  expect(processed).toEqual(items.slice(0, 2).toReversed().map(Struct.pick("id", "displayName")))
})

class SomethingRepo extends RepositoryDefaultImpl2<SomethingRepo>()(
  "test",
  Something,
  { idKey: "id" }
) {
  static readonly Test = Layer.effect(SomethingRepo, SomethingRepo.makeWith({}, (_) => new SomethingRepo(_))).pipe(
    Layer.provide(MemoryStoreLive)
  )
}

it("works with repo", () =>
  Effect
    .gen(function*() {
      yield* SomethingRepo.saveAndPublish(items)

      const q1 = yield* SomethingRepo.query(() => q)
      // same as above, but with the `flow` helper
      const q2 = yield* SomethingRepo
        .query(flow(
          where("displayName", "Verona"),
          or(
            where("displayName", "Riley"),
            and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
          ),
          order("displayName"),
          page({ take: 10 }),
          project(
            S.transformToOrFail(
              S.Struct({ displayName: S.String }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
              S.Struct(Struct.pick(Something.fields, "displayName")),
              (_) => Effect.andThen(SomeService, _)
            )
          )
        ))

      expect(q1).toEqual(items.slice(0, 2).toReversed().map(Struct.pick("id", "displayName")))
      expect(q2).toEqual(items.slice(0, 2).toReversed().map(Struct.pick("displayName")))
    })
    .pipe(Effect.provide(Layer.mergeAll(SomethingRepo.Test, SomeService.toLayer())), Effect.runPromise))

it("collect", () =>
  Effect
    .gen(function*() {
      yield* SomethingRepo.saveAndPublish(items)

      expect(
        yield* SomethingRepo
          .query(flow(
            where("displayName", "Riley"), // TODO: work with To type translation, so Date?
            // one,
            project(
              S.transformTo(
                // TODO: sample case with narrowing down a union?
                S.encodedSchema(S.Struct(Struct.pick(Something.fields, "displayName", "n"))), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
                S.typeSchema(S.Option(S.String)),
                (_) =>
                  _.displayName === "Riley" && _.n === "2020-01-01T00:00:00.000Z"
                    ? Option.some(`${_.displayName}-${_.n}`)
                    : Option.none()
              ),
              "collect"
            )
          ))
      )
        .toEqual(["Riley-2020-01-01T00:00:00.000Z"])

      expect(
        yield* SomethingRepo
          .query(flow(
            where("union._tag", "string"),
            one,
            project(
              S.transformTo(
                // TODO: sample case with narrowing down a union?
                S.encodedSchema(S.Struct(Struct.pick(Something.fields, "union"))), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
                S.typeSchema(S.Option(S.String)),
                (_) =>
                  _.union._tag === "string"
                    ? Option.some(_.union.value)
                    : Option.none()
              ),
              "collect"
            )
          ))
      )
        .toEqual("hi")
    })
    .pipe(Effect.provide(Layer.mergeAll(SomethingRepo.Test, SomeService.toLayer())), Effect.runPromise))

class Person extends S.ExtendedTaggedClass<Person, Person.From>()("person", {
  id: S.String,
  surname: S.String
}) {}
class Animal extends S.ExtendedTaggedClass<Animal, Animal.From>()("animal", {
  id: S.String,
  surname: S.String
}) {}
class Test extends S.ExtendedTaggedClass<Test, Test.From>()("test", {
  id: S.String
}) {}

namespace Person {
  export interface From extends S.Struct.Encoded<typeof Person["fields"]> {}
}
namespace Animal {
  export interface From extends S.Struct.Encoded<typeof Animal["fields"]> {}
}
namespace Test {
  export interface From extends S.Struct.Encoded<typeof Test["fields"]> {}
}

const TestUnion = S.Union(Person, Animal, Test)
type TestUnion = typeof TestUnion.Type
namespace TestUnion {
  export type From = typeof TestUnion.Encoded
}

it(
  "refine",
  () =>
    Effect
      .gen(function*() {
        const repo = yield* makeRepo("test", TestUnion, {})
        const result = (yield* repo.query(flow(where("id", "123"), and("_tag", "animal")))) satisfies readonly Animal[]
        const result2 = (yield* repo.query(flow(where("_tag", "animal")))) satisfies readonly Animal[]

        expect(result).toEqual([])
      })
      .pipe(Effect.provide(MemoryStoreLive), Effect.runPromise)
)
