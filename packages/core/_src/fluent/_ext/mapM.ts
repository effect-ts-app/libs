import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as E from "@effect-ts/core/Either"
import * as Sy from "@effect-ts/core/Sync"
import * as T from "@effect-ts-app/core/Effect"
import * as O from "@effect-ts-app/core/Option"

export function mapM<AX, R, E, B>(
  self: A.Array<AX>,
  f: (a: AX) => E.Either<E, B> | O.Option<B> | T.Effect<R, E, B> | Sy.Sync<R, E, B>
) {
  if (!self.length) {
    return T.succeed([])
  }
  return T.gen(function* ($) {
    const arr = []
    // TODO: optimise
    for (const x of self) {
      const r = f(x)
      const maybeO = r as O.Option<B>
      if (O.isNone(maybeO)) {
        return yield* $(T.fail(O.none))
      }
      if (O.isSome(maybeO)) {
        arr.push(maybeO.value)
        continue
      }
      const maybeE = r as E.Either<E, B>
      if (E.isLeft(maybeE)) {
        return yield* $(T.fail(maybeE.left))
      }
      if (E.isRight(maybeE)) {
        arr.push(maybeE.right)
        continue
      }
      arr.push(yield* $(r as T.Effect<R, E, B> | Sy.Sync<R, E, B>))
    }
    return arr
  })
}
