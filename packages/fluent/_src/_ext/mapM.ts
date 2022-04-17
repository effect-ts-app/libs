export function mapM<AX, R, E, B>(
  self: ROArray<AX>,
  f: (a: AX) => Either<E, B> | Option<B> | Effect<R, E, B> | Sync<R, E, B>
) {
  if (!self.length) {
    return Effect.succeed([])
  }
  return Effect.gen(function* ($) {
    const arr = []
    // TODO: optimise
    for (const x of self) {
      const r = f(x)
      const maybeO = r as Option<B>
      if (Option.isNone(maybeO)) {
        return yield* $(Effect.fail(Option.none))
      }
      if (Option.isSome(maybeO)) {
        arr.push(maybeO.value)
        continue
      }
      const maybeE = r as Either<E, B>
      if (Either.isLeft(maybeE)) {
        return yield* $(Effect.fail(maybeE.left))
      }
      if (Either.isRight(maybeE)) {
        arr.push(maybeE.right)
        continue
      }
      arr.push(yield* $(r as Effect<R, E, B> | Sync<R, E, B>))
    }
    return arr
  })
}
