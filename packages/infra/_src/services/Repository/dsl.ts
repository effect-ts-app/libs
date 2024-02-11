import type { FixEnv, PureLogT } from "effect-app/Pure"

export interface PureDSL<S, S2, W> {
  get: ReturnType<typeof Pure.get<S>>
  set: typeof Pure.set<S2>
  log: (...w: W[]) => PureLogT<W>
}

export const AnyPureDSL: PureDSL<any, any, any> = {
  get: Pure.get(),
  set: Pure.set,
  log: (...evt: any[]) => Pure.logMany(evt)
}

const anyDSL = makeDSL<any, any, any>()

export type AllDSL<T, Evt> =
  & (<R, A, E, S1 extends T, S2 extends T>(
    pure: (dsl: PureDSL<S1[], S2[], Evt>) => Effect<A, E, R>
  ) => Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>)
  & AllDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface AllDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1[], dsl: PureDSL<S1[], S2[], Evt>) => Effect<A, E, R>
  ) => Effect<A, E, FixEnv<R, Evt, S1[], S2[]>>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1[], log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<S2[], E, R>
  ) => Effect<S2[], E, FixEnv<R, Evt, S1[], S2[]>>
}

export function makeAllDSL<T, Evt>() {
  const dsl: AllDSL<T, Evt> = anyDSL
  return dsl
}

export type OneDSL<T, Evt> =
  & (<R, A, E, S1 extends T, S2 extends T>(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<A, E, FixEnv<R, Evt, S1, S2>>)
  & OneDSLExt<T, Evt>

/**
 * @tsplus type DSLExt
 */
export interface OneDSLExt<T, Evt> {
  modify: <R, E, A, S1 extends T, S2 extends T>(
    pure: (items: S1, dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<A, E, FixEnv<R, Evt, S1, S2> | PureEnvEnv<Evt, S1, S1>>
  update: <R, E, S1 extends T, S2 extends T>(
    pure: (items: S1, log: (...evt: Evt[]) => PureLogT<Evt>) => Effect<S2, E, FixEnv<R, Evt, S1, S2>>
  ) => Effect<S2, E, FixEnv<R, Evt, S1, S2>>
  updateWith: <S1 extends T, S2 extends T>(
    upd: (item: S1) => S2
  ) => Effect<S2, never, PureEnvEnv<Evt, S1, S2>>
}

export function makeOneDSL<T, Evt>(): OneDSL<T, Evt> {
  return anyDSL
}

export function makeDSL<S1, S2, Evt>() {
  const dsl: PureDSL<S1, S2, Evt> = AnyPureDSL

  function modify<
    R,
    E,
    A
  >(
    pure: (
      items: S1,
      dsl: PureDSL<S1, S2, Evt>
    ) => Effect<A, E, R>
  ): Effect<A, E, FixEnv<R, Evt, S1, S2>> {
    return dsl.get.flatMap((items) => pure(items, dsl)) as any
  }

  function update<
    R,
    E
  >(
    pure: (
      items: S1,
      log: (...evt: Evt[]) => PureLogT<Evt>
    ) => Effect<S2, E, R>
  ): Effect<S2, E, FixEnv<R, Evt, S1, S2>> {
    return dsl.get.flatMap((items) => pure(items, dsl.log).tap(dsl.set)) as any
  }

  function withDSL<
    R,
    A,
    E
  >(
    pure: (dsl: PureDSL<S1, S2, Evt>) => Effect<A, E, R>
  ): Effect<A, E, FixEnv<R, Evt, S1, S2>> {
    return pure(AnyPureDSL) as any
  }

  function updateWith(upd: (item: S1) => S2) {
    return update((_: S1) => Effect.sync(() => upd(_)))
  }

  return Object.assign(
    withDSL,
    {
      modify,
      update,
      updateWith
    }
  )
}

export interface DSLExt<S1, S2, Evt> extends ReturnType<typeof makeDSL<S1, S2, Evt>> {}

export function ifAny<T, R, E, A>(fn: (items: NonEmptyReadonlyArray<T>) => Effect<A, E, R>) {
  return (items: Iterable<T>) => Effect.sync(() => items.toNonEmptyArray).flatMapOpt(fn)
}

/**
 * @tsplus fluent Iterable ifAny
 */
export function ifAny_<T, R, E, A>(items: Iterable<T>, fn: (items: NonEmptyReadonlyArray<T>) => Effect<A, E, R>) {
  return Effect.sync(() => items.toNonEmptyArray).flatMapOpt(fn)
}
