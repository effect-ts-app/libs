import type { ServiceTagged } from "../service.js"

const S1 = Symbol()
const S2 = Symbol()
const W = Symbol()

/**
 * @tsplus type PureEnv
 */
export interface PureState<S, S2 = S> {
  readonly [S1]: (_: S) => void
  readonly [S2]: () => S2

  readonly state: Ref<S2>
}

/**
 * @tsplus type PureEnv
 */
export interface PureLog<W> {
  readonly [W]: () => W
  readonly log: Ref<Chunk<W>>
}

/**
 * @tsplus type PureEnv
 */
export interface PureEnv<W, S, S2 = S> extends PureState<S, S2>, PureLog<W> {}

export interface PureEnvTest extends PureState<any>, PureLog<any> {}

class PureEnvBase<W, S, S2 = S> implements PureEnv<W, S, S2> {
  readonly [W]!: () => W
  readonly [S1]!: (_: S) => void
  readonly [S2]!: () => S2
  readonly state: Ref<S2>
  readonly log: Ref<Chunk<W>>

  constructor(s: S2) {
    this.state = Ref.unsafeMake(s)
    this.log = Ref.unsafeMake(Chunk.empty<W>())
  }
}

export function makePureEnv<W, S, S2 = S>(s: S2): PureEnv<W, S, S2> {
  return new PureEnvBase<W, S, S2>(s)
}

/**
 * @tsplus unify PureEnv
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unifyPureEnv<X extends PureEnv<any, any, any>>(
  self: X
): PureEnv<
  [X] extends [{ [W]: () => infer W }] ? W : never,
  [X] extends [{ [S1]: (_: infer S) => void }] ? S : never,
  [X] extends [{ [S2]: () => infer S2 }] ? S2 : never
> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return self
}

/**
 * @tsplus type Pure
 */
export type Pure<W, S, S2, R, E, A> = Effect<PureEnvEnv<W, S, S2> | R, E, A>

// type dsl<W, S, S2> = ProgramDSL<W, S, S2>

/**
 * @tsplus static Pure.Ops GMUA_
 */
export function GMUA_<W, S, S2, GR, GE, GA, MR, ME, MA, UR, UE, UA>(
  get: Pure<W, S, S2, GR, GE, GA>,
  modify: (i: GA) => Pure<W, S, S2, MR, ME, readonly [GA, MA]>,
  update: (i: GA) => Pure<W, S, S2, UR, UE, UA>
): Pure<W, S, S2, GR | MR | UR, GE | ME | UE, MA> {
  return get.flatMap(modify).flatMap(([s, a]) => update(s).map(() => a))
}

/**
 * @tsplus static Pure.Ops GMUA
 */
export function GMUA<W, S, S2, GA, MR, ME, MA>(modify: (i: GA) => Pure<W, S, S2, MR, ME, readonly [GA, MA]>) {
  return <GR, GE, UR, UE, UA>(
    get: Pure<W, S, S2, GR, GE, GA>,
    update: (i: GA) => Pure<W, S, S2, UR, UE, UA>
  ) => GMUA_(get, modify, update)
}

/**
 * @tsplus static Pure.Ops GMU_
 */

export function GMU_<W, S, S2, GR, GE, GA, MR, ME, UR, UE, UA>(
  get: Pure<W, S, S2, GR, GE, GA>,
  modify: (i: GA) => Pure<W, S, S2, MR, ME, GA>,
  update: (i: GA) => Pure<W, S, S2, UR, UE, UA>
): Pure<W, S, S2, GR | MR | UR, GE | ME | UE, UA> {
  return get.flatMap(modify).flatMap(update)
}

/**
 * @tsplus static Pure.Ops GMU
 */
export function GMU<W, S, S2, GA, MR, ME>(modify: (i: GA) => Pure<W, S, S2, MR, ME, GA>) {
  return <GR, GE, UR, UE, UA>(
    get: Pure<W, S, S2, GR, GE, GA>,
    update: (i: GA) => Pure<W, S, S2, UR, UE, UA>
  ) => GMU_(get, modify, update)
}

