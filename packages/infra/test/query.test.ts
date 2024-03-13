import { Effect, flow, Layer, Option, pipe, S } from "effect-app"
import { TagClassMakeId } from "effect-app/service"
import { pick } from "effect-app/utils"
import { inspect } from "util"
import { expect, it } from "vitest"
import { and, make, one, or, order, page, project, toFilter, where } from "../src/services/query.js"
import { RepositoryDefaultImpl } from "../src/services/RepositoryBase.js"
import { ContextMapContainer } from "../src/services/Store/ContextMapContainer.js"
import { memFilter, MemoryStoreLive } from "../src/services/Store/Memory.js"

const str = S.struct({ _tag: S.literal("string"), value: S.string })
const num = S.struct({ _tag: S.literal("number"), value: S.number })
const someUnion = S.union(str, num)

export class s extends S.Class<s>()({
  id: S.StringId.withDefault,
  displayName: S.NonEmptyString255,
  n: S.Date.withDefault,
  union: someUnion.pipe(S.withDefaultConstructor(() => ({ _tag: "string" as const, value: "hi" })))
}) {}
export declare namespace s {
  export type From = S.Schema.Encoded<typeof s>
}

const MakeSomeService = Effect.succeed({ a: 1 })
export class SomeService extends TagClassMakeId("SomeService", MakeSomeService)<SomeService>() {}

const q = pipe(
  make<s.From>(), // provided automatically inside Repo.q2()
  where("displayName", "Verona"),
  or(flow(
    where("displayName", "Riley"),
    and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
  )),
  order("displayName"),
  page({ take: 10 }),
  project(
    S.transformOrFail(
      S.struct({ id: S.StringId, displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
      S.struct(pick(s.fields, "id", "displayName")),
      (_) => Effect.andThen(SomeService, _),
      () => Effect.die(new Error("not implemented"))
    )
  )
)

const items = [
  new s({ displayName: S.NonEmptyString255("Verona"), n: new Date("2020-01-01T00:00:00Z") }),
  new s({ displayName: S.NonEmptyString255("Riley") }),
  new s({
    displayName: S.NonEmptyString255("Riley"),
    n: new Date("2020-01-01T00:00:00Z"),
    union: { _tag: "number", value: 1 }
  })
]

it("works", () => {
  console.log("raw", inspect(q, undefined, 25))
  const interpreted = toFilter(q)
  console.log("interpreted", inspect(interpreted, undefined, 25))
  const filtersBuilt = interpreted.filter.build()
  console
    .log("filtersBuilt", inspect(filtersBuilt, undefined, 25))

  const processed = memFilter(interpreted)(items.map((_) => S.encodeSync(s)(_)))

  expect(processed).toEqual(items.slice(0, 2).toReversed().map((_) => pick(_, "id", "displayName")))
})

class TestRepo extends RepositoryDefaultImpl<TestRepo>()<s.From & { _etag: string | undefined }, never>()(
  "test",
  s
) {
  static readonly Test = Layer.effect(TestRepo, TestRepo.makeWith({}, (_) => new TestRepo(_))).pipe(
    Layer.provide(Layer.merge(MemoryStoreLive, ContextMapContainer.live))
  )
}

it("works with repo", () =>
  Effect
    .gen(function*($) {
      yield* $(TestRepo.saveAndPublish(items))

      const q1 = yield* $(TestRepo.query(() => q))
      // same as above, but with the `flow` helper
      const q2 = yield* $(
        TestRepo
          .query(flow(
            where("displayName", "Verona"),
            or(flow(
              where("displayName", "Riley"),
              and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
            )),
            order("displayName"),
            page({ take: 10 }),
            project(
              S.transformOrFail(
                S.struct({ displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
                S.struct(pick(s.fields, "displayName")),
                (_) => Effect.andThen(SomeService, _),
                () => Effect.die(new Error("not implemented"))
              )
            )
          ))
      )
      expect(q1).toEqual(items.slice(0, 2).toReversed().map((_) => pick(_, "id", "displayName")))
      expect(q2).toEqual(items.slice(0, 2).toReversed().map((_) => pick(_, "displayName")))
    })
    .pipe(Effect.provide(Layer.mergeAll(TestRepo.Test, SomeService.toLayer())), Effect.runPromise))

it("collect", () =>
  Effect
    .gen(function*($) {
      yield* $(TestRepo.saveAndPublish(items))

      expect(
        yield* $(
          TestRepo
            .query(flow(
              where("displayName", "Riley"), // TODO: work with To type translation, so Date?
              // one,
              project(
                S.transformTo(
                  // TODO: sample case with narrowing down a union?
                  S.encodedSchema(S.struct(pick(s.fields, "displayName", "n"))), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
                  S.typeSchema(S.option(S.string)),
                  (_) =>
                    _.displayName === "Riley" && _.n === "2020-01-01T00:00:00.000Z"
                      ? Option.some(`${_.displayName}-${_.n}`)
                      : Option.none()
                ),
                "collect"
              )
            ))
        )
      )
        .toEqual(["Riley-2020-01-01T00:00:00.000Z"])

      expect(
        yield* $(
          TestRepo
            .query(flow(
              where("union._tag", "string"),
              one,
              project(
                S.transformTo(
                  // TODO: sample case with narrowing down a union?
                  S.encodedSchema(S.struct(pick(s.fields, "union"))), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
                  S.typeSchema(S.option(S.string)),
                  (_) =>
                    _.union._tag === "string"
                      ? Option.some(_.union.value)
                      : Option.none()
                ),
                "collect"
              )
            ))
        )
      )
        .toEqual("hi")
    })
    .pipe(Effect.provide(Layer.mergeAll(TestRepo.Test, SomeService.toLayer())), Effect.runPromise))
