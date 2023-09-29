// /**
//  * Executes the specified effect, acquiring the specified number of permits
//  * immediately before the effect begins execution and releasing them
//  * delayed by duration after the effect completes execution, whether by success,
//  * failure, or interruption.
//  *
//  * @tsplus static effect/stm/TSemaphore.Ops withPermitsDuration
//  * @tsplus pipeable effect/stm/TSemaphore withPermitsDuration
//  */
// export function withPermitsDuration(permits: number, duration: Duration) {
//   return (self: TSemaphore): <R, E, A>(effect: Effect<R, E, A>) => Effect<R, E, A> => {
//     return effect =>
//       Effect.uninterruptibleMask(
//         restore =>
//           restore(self.acquireN(permits).commit)
//             > restore(effect)
//               .ensuring(
//                 self.releaseN(permits)
//                   .commit
//                   .delay(duration)
//               )
//       )
//   }
// }

/**
 * Executes the specified effect, acquiring the specified number of permits
 * immediately before the effect begins execution and releasing them
 * delayed by duration after the effect completes execution, whether by success,
 * failure, or interruption.
 *
 * @tsplus static effect/io/Effect/Semaphore.Ops withPermitsDuration
 * @tsplus pipeable effect/io/Effect/Semaphore withPermitsDuration
 */
export function SEM_withPermitsDuration(permits: number, duration: Duration) {
  return (self: Semaphore): <R, E, A>(effect: Effect<R, E, A>) => Effect<R, E, A> => {
    return (effect) =>
      Effect.uninterruptibleMask(
        (restore) =>
          restore(self.take(permits))
            > restore(effect)
              .ensuring(
                self
                  .release(permits)
                  .delay(duration)
              )
      )
  }
}

/**
 * @tsplus pipeable Iterable batchPar
 * @tsplus static Collection.Ops batchPar
 */
export function batchPar<R, E, A, R2, E2, A2, T>(
  n: number,
  forEachItem: (item: T, iWithinBatch: number, batchI: number) => Effect<R, E, A>,
  forEachBatch: (a: NonEmptyArray<A>, i: number) => Effect<R2, E2, A2>
) {
  return (items: Iterable<T>) =>
    items
      .chunk(n)
      .forEachEffect(
        (_, i) =>
          _
            .forEachEffect((_, j) => forEachItem(_, j, i), { concurrency: "inherit" })
            .flatMap((_) => forEachBatch(_ as NonEmptyArray<A>, i)),
        { concurrency: "inherit" }
      )
}

/**
 * @tsplus pipeable Iterable batch
 * @tsplus static Collection.Ops batch
 */
export function batch<R, E, A, R2, E2, A2, T>(
  n: number,
  forEachItem: (item: T, iWithinBatch: number, batchI: number) => Effect<R, E, A>,
  forEachBatch: (a: NonEmptyArray<A>, i: number) => Effect<R2, E2, A2>
) {
  return (items: Iterable<T>) =>
    items
      .chunk(n)
      .forEachEffect((_, i) =>
        _
          .forEachEffect((_, j) => forEachItem(_, j, i), { concurrency: "inherit" })
          .flatMap((_) => forEachBatch(_ as NonEmptyArray<A>, i))
      )
}

// /**
//  * @tsplus pipeable Iterable rateLimit
//  * @tsplus static Collection.Ops rateLimit
//  */
// export function rateLimit(
//   n: number,
//   d: DUR
// ) {
//   return <T>(items: Iterable<T>) =>
//     <R, E, A, R2, E2, A2>(
//       forEachItem: (i: T) => Effect<R, E, A>,
//       forEachBatch: (a: Chunk<A>) => Effect<R2, E2, A2>
//     ) =>
//       Stream.fromCollection(items)
//         .rechunk(n)
//         .throttleShape(n, d, () => n)
//         .mapChunksEffect(_ => _.forEachEffectPar(forEachItem).tap(forEachBatch))
//         .runCollect
// }

/**
 * @tsplus pipeable Iterable naiveRateLimit
 * @tsplus static Collection.Ops naiveRateLimit
 */

export function naiveRateLimit(
  n: number,
  d: DUR
) {
  return <T>(items: Iterable<T>) => (<R, E, A, R2, E2, A2>(
    forEachItem: (i: T) => Effect<R, E, A>,
    forEachBatch: (a: A[]) => Effect<R2, E2, A2>
  ) =>
    items
      .chunk(n)
      .forEachEffect((batch, i) =>
        ((i === 0) ? Effect.unit : Effect.sleep(d))
          .zipRight(
            batch
              .forEachEffect(forEachItem, { concurrency: n })
              .flatMap(forEachBatch)
          )
      ))
}
