/**
 * Ref has atomic modify support if synchronous, for Effect we need a TSemaphore.
 * @tsplus fluent effect/core/io/Ref modifyWithEffect
 */
export function modifyWithPermitWithEffect<A>(ref: Ref<A>, semaphore: TSemaphore) {
  return <R, E, A2>(mod: (a: A) => Effect<R, E, readonly [A2, A]>) =>
    semaphore.withPermit(
      ref.get
        .flatMap(mod)
        .tap(([, _]) => ref.set(_))
        .map(([_]) => _)
    )
}
