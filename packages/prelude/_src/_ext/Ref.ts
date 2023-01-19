/**
 * Ref has atomic modify support if synchronous, for Effect we need a Semaphore.
 * @tsplus fluent effect/io/Ref modifyWithEffect
 */
export function modifyWithPermitWithEffect<A>(ref: Ref<A>, semaphore: Semaphore) {
  const withPermit = semaphore.withPermits(1)
  return <R, E, A2>(mod: (a: A) => Effect<R, E, readonly [A2, A]>) =>
    withPermit(
      ref.get
        .flatMap(mod)
        .tap(([, _]) => ref.set(_))
        .map(([_]) => _)
    )
}
