import { Effect, flow, pipe, S } from "effect-app"
import { make, or, order, project, where } from "./query.js"
import { RepositoryDefaultImpl } from "./RepositoryBase.js"
import { RequestContextContainer } from "./RequestContextContainer.js"

const s = S.struct({ id: S.string, displayName: S.string, n: S.Date })
type s = S.Schema.To<typeof s>
type sfrom = S.Schema.From<typeof s>
export class TestRepo extends RepositoryDefaultImpl<TestRepo>()<sfrom & { _etag: string | undefined }, never>()(
  "test",
  s
) {}

const a = pipe(
  make<{ id: string; displayName: string; n: Date }>(),
  where("displayName", "Verona"),
  or(flow(
    where("displayName", "Riley")
    // and("resource._tag", "Printer")
  )),
  order("displayName")
)
const q = pipe(
  a,
  //    page(2, 1)
  project(
    // User.struct.pipe(S.pick("displayName"))
    S.transformOrFail(
      S.struct({ displayName: S.string }), // for projection performance benefit, this should be limited to the fields interested
      S.struct({ displayName: S.string }),
      (_) => Effect.andThen(RequestContextContainer, _),
      () => Effect.die(new Error("not implemented"))
    )
  )
)
console.log(q)
console.log(TestRepo.q2(() => q))