const tagg = Tag<{ env: PureEnv<never, unknown, never> }>()
function castTag<W, S, S2>() {
  return tagg as any as Tag<PureEnvEnv<W, S, S2>>
}

export const PureEnvEnv = Symbol()
export interface PureEnvEnv<W, S, S2> extends ServiceTagged<typeof PureEnvEnv> {
  env: PureEnv<W, S, S2>
}

/**
 * @tsplus static Pure.Ops get
 */
export function get<S>(): Pure<never, S, S, never, never, S> {
  return Effect.serviceWithEffect(castTag<never, S, S>(), _ => _.env.state.get)
}

/**
 * @tsplus static Pure.Ops set
 */
export function set<S>(s: S): Pure<never, S, S, never, never, void> {
  return Effect.serviceWithEffect(castTag<never, S, S>(), _ => _.env.state.set(s))
}

export type PureLogT<W> = Pure<W, unknown, never, never, never, void>

/**
 * @tsplus static Pure.Ops log
 */
export function log<W>(w: W): PureLogT<W> {
  return Effect.serviceWithEffect(castTag<W, unknown, never>(), _ => _.env.log.update(l => l.append(w)))
}

/**
 * @tsplus static Pure.Ops logMany
 */
export function logMany<W>(w: Collection<W>): PureLogT<W> {
  return Effect.serviceWithEffect(castTag<W, unknown, never>(), _ => _.env.log.update(l => l.concat(w.toChunk)))
}

/**
 * @tsplus static Pure.Ops runAll
 * @tsplus fluent effect/core/io/Effect runAll
 */
export function runAll<R, E, A, W3, S1, S3, S4 extends S1>(
  self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
  s: S4
): Effect<Exclude<R, { env: PureEnv<W3, S1, S3> }>, never, readonly [Chunk<W3>, Either<E, readonly [S3, A]>]> {
  return self.flatMap(x =>
    Effect.serviceWithEffect(
      castTag<W3, S1, S3>(),
      ({ env: _ }) => Effect.struct({ log: _.log.get, state: _.state.get }) //            Ref.get(_.log).flatMap(log => Ref.get(_.state).map(state => ({ log, state })))
    ).map(
      (
        { log, state }
      ) => tuple(log, Either(tuple(state, x)) as Either<E, readonly [S3, A]>)
    )
  ).catchAll(
    err => Effect.serviceWith(tagg, env => tuple(env.env.log, Either.left(err) as Either<E, readonly [S3, A]>))
  ).provideService(tagg, { env: makePureEnv<W3, S3, S4>(s) as any }) as any
}

/**
 * @tsplus static Pure.Ops runResult
 * @tsplus fluent effect/core/io/Effect runResult
 */
export function runResult<R, E, A, W3, S1, S3, S4 extends S1>(
  self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
  s: S4
) {
  return runAll(self, s).map(([log, r]) => tuple(log, r.map(([s]) => s)))
}

/**
 * @tsplus static Pure.Ops runTerm
 * @tsplus fluent effect/core/io/Effect runTerm
 */
export function runTerm<R, E, A, W3, S1, S3, S4 extends S1>(
  self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
  s: S4
) {
  return runAll(self, s)
    .flatMap(([evts, r]) =>
      Effect.fromEither(r)
        .map(([s3, a]) => tuple(s3, evts.toArray, a))
    )
}

/**
 * @tsplus static Pure.Ops runTermDiscard
 * @tsplus fluent effect/core/io/Effect runTermDiscard
 */
export function runTermDiscard<R, E, A, W3, S1, S3, S4 extends S1>(
  self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
  s: S4
) {
  return self.runTerm(s).map(([s3, w3]) => tuple(s3, w3))
}

/**
 * @tsplus static Pure.Ops runA
 * @tsplus fluent effect/core/io/Effect runA
 */
