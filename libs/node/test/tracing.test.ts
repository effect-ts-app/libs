//import "@effect/core/Tracing/Enable"

import { pipe } from "@tsplus/stdlib/data/Function"

describe("Tracing & Optimizations", () => {
  it("should collect traces", async () => {
    const res = await pipe(
      Effect.succeed(1),
      Effect.$.flatMap((n) => {
        return Effect.succeed(n + 1)
      }),
      Effect.$.flatMap((n) => {
        return Effect.succeed(n + 1)
      }),
      Effect.$.flatMap((n) => {
        return Effect.succeed(n + 1)
      }),
      Effect.$.tap((n) => {
        return Effect.fail(`(${n})`)
      }),
      Effect.$.catchAll(function handle(n) {
        return Effect.succeed(n)
      }),
      Effect.$.flatMap((n) => {
        return Effect.fail(`error: ${n}`)
      }),
      Effect.$.flatMap(() => Effect.succeed(0))
    ).result.unsafeRunPromise()

    Exit.assertsFailure(res)

    console.log(
      Cause.pretty(res.cause, {
        renderError: Cause.defaultRenderer.renderError,
        renderUnknown: Cause.defaultRenderer.renderUnknown,
        renderTrace: Cause.defaultRenderer.renderTrace
      })
    )

    expect(Cause.untraced(res.cause)).toEqual(Cause.fail("error: (4)"))
  })

  it("should collect 2", async () => {
    const res = await Effect.succeed("ok")
      .tap(() => Effect.unit)
      .tap(() => Effect.unit)
      .tap(() => Effect.unit)
      .map((x) => `(${x})`)
      .flatMap((n) => Effect.fail(`error: ${n}`))
      .unsafeRunPromise()

    Exit.assertsFailure(res)

    console.log(
      Cause.pretty(res.cause, {
        renderError: Cause.defaultRenderer.renderError,
        renderUnknown: Cause.defaultRenderer.renderUnknown,
        renderTrace: Cause.defaultRenderer.renderTrace
      })
    )
  })
})
