import { Effect, flow, pipe, S } from "effect-app"
import { TagClassMakeId } from "effect-app/service"
import { inspect } from "util"
import { and, make, or, order, page, project, toFilter, where } from "./query.js"
import { RepositoryDefaultImpl } from "./RepositoryBase.js"
import { memFilter } from "./Store/Memory.js"

export class s extends S.Class<s>()({ id: S.string, displayName: S.string, n: S.Date }) {}
type sfrom = S.Schema.From<typeof s>

const MakeSomeService = Effect.succeed({ a: 1 })
export class SomeService extends TagClassMakeId("SomeService", MakeSomeService)<SomeService>() {}

const q = pipe(
  make<sfrom>(), // provided automatically inside Repo.q2()
  where("displayName", "Verona"),
  or(flow(
    where("displayName", "Riley"),
    and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
  )),
  order("displayName", false),
  page({ limit: 10 }),
  project(
    S.transformOrFail(
      S.struct({ displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
      S.struct({ displayName: S.string }),
      (_) => Effect.andThen(SomeService, _),
      () => Effect.die(new Error("not implemented"))
    )
  )
)

it("works", () => {
  console.log("raw", inspect(q, undefined, 25))
  const interpreted = toFilter(q)
  console.log("interpreted", inspect(interpreted, undefined, 25))
  const filtersBuilt = interpreted.filter.build()
  console.log("filtersBuilt", inspect(filtersBuilt, undefined, 25))
  const process = memFilter(interpreted)
  const items = [
    new s({ id: "1", displayName: "Verona", n: new Date("2021-01-01T00:00:00Z") }),
    new s({ id: "2", displayName: "Riley", n: new Date("2022-01-01T00:00:00Z") }),
    new s({ id: "3", displayName: "Riley", n: new Date("2020-01-01T00:00:00Z") })
  ]
    .map((_) => S.encodeSync(s)(_))

  const processed = process(items)

  expect(processed).toEqual(items.slice(0, 2).toReversed().map(({ displayName }) => ({ displayName })))
})

it.skip("works with repo", () => {
  class TestRepo extends RepositoryDefaultImpl<TestRepo>()<sfrom & { _etag: string | undefined }, never>()(
    "test",
    s
  ) {}
  const q1 = TestRepo.q2(() => q)

  // same as above, but with the `flow` helper
  const q2 = TestRepo.q2(flow(
    where("displayName", "Verona"),
    or(flow(
      where("displayName", "Riley"),
      and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
    )),
    order("displayName"),
    page({ limit: 10 }),
    project(
      S.transformOrFail(
        S.struct({ displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
        S.struct({ displayName: S.string }),
        (_) => Effect.andThen(SomeService, _),
        () => Effect.die(new Error("not implemented"))
      )
    )
  ))

  expect([q1, q2]).toEqual([q1, q1])
})