export function runA<R, E, A, W3, S1, S3, S4 extends S1>(
  self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
  s: S4
) {
  return runAll(self, s).map(([log, r]) => tuple(log, r.map(([, a]) => a)))
}

/**
 * @tsplus static Pure.Ops modifyWith
 */
export function modify<S2, A, S3>(mod: (s: S2) => readonly [S3, A]): Effect<{ env: PureEnv<never, S2, S3> }, never, A> {
  return Effect.serviceWithEffect(
    castTag<never, S3, S2>(),
    _ => _.env.state.get.map(_ => mod(_)).flatMap(([s, a]) => _.env.state.set(s as any).map(() => a))
  ) as any
}

/**
 * @tsplus static Pure.Ops modifyWithEffect
 */
export function modifyM<W, R, E, A, S2, S3>(
  mod: (s: S2) => Effect<FixEnv<R, W, S2, S3>, E, readonly [S3, A]>
): Effect<FixEnv<R, W, S2, S3>, E, A> {
  // return serviceWithEffect(_ => Ref.modifyM_(_.state, mod))
  return Effect.serviceWithEffect(
    castTag<W, S3, S2>(),
    _ => _.env.state.get.flatMap(_ => mod(_)).flatMap(([s, a]) => _.env.state.set(s as any).map(() => a))
  ) as any
}

/**
 * @tsplus static Pure.Ops updateWith
 */
export function update<S2, S3>(upd: (s: S2) => S3) {
  return modify((_: S2) => {
    const r = upd(_)
    return tuple(r, r)
  })
}

export type FixEnv<R, W, S, S2> =
  | Exclude<R, PureEnvEnv<any, any, any>>
  | PureEnvEnv<W, S, S2>

/**
 * @tsplus static Pure.Ops updateWithEffect
 */
export function updateM<W, R, E, S2, S3>(
  upd: (s: S2, log: (evt: W) => PureLogT<W>) => Effect<FixEnv<R, W, S2, S3>, E, S3>
): Effect<FixEnv<R, W, S2, S3>, E, S3> {
  return modifyM((_: S2) => upd(_, Pure.log).map(_ => tuple(_, _)))
}

// export function getMA<W, S, A>(self: (s: S) => A): Pure<W, S, never, never, A> {
//   return Effect.accessM((_: PureState<S>) => Ref.get(_.state).map(self))
// }

// /**
//  * @tsplus static Pure.Ops getM
//  */
// export function getM<W, S, R, E, A>(self: (s: S) => Pure<W, S, R, E, A>): Pure<W, S, R, E, A> {
//   return Effect.accessM((_: PureState<S>) => Ref.get(_.state).flatMap(self))
// }

// export function getTM__<W, S, R, E, A>(self: (s: S) => Pure<W, S, R, E, A>) {
//   return (tag: Tag<PureEnv<W, S>>) => Effect.accessServiceM(tag)(_ => Ref.get(_.state).flatMap(self))
// }

// export function getTM_<W, S, R, E, A>(tag: Tag<PureEnv<W, S>>, self: (s: S) => Pure<W, S, R, E, A>) {
//   return Effect.accessServiceM(tag)(_ => Ref.get(_.state).flatMap(self))
// }

// export function getTM<W, S, R, E, A>(tag: Tag<PureEnv<W, S>>) {
//   const access = Effect.accessServiceM(tag)
//   return (self: (s: S) => Pure<W, S, R, E, A>) => access(_ => Ref.get(_.state).flatMap(self))
// }

/**
 * @tsplus type Pure.Ops
 */
export interface PureOps {
  $: PureAspects
}

/**
 * @tsplus type Pure.Aspects
 */

export interface PureAspects {}
export const Pure: PureOps = {
  $: {}
}

// /**
//  * @tsplus static Pure.Ops makeDSL
//  */
// export function makeProgramDSL<W, S, S2 = S>(): ProgramDSL<W, S, S2> {
//   return makeDSL_<W,S, S2>()
// }

