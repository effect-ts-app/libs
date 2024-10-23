import { RepositoryDefaultImpl2 } from "@effect-app/infra/services/Repository"
import { Effect, flow, Layer, ManagedRuntime, S } from "effect-app"
import { and, or, order, page, project, where } from "../src/services/query.js"
import { MemoryStoreLive } from "../src/services/Store/Memory.js"

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
  export interface Encoded extends S.Schema.Encoded<typeof Something> {}
}

const items = [
  new Something({ displayName: S.NonEmptyString255("Verona"), n: new Date("2020-01-01T00:00:00Z") }),
  new Something({ displayName: S.NonEmptyString255("Riley") }),
  new Something({
    displayName: S.NonEmptyString255("Riley"),
    n: new Date("2020-01-01T00:00:00Z"),
    union: { _tag: "number", value: 1 }
  })
]

class SomethingRepo extends RepositoryDefaultImpl2<SomethingRepo>()(
  "Something",
  Something,
  { idKey: "id" }
) {
  static readonly Test = Layer
    .effect(
      SomethingRepo,
      SomethingRepo.makeWith({ makeInitial: Effect.sync(() => items) }, (_) => new SomethingRepo(_))
    )
    .pipe(
      Layer.provide(MemoryStoreLive)
    )
}

const program = Effect.gen(function*() {
  const somethingRepo = yield* SomethingRepo
  const r = yield* somethingRepo.query(flow(
    where("displayName", "Verona"),
    or(
      where("displayName", "Riley"),
      and("n", "gt", "2021-01-01T00:00:00Z") // TODO: work with To type translation, so Date?
    ),
    order("displayName"),
    page({ take: 1 }),
    project(S.Struct(Something.pick("id", "displayName")))
  ))
  console.log("$$ result", r)
})

const rt = ManagedRuntime.make(SomethingRepo.Test)
rt.runFork(program)
