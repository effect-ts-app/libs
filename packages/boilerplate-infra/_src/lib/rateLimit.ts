/**
 * Executes the specified effect, acquiring the specified number of permits
 * immediately before the effect begins execution and releasing them
 * delayed by duration after the effect completes execution, whether by success,
 * failure, or interruption.
 *
 * @tsplus static effect/core/stm/TSemaphore.Aspects withPermitsDuration
 * @tsplus pipeable effect/core/stm/TSemaphore withPermitsDuration
 */
export function withPermitsDuration(permits: number, duration: DUR) {
  return (self: TSemaphore): <R, E, A>(effect: Effect<R, E, A>) => Effect<R, E, A> => {
    return effect =>
      Effect.uninterruptibleMask(
        ({ restore }) =>
          restore(self.acquireN(permits).commit) >
            restore(effect)
              .ensuring(self.releaseN(permits).commit.delay(duration))
      )
  }
}

/**
 * @tsplus pipeable Collection batchNPar
 * @tsplus static Collection.Aspects batchNPar
 */
export function batchNPar<R, E, A, R2, E2, A2, T>(
  n: number,
  forEachItem: (i: T) => Effect<R, E, A>,
  forEachBatch: (a: Chunk<A>) => Effect<R2, E2, A2>
) {
  return (items: Iterable<T>) =>
    items.chunk(n)
      .forEachEffectPar(_ => _.forEachPar(forEachItem).flatMap(forEachBatch))
}

/**
 * @tsplus pipeable Collection batch
 * @tsplus static Collection.Aspects batch
 */
export function batch<R, E, A, R2, E2, A2, T>(
  n: number,
  forEachItem: (i: T) => Effect<R, E, A>,
  forEachBatch: (a: Chunk<A>) => Effect<R2, E2, A2>
) {
  return (items: Iterable<T>) =>
    items.chunk(n)
      .forEachEffect(_ => _.forEachPar(forEachItem).flatMap(forEachBatch))
}

/**
 * @tsplus pipeable Collection rateLimit
 * @tsplus static Collection.Aspects rateLimit
 */
export function rateLimit(
  n: number,
  d: DUR
) {
  return <T>(items: Iterable<T>) =>
    <R, E, A, R2, E2, A2>(
      forEachItem: (i: T) => Effect<R, E, A>,
      forEachBatch: (a: Chunk<A>) => Effect<R2, E2, A2>
    ) =>
      Stream.fromCollection(items)
        .rechunk(n)
        .throttleShape(n, d, () => n)
        .mapChunksEffect(_ => _.forEachEffectPar(forEachItem).tap(forEachBatch))
        .runCollect
}

/**
 * @tsplus pipeable Collection naiveRateLimit
 * @tsplus static Collection.Aspects naiveRateLimit
 */

export function naiveRateLimit(
  n: number,
  d: DUR
) {
  return <T>(items: Iterable<T>) => (<R, E, A, R2, E2, A2>(
    forEachItem: (i: T) => Effect<R, E, A>,
    forEachBatch: (a: Chunk<A>) => Effect<R2, E2, A2>
  ) =>
    items.chunk(n)
      .forEachEffectWithIndex((batch, i) =>
        ((i === 0) ? Effect.unit : Effect.unit.delay(d))
          .zipRight(
            batch.forEachEffectPar(forEachItem)
              .withParallelism(n)
              .flatMap(forEachBatch)
          )
      ))
}