// function makeDSL_<W, S, S2 = S>() {
//   const tag = tagg as unknown as Tag<PureEnvEnv<W, S, S2>>
//   const get = Effect.serviceWithEffect(tag, _ => _.env.state.get)
//   function getM<R, E, A>(self: (s: S2) => Effect<R, E, A>) { return get.flatMap(self) }
//   function get_<A>(self: (s: S2) => A) { return get.map(self)}
//   function set(s: S2) {
//     return Effect.serviceWithEffect(tag, _ => _.env.state.set(s))
//   }
//   function log<W2>(w: W2): Effect<{
//     env: PureEnv<W | W2, never, never>;
// }, never, void> {
//     return Effect.serviceWithEffect(tag, _ => _.env.log.update(l => l.append(w as any))) as any
//   }

//   const baseDSL = {
//     get,
//     log,
//     set
//   }

//   function modify<A, S3>(mod: (s: S2) => readonly [S3, A]): Effect<{
//     env: PureEnv<W, S, S3>;
// }, never, A> {
//     return Effect.serviceWithEffect(tag, _ =>
//       _.env.state.get.map(_ => mod(_)).flatMap(([s, a]) => _.env.state.set(s as any ).map(() => a))
//     ) as any
//   }

//   function modifyM<R, E, A, S3>(mod: (s: S2) => Effect<R, E, readonly [S3, A]>): Effect<{
//     env: PureEnv<W, S, S3>;
// } | R, E, A> {
//     // return serviceWithEffect(_ => Ref.modifyM_(_.state, mod))
//     return Effect.serviceWithEffect(tag, _ =>
//       _.env.state.get.flatMap(_ => mod(_ as unknown as S2)).flatMap(([s, a]) => _.env.state.set(s as any).map(() => a))
//     ) as any
//   }

//   function update<S3>(upd: (s: S2) => S3) {
//     return modify(_ => tuple(upd(_), void 0 as void))
//   }

//   function updateM<R, E, S3>(upd: (s: S2) => Effect<R, E, S3>) {
//     return modifyM(_ => upd(_).map(_ => tuple(_, void 0 as void)))
//   }

//   const accessLog = Effect.serviceWithEffect(tag, _ => _.env.log.get)

//   function runAll<R, E, A, W3, S1, S3, S4 extends S1>(
//     self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
//     s: S4
//   ): Effect<Exclude<R, { env: PureEnv<W3, S1, S3>}>, never, readonly [Chunk<W3>, Either<E, readonly [S3, A]>]> {
//     return self.flatMap(x =>
//       Effect.serviceWithEffect(tag, ({ env: _ }) =>
//         Effect.struct({ log: _.log.get, state: _.state.get })
//         //            Ref.get(_.log).flatMap(log => Ref.get(_.state).map(state => ({ log, state })))
//       ).map(
//         (
//           { log, state }
//         ) => tuple(log, Either(tuple(state, x)) as Either<E, readonly [S3, A]>)
//       )
//     ).catchAll(
//       err =>
//         accessLog.map(log =>
//           tuple(log, Either.left(err) as Either<E, readonly [S3, A]>)
//         )
//     ).provideService(tag, { env: makePureEnv<W3, S3, S4>(s) as any }) as any
//   }

//   function runResult<R, E, A, W3, S1, S3, S4 extends S1>(
//     self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
//     s: S4
//   ) {
//     return runAll(self, s).map(([log, r]) => tuple(log, r.map(([s]) => s)))
//   }

//   function runA<R, E, A, W3, S1, S3, S4 extends S1>(
//     self: Effect<FixEnv<R, W3, S1, S3>, E, A>,
//     s: S4
//   ) {
//     return runAll(self, s).map(([log, r]) => tuple(log, r.map(([, a]) => a)))
//   }

//   return {
//     ...baseDSL,

//     getM,
//     get_,
//     accessLog,
//     runAll,
//     runA,
//     runResult,

//     modify,
//     modifyM,
//     update,
//     updateM
//   }
// }

