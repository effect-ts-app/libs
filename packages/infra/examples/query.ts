import { RepositoryDefaultImpl } from "@effect-app/infra/services/RepositoryBase"
import { Effect, flow, Layer, ManagedRuntime, S } from "effect-app"
import { pick } from "effect-app/utils"
import { and, or, order, page, project, where } from "../src/services/query.js"
import { ContextMapContainer } from "../src/services/Store/ContextMapContainer.js"
import { MemoryStoreLive } from "../src/services/Store/Memory.js"

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

const items = [
  new s({ displayName: S.NonEmptyString255("Verona"), n: new Date("2020-01-01T00:00:00Z") }),
  new s({ displayName: S.NonEmptyString255("Riley") }),
  new s({
    displayName: S.NonEmptyString255("Riley"),
    n: new Date("2020-01-01T00:00:00Z"),
    union: { _tag: "number", value: 1 }
  })
]

class TestRepo extends RepositoryDefaultImpl<TestRepo>()(
  "test",
  s
) {
  static readonly Test = Layer
    .effect(
      TestRepo,
      TestRepo.makeWith({ makeInitial: Effect.sync(() => items) }, (_) => new TestRepo(_))
    )
    .pipe(
      Layer.provide(Layer.merge(MemoryStoreLive, ContextMapContainer.live))
    )
}

const rt = ManagedRuntime.make(TestRepo.Test)
rt.runFork(TestRepo.query(flow(
  where("displayName", "Verona"),
  or(flow(
    where("displayName", "Riley"),
    and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
  )),
  order("displayName"),
  page({ take: 10 }),
  project(
    S.transformToOrFail(
      S.struct({ id: S.StringId, displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested, and leads to SELECT fields
      S.struct(pick(s.fields, "id", "displayName")),
      Effect.succeed
    )
  )
)))