// type dsl_<W,S, S2 = S> = ReturnType<typeof makeDSL_<W, S, S2>>

// /**
//  * @tsplus type Pure/DSL
//  */
// export interface ProgramDSL<W, S, S2 = S> extends dsl_<W, S, S2> { }

// /**
//  * @tsplus fluent Pure/DSL modifyWithEffect
//  */
// export function dslmodifyM<W, S, R, E, A>(dsl: ProgramDSL<W, S>, mod: (s: S, dsl: ProgramDSL<W, S>) => Effect<R, E, readonly [S, A]>) {
//     return dsl.modifyM(_ => mod(_, dsl))
// }

// /**
//  * @tsplus fluent Pure/DSL modifyWith
//  */
// export function dslmodify<W, S, A>(dsl: ProgramDSL<W, S>, mod: (s: S, dsl: ProgramDSL<W, S>) => readonly [S, A]) {
//     return dsl.modify(_ => mod(_, dsl))
// }

// /**
//  * @tsplus fluent Pure/DSL updateWithEffect
//  */
// export function dslupdateM<W, S, R, E, S2, S3>(dsl: ProgramDSL<W, S, S2>, upd: (s: S2, dsl: ProgramDSL<W, S, S2>) => Effect<R, E, S3>) {
//     return dsl.updateM(_ => upd(_, dsl))
// }

// /**
//  * @tsplus fluent Pure/DSL updateWith
//  */
// export function dslupdate<W, S>(dsl: ProgramDSL<W, S>, upd: (s: S, dsl: ProgramDSL<W, S>) => S) {
//     return dsl.update(_ => upd(_, dsl))
// }

// export interface ZPure<out W, in S1, out S2, in R, out E, out A> {}

// export class ZPureImpl<out W, in S1, out S2, in R, out E, out A> implements ZPure<W, S1, S2, R, E, A> {
//   zipRight<W1, S3, R1, E1, B>(
//     f: ZPure<W1, S2, S3, R1, E1, B>
//   ): ZPure<W1 | W, S1, S3, R1 | R, E | E1, B> {
//     throw new Error("not implemented")
//   }

//   flatMap<W1, S3, R1, E1, B>(
//     f: (a: A) => ZPure<W1, S2, S3, R1, E1, B>
//   ): ZPure<W1 | W, S1, S3, R1 | R, E | E1, B> {
//     throw new Error("not implemented")

//   }
// }

// declare type Eff1 = Effect<PureEnv2<string, PrintingPickItem, PickItem>, never, void>

// function flatMap<R, R2, E, E2, A, A2, W, S, S2>(self: Effect<R| PureEnv2<W, S, S2>, E, A>, (s: S) => Effect<R2 | PureEnv2>) {
// }

// export interface PureEnv2<W, S, S2> extends PureState2<S, S2>, PureLog<W> {}

// const S1 = Symbol()
// const S2 = Symbol()
// const W = Symbol()
// export interface PureState2<S, S2> {
//   readonly [S1]: () => S
//   readonly [S2]: () => S2

//   readonly state: Ref<S>
// }

// const abc = Do($ => {
//   const s = $(Pure.get<{ a: 1 }>())
//   console.log(s)
//   // const a = $(Pure.log("hello"))
//   $(Pure.log("hallo" as const))
//   $(Pure.log("hello" as const))
//   $(Pure.log<"hallo" | "hello" | 5>(5))
// })

// declare const a: Effect<
//   | {
//     env: PureEnv<never, never, {
//       a: 1
//     }>
//   }
//   | { env: PureEnv<string, never, never> }
//   | { env: PureEnv<number, never, never> },
//   never,
//   never
// >
// type R = _R<typeof a>
// type Env<T> = T extends { env: infer rr } ? rr : never

// type RRRR = Env<R>

// const abcc = unifyPureEnv(
//   undefined as any as RRRR
// )
// const test = Pure.runAll(
//   abc,
//   { a: 1 }
// )
