// ets_tracing: off

/* eslint-disable @typescript-eslint/no-namespace */
import type { Async } from "@effect-ts/core/Async"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { SortedSet } from "@effect-ts/core/Collections/Immutable/SortedSet"
import type * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type * as T from "@effect-ts/core/Effect"
import type { Cause } from "@effect-ts/core/Effect/Cause"
import type { Clock, HasClock } from "@effect-ts/core/Effect/Clock"
import type { Exit } from "@effect-ts/core/Effect/Exit"
import type * as Fiber from "@effect-ts/core/Effect/Fiber"
import type { Layer } from "@effect-ts/core/Effect/Layer"
import type * as M from "@effect-ts/core/Effect/Managed"
import type * as P from "@effect-ts/core/Effect/Promise"
import type { Schedule } from "@effect-ts/core/Effect/Schedule"
import type { Scope } from "@effect-ts/core/Effect/Scope"
import type { Supervisor } from "@effect-ts/core/Effect/Supervisor"
import type * as E from "@effect-ts/core/Either"
import type { Lazy, Predicate, Refinement } from "@effect-ts/core/Function"
import type { Has, Tag } from "@effect-ts/core/Has"
import type * as IO from "@effect-ts/core/IO"
import type * as O from "@effect-ts/core/Option"
import type {
  _A,
  _E,
  _R,
  Compute,
  EnforceNonEmptyRecord,
  Erase,
  ForcedArray,
  Separated
} from "@effect-ts/core/Utils"
import type { NoSuchElementException } from "@effect-ts/system/GlobalExceptions"

declare module "@effect-ts/system/Effect/effect" {
  export const Effect: EffectStaticOps

  export interface EffectStaticOps {
    /**
     * @ets_rewrite_static access from "@effect-ts/core/Effect"
     */
    access: typeof T.access

    /**
     * @ets_rewrite_static accessM from "@effect-ts/core/Effect"
     */
    accessM: typeof T.accessM

    /**
     * @ets_rewrite_static accessServiceM from "@effect-ts/core/Effect"
     */
    accessServiceM: typeof T.accessServiceM

    /**
     * @ets_rewrite_static accessService from "@effect-ts/core/Effect"
     */
    accessService: typeof T.accessService

    /**
     * @ets_rewrite_static accessServices from "@effect-ts/core/Effect"
     */
    accessServices: typeof T.accessServices

    /**
     * @ets_rewrite_static accessServices from "@effect-ts/core/Effect"
     */
    accessServicesM: typeof T.accessServicesM

    /**
     * @ets_rewrite_static accessServicesT from "@effect-ts/core/Effect"
     */
    accessServicesT: typeof T.accessServicesT

    /**
     * @ets_rewrite_static accessServicesTM from "@effect-ts/core/Effect"
     */
    accessServicesTM: typeof T.accessServicesTM

    /**
     * @ets_rewrite_static collect from "@effect-ts/core/Effect"
     * @ets_data_first collect_
     */
    collect<A, R, E, B>(
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collect_ from "@effect-ts/core/Effect"
     */
    collect<A, R, E, B>(
      self: Iterable<A>,
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAll from "@effect-ts/core/Effect"
     */
    collectAll: typeof T.collectAll

    /**
     * @ets_rewrite_static collectAllPar from "@effect-ts/core/Effect"
     */
    collectAllPar: typeof T.collectAllPar

    /**
     * @ets_rewrite_static collectAllPar from "@effect-ts/core/Effect"
     * @ets_data_first collectAllParN_
     */
    collectAllParN(
      n: number,
      __trace?: string | undefined
    ): <R, E, A>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static collectAllParN_ from "@effect-ts/core/Effect"
     */
    collectAllParN<R, E, A>(
      as: Iterable<Effect<R, E, A>>,
      n: number,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static collectAllSuccesses from "@effect-ts/core/Effect"
     */
    collectAllSuccesses: typeof T.collectAllSuccesses

    /**
     * @ets_rewrite_static collectAllSuccessesPar from "@effect-ts/core/Effect"
     */
    collectAllSuccessesPar: typeof T.collectAllSuccessesPar

    /**
     * @ets_rewrite_static collectAllSuccessesPar from "@effect-ts/core/Effect"
     */
    collectAllSuccessesParN: typeof T.collectAllSuccessesParN

    /**
     * @ets_rewrite_static collectAllUnit from "@effect-ts/core/Effect"
     */
    collectAllUnit: typeof T.collectAllUnit

    /**
     * @ets_rewrite_static collectAllUnit from "@effect-ts/core/Effect"
     */
    collectAllUnitPar: typeof T.collectAllUnitPar

    /**
     * @ets_rewrite_static collectAllUnitParN from "@effect-ts/core/Effect"
     * @ets_data_first collectAllUnitParN_
     */
    collectAllUnitParN(
      n: number,
      __trace?: string | undefined
    ): <R, E, A>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, void>

    /**
     * @ets_rewrite_static collectAllUnitParN_ from "@effect-ts/core/Effect"
     */
    collectAllUnitParN<R, E, A>(
      as: Iterable<Effect<R, E, A>>,
      n: number,
      __trace?: string | undefined
    ): Effect<R, E, void>

    /**
     * @ets_rewrite_static collectAllWith from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWith_
     */
    collectAllWith<A, B>(
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAllWith_ from "@effect-ts/core/Effect"
     */
    collectAllWith<R, E, A, B>(
      as: Iterable<Effect<R, E, A>>,
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAllWithPar from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWithPar_
     */
    collectAllWithPar<A, B>(
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAllWithPar_ from "@effect-ts/core/Effect"
     */
    collectAllWithPar<R, E, A, B>(
      as: Iterable<Effect<R, E, A>>,
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAllWithParN from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWithParN_
     */
    collectAllWithParN<A, B>(
      n: number,
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectAllWithParN_ from "@effect-ts/core/Effect"
     */
    collectAllWithParN<R, E, A, B>(
      as: Iterable<Effect<R, E, A>>,
      n: number,
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectPar from "@effect-ts/core/Effect"
     * @ets_data_first collectPar_
     */
    collectPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectPar_ from "@effect-ts/core/Effect"
     */
    collectPar<A, R, E, B>(
      self: Iterable<A>,
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectParN from "@effect-ts/core/Effect"
     * @ets_data_first collectParN_
     */
    collectParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static collectParN_ from "@effect-ts/core/Effect"
     */
    collectParN<A, R, E, B>(
      self: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static cond from "@effect-ts/core/Effect"
     * @ets_data_first cond_
     */
    cond<E, A>(
      onTrue: () => A,
      onFalse: () => E,
      __trace?: string | undefined
    ): (b: boolean) => T.Effect<unknown, E, A>

    /**
     * @ets_rewrite_static cond_ from "@effect-ts/core/Effect"
     */
    cond<E, A>(
      b: boolean,
      onTrue: () => A,
      onFalse: () => E,
      __trace?: string | undefined
    ): T.Effect<unknown, E, A>

    /**
     * @ets_rewrite_static condM from "@effect-ts/core/Effect"
     * @ets_data_first condM_
     */
    condM<R, R2, E, A>(
      onTrue: T.RIO<R, A>,
      onFalse: T.RIO<R2, E>,
      __trace?: string | undefined
    ): (b: boolean) => T.Effect<R & R2, E, A>

    /**
     * @ets_rewrite_static condM_ from "@effect-ts/core/Effect"
     */
    condM<R, R2, E, A>(
      b: boolean,
      onTrue: T.RIO<R, A>,
      onFalse: T.RIO<R2, E>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E, A>

    /**
     * @ets_rewrite_static Applicative from "@effect-ts/core/Effect"
     */
    descriptor: typeof T.descriptor

    /**
     * @ets_rewrite_static descriptorWith from "@effect-ts/core/Effect"
     */
    descriptorWith: typeof T.descriptorWith

    /**
     * @ets_rewrite_static dropWhile from "@effect-ts/core/Effect"
     * @ets_data_first dropWhile_
     */
    dropWhile<A, R, E>(
      p: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Array<A>>

    /**
     * @ets_rewrite_static dropWhile_ from "@effect-ts/core/Effect"
     */
    dropWhile<A, R, E>(
      as: Iterable<A>,
      p: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, Array<A>>

    /**
     * @ets_rewrite_static Applicative from "@effect-ts/core/Effect"
     */
    Applicative: typeof T.Applicative

    /**
     * @ets_rewrite_static effectAsyncInterrupt from "@effect-ts/core/Effect"
     */
    asyncInterrupt<R, E, A>(
      register: (cb: T.Cb<Effect<R, E, A>>) => T.Canceler<R>,
      __trace?: string | undefined
    ): Effect<R, E, A>

    /**
     * @ets_rewrite_static effectAsyncInterruptBlockingOn from "@effect-ts/core/Effect"
     */
    asyncInterrupt<R, E, A>(
      register: (cb: T.Cb<T.Effect<R, E, A>>) => T.Canceler<R>,
      blockingOn: readonly Fiber.FiberID[],
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static effectAsync from "@effect-ts/core/Effect"
     */
    async<R, E, A>(
      register: (cb: T.Cb<Effect<R, E, A>>) => void,
      __trace?: string | undefined
    ): Effect<R, E, A>

    /**
     * @ets_rewrite_static effectAsyncBlockingOn from "@effect-ts/core/Effect"
     */
    async<R, E, A>(
      register: (cb: T.Cb<T.Effect<R, E, A>>) => void,
      blockingOn: readonly Fiber.FiberID[],
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static effectAsyncM from "@effect-ts/core/Effect"
     */
    asyncEffect<R, E, R2, E2, A, X>(
      register: (cb: (_: T.Effect<R2, E2, A>) => void) => T.Effect<R, E, X>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A>

    /**
     * @ets_rewrite_static effectAsyncOption from "@effect-ts/core/Effect"
     */
    asyncOption<R, E, A>(
      register: (cb: (_: T.Effect<R, E, A>) => void) => O.Option<T.Effect<R, E, A>>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static effectAsyncOptionBlockingOn from "@effect-ts/core/Effect"
     */
    asyncOption<R, E, A>(
      register: (cb: (_: Effect<R, E, A>) => void) => O.Option<Effect<R, E, A>>,
      blockingOn: readonly Fiber.FiberID[],
      __trace?: string
    ): Effect<R, E, A>

    /**
     * @ets_rewrite_static effectMaybeAsyncInterrupt from "@effect-ts/core/Effect"
     */
    asyncOptionInterrupt<R, E, A>(
      register: (
        cb: T.Cb<T.Effect<R, E, A>>
      ) => E.Either<T.Canceler<R>, T.Effect<R, E, A>>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static effectMaybeAsyncInterruptBlockingOn from "@effect-ts/core/Effect"
     */
    asyncOptionInterrupt<R, E, A>(
      register: (cb: T.Cb<Effect<R, E, A>>) => E.Either<T.Canceler<R>, Effect<R, E, A>>,
      blockingOn: readonly Fiber.FiberID[],
      __trace?: string
    ): Effect<R, E, A>

    /**
     * @ets_rewrite_static do from "@effect-ts/core/Effect"
     */
    do_: typeof T.do

    /**
     * @ets_rewrite_static deriveLifted from "@effect-ts/core/Effect"
     */
    deriveLifted: typeof T.deriveLifted

    /**
     * @ets_rewrite_static done from "@effect-ts/core/Effect"
     */
    done: typeof T.done

    /**
     * @ets_rewrite_static dieWith from "@effect-ts/core/Effect"
     */
    die: typeof T.dieWith

    /**
     * @ets_rewrite_static die from "@effect-ts/core/Effect"
     */
    dieNow: typeof T.die

    /**
     * @ets_rewrite_static defaultEnv from "@effect-ts/core/Effect"
     */
    defaultEnv: typeof T.defaultEnv

    /**
     * @ets_rewrite_static defaultPlatform from "@effect-ts/core/Effect"
     */
    defaultPlatform: typeof T.defaultPlatform

    /**
     * @ets_rewrite_static environment from "@effect-ts/core/Effect"
     */
    environment: typeof T.environment

    /**
     * @ets_rewrite_static forEach_ from "@effect-ts/core/Effect"
     */
    forEach<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEach from "@effect-ts/core/Effect"
     * @ets_data_first forEach_
     */
    forEach<A, R, E, B>(
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEachPar_ from "@effect-ts/core/Effect"
     */
    forEachPar<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEachPar from "@effect-ts/core/Effect"
     * @ets_data_first forEachPar_
     */
    forEachPar<A, R, E, B>(
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEachParN_ from "@effect-ts/core/Effect"
     */
    forEachParN<A, R, E, B>(
      as: Iterable<A>,
      n: number,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEachParN from "@effect-ts/core/Effect"
     * @ets_data_first forEachParN_
     */
    forEachParN<A, R, E, B>(
      n: number,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static failWith from "@effect-ts/core/Effect"
     */
    fail: typeof T.failWith

    /**
     * @ets_rewrite_static fail from "@effect-ts/core/Effect"
     */
    failNow: typeof T.fail

    /**
     * @ets_rewrite_static filter from "@effect-ts/core/Effect"
     * @ets_data_first filter_
     */
    filter<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filter_ from "@effect-ts/core/Effect"
     */
    filter<A, R, E>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterNot from "@effect-ts/core/Effect"
     * @ets_data_first filterNot_
     */
    filterNot<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterNot_ from "@effect-ts/core/Effect"
     */
    filterNot<A, R, E>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterNotPar from "@effect-ts/core/Effect"
     * @ets_data_first filterNotPar_
     */
    filterNotPar<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterNotPar_ from "@effect-ts/core/Effect"
     */
    filterNotPar<A, R, E>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterNotParN from "@effect-ts/core/Effect"
     * @ets_data_first filterNotParN_
     */
    filterNotParN<R, E, A>(
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static filterNotParN_ from "@effect-ts/core/Effect"
     */
    filterNotParN<A, R, E>(
      as: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static filterPar from "@effect-ts/core/Effect"
     * @ets_data_first filterPar_
     */
    filterPar<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterPar_ from "@effect-ts/core/Effect"
     */
    filterPar<A, R, E>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, readonly A[]>

    /**
     * @ets_rewrite_static filterParN from "@effect-ts/core/Effect"
     * @ets_data_first filterParN_
     */
    filterParN<A, R, E>(
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static filterParN_ from "@effect-ts/core/Effect"
     */
    filterParN<A, R, E>(
      as: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_static forEachExec from "@effect-ts/core/Effect"
     * @ets_data_first forEachExec_
     */
    forEachExec<R, E, A, B>(
      es: T.ExecutionStrategy,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static forEachExec_ from "@effect-ts/core/Effect"
     */
    forEachExec<R, E, A, B>(
      as: Iterable<A>,
      es: T.ExecutionStrategy,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_static first from "@effect-ts/core/Effect"
     */
    first: typeof T.first

    /**
     * @ets_rewrite_static forkAll from "@effect-ts/core/Effect"
     */
    forkAll: typeof T.forkAll

    /**
     * @ets_rewrite_static forkAllUnit from "@effect-ts/core/Effect"
     */
    forkAllUnit: typeof T.forkAllUnit

    /**
     * @ets_rewrite_static forkScope from "@effect-ts/core/Effect"
     */
    forkScope: typeof T.forkScope

    /**
     * @ets_rewrite_static forkScopeMask from "@effect-ts/core/Effect"
     * @ets_data_first forkScopeMask_
     */
    forkScopeMask<R, E, A>(
      f: (restore: T.ForkScopeRestore) => T.Effect<R, E, A>,
      __trace?: string | undefined
    ): (newScope: Scope<Exit<any, any>>) => T.Effect<R, E, A>

    /**
     * @ets_rewrite_static forkScopeMask_ from "@effect-ts/core/Effect"
     */
    forkScopeMask<R, E, A>(
      newScope: Scope<Exit<any, any>>,
      f: (restore: T.ForkScopeRestore) => T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static forkScope from "@effect-ts/core/Effect"
     */
    forkScopeWith: typeof T.forkScopeWith

    /**
     * @ets_rewrite_static firstSuccessOf from "@effect-ts/core/Effect"
     */
    firstSuccessOf: typeof T.firstSuccessOf

    /**
     * @ets_rewrite_static fromAsync from "@effect-ts/core/Effect"
     */
    from<R, E, A>(
      async: Async<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static fromEither from "@effect-ts/core/Effect"
     */
    from<E, A>(
      f: () => E.Either<E, A>,
      __trace?: string | undefined
    ): T.Effect<unknown, E, A>

    /**
     * @ets_rewrite_static fromFiber from "@effect-ts/core/Effect"
     */
    from<E, A>(fiber: () => Fiber.Fiber<E, A>, __trace?: string | undefined): T.IO<E, A>

    /**
     * @ets_rewrite_static fromFiberM from "@effect-ts/core/Effect"
     */
    from<R, E, E2, A>(
      fiber: T.Effect<R, E, Fiber.Fiber<E2, A>>,
      __trace?: string | undefined
    ): T.Effect<R, E | E2, A>

    /**
     * @ets_rewrite_static fromPredicate from "@effect-ts/core/Effect"
     */
    from<E, A, B extends A>(
      refinement: Refinement<A, B>,
      onFalse: (a: A) => E
    ): (a: A) => IO<E, B>

    /**
     * @ets_rewrite_static fromPredicate from "@effect-ts/core/Effect"
     */
    from<E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => IO<E, A>

    /**
     * @ets_rewrite_static fromIO from "@effect-ts/core/Effect"
     */
    from<A>(io: IO.IO<A>, __trace?: string | undefined): T.Effect<unknown, never, A>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<L, R>(
      f: (this: unknown, cb: (e: L | null | undefined, r?: R) => void) => void,
      __trace?: string
    ): () => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A, L, R>(
      f: (this: unknown, a: A, cb: (e: L | null | undefined, r?: R) => void) => void,
      __trace?: string
    ): (a: A) => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A, B, L, R>(
      f: (
        this: unknown,
        a: A,
        b: B,
        cb: (e: L | null | undefined, r?: R) => void
      ) => void,
      __trace?: string
    ): (a: A, b: B) => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A, B, C, L, R>(
      f: (
        this: unknown,
        a: A,
        b: B,
        c: C,
        cb: (e: L | null | undefined, r?: R) => void
      ) => void,
      __trace?: string
    ): (a: A, b: B, c: C) => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A, B, C, D, L, R>(
      f: (
        this: unknown,
        a: A,
        b: B,
        c: C,
        d: D,
        cb: (e: L | null | undefined, r?: R) => void
      ) => void,
      __trace?: string
    ): (a: A, b: B, c: C, d: D) => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A, B, C, D, E, L, R>(
      f: (
        this: unknown,
        a: A,
        b: B,
        c: C,
        d: D,
        e: E,
        cb: (e: L | null | undefined, r?: R) => void
      ) => void,
      __trace?: string
    ): (a: A, b: B, c: C, d: D, e: E) => IO<L, R>

    /**
     * @ets_rewrite_static fromNodeCb from "@effect-ts/core/Effect"
     */
    from<A extends any[], L, R>(
      f: (
        this: unknown,
        ...args: [...A, (e: L | null | undefined, r?: R) => void]
      ) => void,
      __trace?: string
    ): (...args: A) => IO<L, R>

    /**
     * @ets_rewrite_static fromOption from "@effect-ts/core/Effect"
     */
    from<A>(o: O.Option<A>, __trace?: string | undefined): T.IO<O.Option<never>, A>

    /**
     * @ets_rewrite_static fromNullable from "@effect-ts/core/Effect"
     */
    fromNullable<A>(
      o: A,
      __trace?: string | undefined
    ): T.IO<O.Option<never>, NonNullable<A>>

    /**
     * @ets_rewrite_static gen from "@effect-ts/core/Effect"
     */
    gen: typeof T.gen

    /**
     * @ets_rewrite_static genM from "@effect-ts/core/Effect"
     */
    genM: typeof T.genM

    /**
     * @ets_rewrite_static getIdentity from "@effect-ts/core/Effect"
     */
    getIdentity: typeof T.getIdentity

    /**
     * @ets_rewrite_static getIdentityPar from "@effect-ts/core/Effect"
     */
    getIdentityPar: typeof T.getIdentityPar

    /**
     * @ets_rewrite_static getOrFail from "@effect-ts/core/Effect"
     */
    getOrFail: typeof T.getOrFail

    /**
     * @ets_rewrite_static getOrFailUnit from "@effect-ts/core/Effect"
     */
    getOrFailUnit: typeof T.getOrFailUnit

    /**
     * @ets_rewrite_static getValidationApplicative from "@effect-ts/core/Effect"
     */
    getValidationApplicative: typeof T.getValidationApplicative

    /**
     * @ets_rewrite_static haltWith from "@effect-ts/core/Effect"
     */
    halt: typeof T.haltWith

    /**
     * @ets_rewrite_static halt from "@effect-ts/core/Effect"
     */
    haltNow: typeof T.halt

    /**
     * @ets_rewrite_static if from "@effect-ts/core/Effect"
     * @ets_data_first if_
     */
    if<R1, E1, A1, R2, E2, A2>(
      onTrue: () => Effect<R1, E1, A1>,
      onFalse: () => Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): (b: boolean) => Effect<R1 & R2, E1 | E2, A1 | A2>

    /**
     * @ets_rewrite_static if_ from "@effect-ts/core/Effect"
     */
    if<R1, E1, A1, R2, E2, A2>(
      b: boolean,
      onTrue: () => T.Effect<R1, E1, A1>,
      onFalse: () => T.Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): T.Effect<R1 & R2, E1 | E2, A1 | A2>

    /**
     * @ets_rewrite_static interrupt from "@effect-ts/core/Effect"
     */
    interrupt: typeof T.interrupt

    /**
     * @ets_rewrite_static interruptAs from "@effect-ts/core/Effect"
     */
    interruptAs: typeof T.interruptAs

    /**
     * @ets_rewrite_static interruptibleMask from "@effect-ts/core/Effect"
     */
    interruptibleMask: typeof T.interruptibleMask

    /**
     * @ets_rewrite_static iterate from "@effect-ts/core/Effect"
     */
    iterate: typeof T.iterate

    /**
     * @ets_rewrite_static loop from "@effect-ts/core/Effect"
     */
    loop: typeof T.loop

    /**
     * @ets_rewrite_static loopUnit from "@effect-ts/core/Effect"
     */
    loopUnit: typeof T.loopUnit

    /**
     * @ets_rewrite_static makeCustomRuntime from "@effect-ts/core/Effect"
     */
    makeCustomRuntime: typeof T.makeCustomRuntime

    /**
     * @ets_rewrite_static mapN from "@effect-ts/core/Effect"
     * @ets_data_first mapN_
     */
    mapN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static mapN_ from "@effect-ts/core/Effect"
     */
    mapN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      t: Tp.Tuple<T>,
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static mapNPar from "@effect-ts/core/Effect"
     * @ets_data_first mapNPar_
     */
    mapNPar<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static mapNPar_ from "@effect-ts/core/Effect"
     */
    mapNPar<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      t: Tp.Tuple<T>,
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static mapNParN from "@effect-ts/core/Effect"
     * @ets_data_first mapNParN_
     */
    mapNParN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      n: number,
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static mapNParN_ from "@effect-ts/core/Effect"
     */
    mapNParN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      t: Tp.Tuple<T>,
      n: number,
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_static match from "@effect-ts/core/Effect"
     */
    match: typeof T.match

    /**
     * @ets_rewrite_static matchIn from "@effect-ts/core/Effect"
     */
    matchIn: typeof T.matchIn

    /**
     * @ets_rewrite_static matchMorph from "@effect-ts/core/Effect"
     */
    matchMorph: typeof T.matchMorph

    /**
     * @ets_rewrite_static matchTag from "@effect-ts/core/Effect"
     */
    matchTag: typeof T.matchTag

    /**
     * @ets_rewrite_static matchTagIn from "@effect-ts/core/Effect"
     */
    matchTagIn: typeof T.matchTagIn

    /**
     * @ets_rewrite_static memoize from "@effect-ts/core/Effect"
     */
    memoize: typeof T.memoize

    /**
     * @ets_rewrite_static memoizeEq from "@effect-ts/core/Effect"
     */
    memoizeEq: typeof T.memoizeEq

    /**
     * @ets_rewrite_static mergeAll from "@effect-ts/core/Effect"
     * @ets_data_first mergeAll_
     */
    mergeAll<A, B>(
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<T.Effect<R, E, A>>) => T.Effect<R, E, B>

    /**
     * @ets_rewrite_static mergeAll_ from "@effect-ts/core/Effect"
     */
    mergeAll<R, E, A, B>(
      as: Iterable<T.Effect<R, E, A>>,
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): T.Effect<R, E, B>

    /**
     * @ets_rewrite_static mergeAllPar from "@effect-ts/core/Effect"
     * @ets_data_first mergeAllPar_
     */
    mergeAllPar<A, B>(
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<T.Effect<R, E, A>>) => T.Effect<R, E, B>

    /**
     * @ets_rewrite_static mergeAllPar_ from "@effect-ts/core/Effect"
     */
    mergeAllPar<R, E, A, B>(
      as: Iterable<T.Effect<R, E, A>>,
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): T.Effect<R, E, B>

    /**
     * @ets_rewrite_static mergeAllParN from "@effect-ts/core/Effect"
     * @ets_data_first mergeAllParN_
     */
    mergeAllParN<A, B>(
      n: number,
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<T.Effect<R, E, A>>) => T.Effect<R, E, B>

    /**
     * @ets_rewrite_static mergeAllParN_ from "@effect-ts/core/Effect"
     */
    mergeAllParN<R, E, A, B>(
      as: Iterable<T.Effect<R, E, A>>,
      n: number,
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): T.Effect<R, E, B>

    /**
     * @ets_rewrite_static never from "@effect-ts/core/Effect"
     */
    never: typeof T.never

    /**
     * @ets_rewrite_static none from "@effect-ts/core/Effect"
     */
    none: typeof T.none

    /**
     * @ets_rewrite_static parallel from "@effect-ts/core/Effect"
     */
    parallel: typeof T.parallel

    /**
     * @ets_rewrite_static parallelN from "@effect-ts/core/Effect"
     */
    parallelN: typeof T.parallelN

    /**
     * @ets_rewrite_static partition from "@effect-ts/core/Effect"
     * @ets_data_first partition_
     */
    partition<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.RIO<R, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static partition_ from "@effect-ts/core/Effect"
     */
    partition<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.RIO<R, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static partitionPar from "@effect-ts/core/Effect"
     * @ets_data_first partitionPar_
     */
    partitionPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.RIO<R, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static partitionPar_ from "@effect-ts/core/Effect"
     */
    partitionPar<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.RIO<R, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static partitionParN from "@effect-ts/core/Effect"
     * @ets_data_first partitionParN_
     */
    partitionParN<A, R, E, B>(
      n: number,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string
    ): (as: Iterable<A>) => Effect<R, never, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static partitionParN_ from "@effect-ts/core/Effect"
     */
    partitionParN<A, R, E, B>(
      as: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, never, Separated<Iterable<E>, Iterable<B>>>

    /**
     * @ets_rewrite_static prettyReporter from "@effect-ts/core/Effect"
     */
    prettyReporter: typeof T.prettyReporter

    /**
     * @ets_rewrite_static promise from "@effect-ts/core/Effect"
     */
    promise<A>(effect: Lazy<Promise<A>>, __trace?: string | undefined): UIO<A>

    /**
     * @ets_rewrite_static tryCatchPromise from "@effect-ts/core/Effect"
     */
    promise<E, A>(
      promise: Lazy<Promise<A>>,
      onReject: (reason: unknown) => E,
      __trace?: string | undefined
    ): T.IO<E, A>

    /**
     * @ets_rewrite_static provide from "@effect-ts/core/Effect"
     * @ets_data_first provide_
     */
    provide<R>(
      r: R,
      __trace?: string | undefined
    ): <E, A, R0>(next: T.Effect<R & R0, E, A>) => T.Effect<R0, E, A>

    /**
     * @ets_rewrite_static provide_ from "@effect-ts/core/Effect"
     */
    provide_<E, A, R0, R>(
      next: T.Effect<R & R0, E, A>,
      r: R,
      __trace?: string | undefined
    ): T.Effect<R0, E, A>

    /**
     * @ets_rewrite_static provideAll from "@effect-ts/core/Effect"
     * @ets_data_first provideAll_
     */
    provideAll<R>(
      r: R,
      __trace?: string | undefined
    ): <E, A>(next: T.Effect<R, E, A>) => T.Effect<unknown, E, A>

    /**
     * @ets_rewrite_static provideAll_ from "@effect-ts/core/Effect"
     */
    provideAll<R, E, A>(
      next: T.Effect<R, E, A>,
      r: R,
      __trace?: string | undefined
    ): T.Effect<unknown, E, A>

    /**
     * @ets_rewrite_static provideLayer from "@effect-ts/core/Effect"
     * @ets_data_first provideLayer_
     */
    provideLayer<R, E, A>(
      layer: Layer<R, E, A>
    ): <E1, A1>(self: T.Effect<A, E1, A1>) => T.Effect<R, E | E1, A1>

    /**
     * @ets_rewrite_static provideLayer_ from "@effect-ts/core/Effect"
     */
    provideLayer<R, E, A, E1, A1>(
      self: T.Effect<A, E1, A1>,
      layer: Layer<R, E, A>
    ): T.Effect<R, E | E1, A1>

    /**
     * @ets_rewrite_static provideSomeLayer from "@effect-ts/core/Effect"
     * @ets_data_first provideSomeLayer_
     */
    provideSomeLayer<R, E, A>(
      layer: Layer<R, E, A>
    ): <R1, E1, A1>(self: T.Effect<R1 & A, E1, A1>) => T.Effect<R & R1, E | E1, A1>

    /**
     * @ets_rewrite_static provideSomeLayer_ from "@effect-ts/core/Effect"
     */
    provideSomeLayer<R1, E1, A1, R, E, A>(
      self: T.Effect<R1 & A, E1, A1>,
      layer: Layer<R, E, A>
    ): T.Effect<R & R1, E | E1, A1>

    /**
     * @ets_rewrite_static provideSome from "@effect-ts/core/Effect"
     * @ets_data_first provideSome_
     */
    provideSome<R0, R>(
      f: (r0: R0) => R,
      __trace?: string | undefined
    ): <E, A>(effect: T.Effect<R, E, A>) => T.Effect<R0, E, A>

    /**
     * @ets_rewrite_static provideSome_ from "@effect-ts/core/Effect"
     */
    provideSome<R0, R, E, A>(
      effect: T.Effect<R, E, A>,
      f: (r0: R0) => R,
      __trace?: string | undefined
    ): T.Effect<R0, E, A>

    /**
     * @ets_rewrite_static raceAll from "@effect-ts/core/Effect"
     */
    raceAll: typeof T.raceAll

    /**
     * @ets_rewrite_static raceAllWait from "@effect-ts/core/Effect"
     */
    raceAllWait: typeof T.raceAllWait

    /**
     * @ets_rewrite_static raceAllWithStrategy from "@effect-ts/core/Effect"
     */
    raceAllWithStrategy: typeof T.raceAllWithStrategy

    /**
     * @ets_rewrite_static reduce from "@effect-ts/core/Effect"
     * @ets_data_first reduce_
     */
    reduce<Z, R, E, A>(
      zero: Z,
      f: (z: Z, a: A) => Effect<R, E, Z>,
      __trace?: string
    ): (i: Iterable<A>) => Effect<R, E, Z>

    /**
     * @ets_rewrite_static reduce_ from "@effect-ts/core/Effect"
     */
    reduce<A, Z, R, E>(
      i: Iterable<A>,
      zero: Z,
      f: (z: Z, a: A) => T.Effect<R, E, Z>,
      __trace?: string | undefined
    ): T.Effect<R, E, Z>

    /**
     * @ets_rewrite_static reduceAll from "@effect-ts/core/Effect"
     * @ets_data_first reduceAll_
     */
    reduceAll<A>(
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): <R, E>(as: NonEmptyArray<T.Effect<R, E, A>>) => T.Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceAll_ from "@effect-ts/core/Effect"
     */
    reduceAll<R, E, A>(
      as: NonEmptyArray<T.Effect<R, E, A>>,
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceAllPar from "@effect-ts/core/Effect"
     * @ets_data_first reduceAllPar_
     */
    reduceAllPar<A>(
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): <R, E>(as: NonEmptyArray<T.Effect<R, E, A>>) => T.Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceAllPar_ from "@effect-ts/core/Effect"
     */
    reduceAllPar<R, E, A>(
      as: NonEmptyArray<T.Effect<R, E, A>>,
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceAllParN from "@effect-ts/core/Effect"
     * @ets_data_first reduceAllParN_
     */
    reduceAllParN<A>(
      n: number,
      f: (acc: A, a: A) => A,
      __trace?: string
    ): <R, E>(as: NonEmptyArray<Effect<R, E, A>>) => Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceAllParN_ from "@effect-ts/core/Effect"
     */
    reduceAllParN<R, E, A>(
      as: NonEmptyArray<T.Effect<R, E, A>>,
      n: number,
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_static reduceRight from "@effect-ts/core/Effect"
     * @ets_data_first reduceRight_
     */
    reduceRight<R, E, A, Z>(
      zero: Z,
      f: (a: A, z: Z) => T.Effect<R, E, Z>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, E, Z>

    /**
     * @ets_rewrite_static reduceRight_ from "@effect-ts/core/Effect"
     */
    reduceRight<A, Z, R, E>(
      i: Iterable<A>,
      zero: Z,
      f: (a: A, z: Z) => T.Effect<R, E, Z>,
      __trace?: string | undefined
    ): T.Effect<R, E, Z>

    /**
     * @ets_rewrite_static runtime from "@effect-ts/core/Effect"
     */
    runtime: typeof T.runtime

    /**
     * @ets_rewrite_static second from "@effect-ts/core/Effect"
     */
    second: typeof T.second

    /**
     * @ets_rewrite_static sequential from "@effect-ts/core/Effect"
     */
    sequential: typeof T.sequential

    /**
     * @ets_rewrite_static service from "@effect-ts/core/Effect"
     */
    service: typeof T.service

    /**
     * @ets_rewrite_static services from "@effect-ts/core/Effect"
     */
    services: typeof T.services

    /**
     * @ets_rewrite_static sleep from "@effect-ts/core/Effect"
     */
    sleep: typeof T.sleep

    /**
     * @ets_rewrite_static struct from "@effect-ts/core/Effect"
     */
    struct: typeof T.struct

    /**
     * @ets_rewrite_static structPar from "@effect-ts/core/Effect"
     */
    structPar: typeof T.structPar

    /**
     * @ets_rewrite_static structParN from "@effect-ts/core/Effect"
     * @ets_data_first structParN_
     */
    structParN(
      n: number,
      __trace?: string
    ): <NER extends Record<string, Effect<any, any, any>>>(
      r: EnforceNonEmptyRecord<NER> & Record<string, Effect<any, any, any>>
    ) => Effect<
      _R<NER[keyof NER]>,
      _E<NER[keyof NER]>,
      { [K in keyof NER]: [NER[K]] extends [Effect<any, any, infer A>] ? A : never }
    >

    /**
     * @ets_rewrite_static structParN_ from "@effect-ts/core/Effect"
     */
    structParN<NER extends Record<string, Effect<any, any, any>>>(
      r: EnforceNonEmptyRecord<NER> & Record<string, Effect<any, any, any>>,
      n: number,
      __trace?: string
    ): Effect<
      _R<NER[keyof NER]>,
      _E<NER[keyof NER]>,
      {
        [K in keyof NER]: [NER[K]] extends [Effect<any, any, infer A>] ? A : never
      }
    >

    /**
     * @ets_rewrite_static succeedWith from "@effect-ts/core/Effect"
     */
    succeed: typeof T.succeedWith

    /**
     * @ets_rewrite_static suspend from "@effect-ts/core/Effect"
     */
    suspend: typeof T.suspend

    /**
     * @ets_rewrite_static succeed from "@effect-ts/core/Effect"
     */
    succeedNow: typeof T.succeed

    /**
     * @ets_rewrite_static trace from "@effect-ts/core/Effect"
     */
    trace: typeof T.trace

    /**
     * @ets_rewrite_static tracedMask from "@effect-ts/core/Effect"
     */
    tracedMask: typeof T.tracedMask

    /**
     * @ets_rewrite_static transplant from "@effect-ts/core/Effect"
     */
    transplant: typeof T.transplant

    /**
     * @ets_rewrite_static try from "@effect-ts/core/Effect"
     */
    try: typeof T.try

    /**
     * @ets_rewrite_static tryCatch from "@effect-ts/core/Effect"
     */
    tryCatch: typeof T.tryCatchOption

    /**
     * @ets_rewrite_static tryCatch from "@effect-ts/core/Effect"
     */
    tryCatchOption: typeof T.tryCatchOption

    /**
     * @ets_rewrite_static tryCatchSuspend from "@effect-ts/core/Effect"
     */
    tryCatchSuspend: typeof T.tryCatchSuspend

    /**
     * @ets_rewrite_static tryCatchPromise from "@effect-ts/core/Effect"
     */
    tryCatchPromise: typeof T.tryCatchPromise

    /**
     * @ets_rewrite_static tryPromise from "@effect-ts/core/Effect"
     */
    tryPromise: typeof T.tryPromise

    /**
     * @ets_rewrite_static tuple from "@effect-ts/core/Effect"
     */
    tuple: typeof T.tuple

    /**
     * @ets_rewrite_static tuplePar from "@effect-ts/core/Effect"
     */
    tuplePar: typeof T.tuplePar

    /**
     * @ets_rewrite_static tupleParN from "@effect-ts/core/Effect"
     */
    tupleParN: typeof T.tupleParN

    /**
     * @ets_rewrite_static uninterruptibleMask from "@effect-ts/core/Effect"
     */
    uninterruptibleMask: typeof T.uninterruptibleMask

    /**
     * @ets_rewrite_static union from "@effect-ts/core/Effect"
     */
    union: typeof T.union

    /**
     * @ets_rewrite_static unionFn from "@effect-ts/core/Effect"
     */
    unionFn: typeof T.unionFn

    /**
     * @ets_rewrite_static unit from "@effect-ts/core/Effect"
     */
    unit: typeof T.unit

    /**
     * @ets_rewrite_static unitTraced from "@effect-ts/core/Effect"
     */
    unitTraced: typeof T.unitTraced

    /**
     * @ets_rewrite_static untracedMask from "@effect-ts/core/Effect"
     */
    untracedMask: typeof T.untracedMask

    /**
     * @ets_rewrite_static validate from "@effect-ts/core/Effect"
     * @ets_data_first validate_
     */
    validate<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validate_ from "@effect-ts/core/Effect"
     */
    validate<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validatePar from "@effect-ts/core/Effect"
     * @ets_data_first validatePar_
     */
    validatePar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validatePar_ from "@effect-ts/core/Effect"
     */
    validatePar<A, R, E, B>(
      as: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validateParN from "@effect-ts/core/Effect"
     * @ets_data_first validateParN_
     */
    validateParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validateParN_ from "@effect-ts/core/Effect"
     */
    validateParN<A, R, E, B>(
      as: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validateExec from "@effect-ts/core/Effect"
     * @ets_data_first validateExec_
     */
    validateExec<R, E, A, B>(
      es: T.ExecutionStrategy,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string
    ): (as: Iterable<A>) => Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validateExec_ from "@effect-ts/core/Effect"
     */
    validateExec<A, R, E, B>(
      as: Iterable<A>,
      es: T.ExecutionStrategy,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, Chunk<B>>

    /**
     * @ets_rewrite_static validateFirst from "@effect-ts/core/Effect"
     * @ets_data_first validateFirst_
     */
    validateFirst<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static validateFirst_ from "@effect-ts/core/Effect"
     */
    validateFirst<A, R, E, B>(
      i: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static validateFirstPar from "@effect-ts/core/Effect"
     * @ets_data_first validateFirstPar_
     */
    validateFirstPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static validateFirstPar_ from "@effect-ts/core/Effect"
     */
    validateFirstPar<A, R, E, B>(
      i: Iterable<A>,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static validateFirstParN from "@effect-ts/core/Effect"
     * @ets_data_first validateFirstParN_
     */
    validateFirstParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static validateFirstParN_ from "@effect-ts/core/Effect"
     */
    validateFirstParN<A, R, E, B>(
      i: Iterable<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): T.Effect<R, Chunk<E>, B>

    /**
     * @ets_rewrite_static whenCase from "@effect-ts/core/Effect"
     * @ets_data_first whenCase_
     */
    whenCase<R, E, A, X>(
      pf: (a: A) => O.Option<T.Effect<R, E, X>>,
      __trace?: string | undefined
    ): (a: A) => T.Effect<R, E, void>

    /**
     * @ets_rewrite_static whenCase_ from "@effect-ts/core/Effect"
     */
    whenCase<R, E, A, X>(
      a: A,
      pf: (a: A) => O.Option<T.Effect<R, E, X>>,
      __trace?: string | undefined
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_static withChildren from "@effect-ts/core/Effect"
     */
    withChildren: typeof T.withChildren

    /**
     * @ets_rewrite_static withRuntime from "@effect-ts/core/Effect"
     */
    withRuntime: typeof T.withRuntime

    /**
     * @ets_rewrite_static withRuntime from "@effect-ts/core/Effect"
     */
    withRuntimeM: typeof T.withRuntimeM

    /**
     * @ets_rewrite_static yieldNow from "@effect-ts/core/Effect"
     */
    yieldNow: typeof T.yieldNow
  }

  export interface Base<R, E, A> extends Effect<R, E, A> {}

  export interface Effect<R, E, A> extends EffectOps {}

  export interface EffectOps {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method absolve from "@effect-ts/core/Effect"
     */
    absolve<RX, EX, EE, AA>(
      this: T.Effect<RX, EX, E.Either<EE, AA>>,
      __trace?: string
    ): T.Effect<RX, EX | EE, AA>

    /**
     * @ets_rewrite_method absorb from "@effect-ts/core/Effect"
     */
    absorb<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, unknown, A>

    /**
     * @ets_rewrite_method absorbWith_ from "@effect-ts/core/Effect"
     */
    absorbWith<R, A, E>(
      this: T.Effect<R, E, A>,
      f: (e: E) => unknown,
      __trace?: string | undefined
    ): T.Effect<R, unknown, A>

    /**
     * @ets_rewrite_method andThen_ from "@effect-ts/core/Effect"
     */
    andThen<R, E, A, E1, A1>(
      this: Effect<R, E, A>,
      fb: Effect<A, E1, A1>,
      __trace?: string
    ): Effect<R, E | E1, A1>

    /**
     * @ets_rewrite_method ap_ from "@effect-ts/core/Effect"
     */
    ap<R, E, B, R2, E2, A>(
      this: T.Effect<R, E, (a: A) => B>,
      fa: T.Effect<R2, E2, A>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, B>

    /**
     * @ets_rewrite_method asService_ from "@effect-ts/core/Effect"
     */
    asService<R, E, A>(
      this: T.Effect<R, E, A>,
      has: Tag<A>,
      __trace?: string | undefined
    ): T.Effect<R, E, Has<A>>

    /**
     * @ets_rewrite_method as_ from "@effect-ts/core/Effect"
     */
    as<RX, EX, AX, B>(
      this: T.Effect<RX, EX, AX>,
      b: B,
      __trace?: string
    ): T.Effect<RX, EX, B>

    /**
     * @ets_rewrite_method asSome from "@effect-ts/core/Effect"
     */
    asSome<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, O.Option<A>>

    /**
     * @ets_rewrite_method asSomeError from "@effect-ts/core/Effect"
     */
    asSomeError<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, O.Option<E>, A>

    /**
     * @ets_rewrite_method asUnit from "@effect-ts/core/Effect"
     */
    asUnit<R, E, X>(
      this: T.Effect<R, E, X>,
      __trace?: string | undefined
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method awaitAllChildren from "@effect-ts/core/Effect"
     */
    awaitAllChildren<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method bimap_ from "@effect-ts/core/Effect"
     */
    bimap<R, E, A, E2, B>(
      this: T.Effect<R, E, A>,
      f: (e: E) => E2,
      g: (a: A) => B,
      __trace?: string | undefined
    ): T.Effect<R, E2, B>

    /**
     * @ets_rewrite_method bind_ from "@effect-ts/core/Effect"
     */
    bind<RX, EX, AX extends Record<string, unknown>, N extends string, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      n: N & N extends keyof AX ? [`${N} already in use`] : N,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<
      RX & R2,
      EX | E2,
      Compute<
        AX & {
          readonly [k in N]: B
        },
        "flat"
      >
    >

    /**
     * @ets_rewrite_method bindAll_ from "@effect-ts/core/Effect"
     */
    bindAll<
      K,
      NER extends Record<string, Effect<any, any, any>> & {
        [k in keyof K & keyof NER]?: never
      },
      R,
      E
    >(
      this: Effect<R, E, K>,
      r: (k: K) => EnforceNonEmptyRecord<NER> & Record<string, Effect<any, any, any>>,
      __trace?: string
    ): Effect<
      R & _R<NER[keyof NER]>,
      E | _E<NER[keyof NER]>,
      Compute<
        K & {
          readonly [K in keyof NER]: [NER[K]] extends [Effect<any, any, infer A>]
            ? A
            : never
        },
        "flat"
      >
    >

    /**
     * @ets_rewrite_method bindAllPar_ from "@effect-ts/core/Effect"
     */
    bindAllPar<
      K,
      NER extends Record<string, Effect<any, any, any>> & {
        [k in keyof K & keyof NER]?: never
      },
      R,
      E
    >(
      this: Effect<R, E, K>,
      r: (k: K) => EnforceNonEmptyRecord<NER> & Record<string, Effect<any, any, any>>,
      __trace?: string
    ): Effect<
      R & _R<NER[keyof NER]>,
      E | _E<NER[keyof NER]>,
      Compute<
        K & {
          readonly [K in keyof NER]: [NER[K]] extends [Effect<any, any, infer A>]
            ? A
            : never
        },
        "flat"
      >
    >

    /**
     * @ets_rewrite_method bindAllParN_ from "@effect-ts/core/Effect"
     */
    bindAllParN<
      K,
      NER extends Record<string, Effect<any, any, any>> & {
        [k in keyof K & keyof NER]?: never
      },
      R,
      E
    >(
      this: Effect<R, E, K>,
      n: number,
      r: (k: K) => EnforceNonEmptyRecord<NER> & Record<string, Effect<any, any, any>>,
      __trace?: string
    ): Effect<
      R & _R<NER[keyof NER]>,
      E | _E<NER[keyof NER]>,
      Compute<
        K & {
          readonly [K in keyof NER]: [NER[K]] extends [Effect<any, any, infer A>]
            ? A
            : never
        },
        "flat"
      >
    >

    /**
     * @ets_rewrite_method bracketExit_ from "@effect-ts/core/Effect"
     */
    bracket<RX, EX, AX, R2, E2, A2, R3, B>(
      this: T.Effect<RX, EX, AX>,
      use: (a: AX) => Effect<R2, E2, A2>,
      release: (a: AX, exit: Exit<E2, A2>) => Effect<R3, never, B>,
      __trace?: string
    ): T.Effect<RX & R2 & R3, EX | E2, A2>

    /**
     * @ets_rewrite_method bracketFiber_ from "@effect-ts/core/Effect"
     */
    bracketFiber<R, E, A, R2, E2, A2>(
      this: Effect<R, E, A>,
      use: (f: Fiber.Runtime<E, A>) => Effect<R2, E2, A2>,
      __trace?: string
    ): Effect<R & R2, E2, Exit<E, A>>

    /**
     * @ets_rewrite_method bracketOnError_ from "@effect-ts/core/Effect"
     */
    bracketOnError<R, E, A, E1, R1, A1, R2, E2, X>(
      this: Effect<R, E, A>,
      use: (a: A) => Effect<R1, E1, A1>,
      release: (a: A, e: Exit<E1, A1>) => Effect<R2, E2, X>,
      __trace?: string
    ): Effect<R & R1 & R2, E | E1 | E2, A1>

    /**
     * @ets_rewrite_method cached_ from "@effect-ts/core/Effect"
     */
    cached<R, E, A>(
      this: T.Effect<R, E, A>,
      ttl: number,
      __trace?: string | undefined
    ): T.RIO<R & Has<Clock>, T.IO<E, A>>

    /**
     * @ets_rewrite_method cachedInvalidate_ from "@effect-ts/core/Effect"
     */
    cachedInvalidate<R, E, A>(
      this: T.Effect<R, E, A>,
      ttl: number,
      __trace?: string | undefined
    ): T.RIO<R & Has<Clock>, Tp.Tuple<[T.IO<E, A>, T.UIO<void>]>>

    /**
     * @ets_rewrite_method catchAll_ from "@effect-ts/core/Effect"
     */
    catchAll<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: (e: EX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, E2, AX | B>

    /**
     * @ets_rewrite_method catchTag_ from "@effect-ts/core/Effect"
     */
    catchTag<
      RX,
      EX,
      AX,
      Tag extends (EX extends { _tag: infer X } ? X : never) & string,
      R2,
      E2,
      B
    >(
      this: T.Effect<RX, EX, AX>,
      tag: Tag,
      f: (e: Extract<EX, { readonly _tag: Tag }>) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, E2 | Exclude<EX, { readonly _tag: Tag }>, AX | B>

    /**
     * @ets_rewrite_method catchAllCause_ from "@effect-ts/core/Effect"
     */
    catchAllCause<R2, E2, A2, R, E, A>(
      this: T.Effect<R2, E2, A2>,
      f: (_: Cause<E2>) => T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R2 & R, E, A2 | A>

    /**
     * @ets_rewrite_method catchAllDefect_ from "@effect-ts/core/Effect"
     */
    catchAllDefect<R2, E2, A2, R, E, A>(
      this: T.Effect<R2, E2, A2>,
      f: (_: unknown) => T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R2 & R, E2 | E, A2 | A>

    /**
     * @ets_rewrite_method catchSome_ from "@effect-ts/core/Effect"
     */
    catchSome<R, E, A, R2, E2, A2>(
      this: T.Effect<R, E, A>,
      f: (e: E) => O.Option<T.Effect<R2, E2, A2>>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A | A2>

    /**
     * @ets_rewrite_method catchSomeCause_ from "@effect-ts/core/Effect"
     */
    catchSomeCause<R2, E2, A2, R, E, A>(
      this: T.Effect<R2, E2, A2>,
      f: (_: Cause<E2>) => O.Option<T.Effect<R, E, A>>,
      __trace?: string | undefined
    ): T.Effect<R2 & R, E2 | E, A2 | A>

    /**
     * @ets_rewrite_method catchSomeDefect_ from "@effect-ts/core/Effect"
     */
    catchSomeDefect<R2, E2, A2, R, E, A>(
      this: T.Effect<R2, E2, A2>,
      f: (_: unknown) => O.Option<T.Effect<R, E, A>>,
      __trace?: string | undefined
    ): T.Effect<R2 & R, E2 | E, A2 | A>

    /**
     * @ets_rewrite_method cause from "@effect-ts/core/Effect"
     */
    cause<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.RIO<R, Cause<E>>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts/core/Effect"
     */
    chain<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method chainError_ from "@effect-ts/core/Effect"
     */
    chainError<R, E, A, R2, E2>(
      this: T.Effect<R, E, A>,
      f: (e: E) => T.RIO<R2, E2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E2, A>

    /**
     * @ets_rewrite_method compose_ from "@effect-ts/core/Effect"
     */
    compose<A, E1, B, R, E>(
      this: T.Effect<R, E, A>,
      that: T.Effect<A, E1, B>,
      __trace?: string | undefined
    ): T.Effect<R, E1 | E, B>

    /**
     * @ets_rewrite_method continueOrFail_ from "@effect-ts/core/Effect"
     */
    continueOrFail<R, E, E1, A, A2>(
      this: Effect<R, E, A>,
      f: () => E1,
      pf: (a: A) => O.Option<A2>,
      __trace?: string
    ): Effect<R, E | E1, A2>

    /**
     * @ets_rewrite_method continueOrFailM_ from "@effect-ts/core/Effect"
     */
    continueOrFailM<R, E, E1, A, R2, E2, A2>(
      this: Effect<R, E, A>,
      f: () => E1,
      pf: (a: A) => O.Option<Effect<R2, E2, A2>>,
      __trace?: string
    ): Effect<R & R2, E | E1 | E2, A2>

    /**
     * @ets_rewrite_method delay_ from "@effect-ts/core/Effect"
     */
    delay<R, E, A>(
      this: T.Effect<R, E, A>,
      ms: number,
      __trace?: string | undefined
    ): T.Effect<R & Has<Clock>, E, A>

    /**
     * @ets_rewrite_method either from "@effect-ts/core/Effect"
     */
    either<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      __trace?: string
    ): T.Effect<RX, never, E.Either<EX, AX>>

    /**
     * @ets_rewrite_method ensuring_ from "@effect-ts/core/Effect"
     */
    ensuring<RX, EX, AX, R1, X>(
      this: T.Effect<RX, EX, AX>,
      finalizer: Effect<R1, never, X>,
      __trace?: string
    ): T.Effect<RX & R1, EX, AX>

    /**
     * @ets_rewrite_method ensuringChild_ from "@effect-ts/core/Effect"
     */
    ensuringChild<R, E, A, R2, X>(
      this: T.Effect<R, E, A>,
      f: (_: Fiber.Fiber<any, Chunk<unknown>>) => T.RIO<R2, X>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E, A>

    /**
     * @ets_rewrite_method ensuringChildren_ from "@effect-ts/core/Effect"
     */
    ensuringChildren<R, E, A, R1, X>(
      this: T.Effect<R, E, A>,
      children: (_: SortedSet<Fiber.Runtime<any, any>>) => T.RIO<R1, X>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E, A>

    /**
     * @ets_rewrite_method eventually from "@effect-ts/core/Effect"
     */
    eventually<R, E, A>(
      fa: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, A>

    /**
     * @ets_rewrite_method flatten from "@effect-ts/core/Effect"
     */
    flatten<R, E, R1, E1, A>(
      this: T.Effect<R, E, T.Effect<R1, E1, A>>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E | E1, A>

    /**
     * @ets_rewrite_method flattenErrorOption_ from "@effect-ts/core/Effect"
     */
    flattenErrorOption<R, E, A, E2>(
      this: T.Effect<R, O.Option<E>, A>,
      def: () => E2,
      __trace?: string | undefined
    ): T.Effect<R, E | E2, A>

    /**
     * @ets_rewrite_method flip from "@effect-ts/core/Effect"
     */
    flip<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, A, E>

    /**
     * @ets_rewrite_method flipWith_ from "@effect-ts/core/Effect"
     */
    flipWith<R, E, A, R2, E2, A2>(
      this: T.Effect<R, E, A>,
      f: (self: T.Effect<R, A, E>) => T.Effect<R2, A2, E2>,
      __trace?: string | undefined
    ): T.Effect<R2, E2, A2>

    /**
     * @ets_rewrite_method foldCauseM_ from "@effect-ts/core/Effect"
     */
    foldCauseM<RX, EX, AX, R2, E2, A2, R3, E3, A3>(
      this: T.Effect<RX, EX, AX>,
      g: (e: Cause<EX>) => T.Effect<R3, E3, A3>,
      f: (a: AX) => T.Effect<R2, E2, A2>,
      __trace?: string
    ): T.Effect<RX & R2 & R3, E2 | E3, A2 | A3>

    /**
     * @ets_rewrite_method foldM_ from "@effect-ts/core/Effect"
     */
    foldM<RX, EX, AX, R2, E2, A2, R3, E3, A3>(
      this: T.Effect<RX, EX, AX>,
      g: (e: EX) => T.Effect<R3, E3, A3>,
      f: (a: AX) => T.Effect<R2, E2, A2>,
      __trace?: string
    ): T.Effect<RX & R2 & R3, E2 | E3, A2 | A3>

    /**
     * @ets_rewrite_method forever from "@effect-ts/core/Effect"
     */
    forever<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, never>

    /**
     * @ets_rewrite_method fork from "@effect-ts/core/Effect"
     */
    fork<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      __trace?: string
    ): T.Effect<RX, never, Fiber.FiberContext<EX, AX>>

    /**
     * @ets_rewrite_method forkAs_ from "@effect-ts/core/Effect"
     */
    forkAs<R, E, A>(
      this: T.Effect<R, E, A>,
      name: string,
      __trace?: string | undefined
    ): T.RIO<R, Fiber.FiberContext<E, A>>

    /**
     * @ets_rewrite_method forkManaged from "@effect-ts/core/Effect"
     */
    forkManaged<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      __trace?: string
    ): M.Managed<RX, never, Fiber.Fiber<EX, AX>>

    /**
     * @ets_rewrite_method forkDaemon from "@effect-ts/core/Effect"
     */
    forkDaemon<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.RIO<R, Fiber.FiberContext<E, A>>

    /**
     * @ets_rewrite_method forkDaemonReport_ from "@effect-ts/core/Effect"
     */
    forkDaemonReport<R, E, A>(
      this: T.Effect<R, E, A>,
      reportFailure: T.FailureReporter,
      __trace?: string | undefined
    ): T.RIO<R, Fiber.FiberContext<E, A>>

    /**
     * @ets_rewrite_method forkIn_ from "@effect-ts/core/Effect"
     */
    forkIn<R, E, A>(
      this: T.Effect<R, E, A>,
      scope: Scope<Exit<any, any>>,
      __trace?: string | undefined
    ): T.RIO<R, Fiber.Runtime<E, A>>

    /**
     * @ets_rewrite_method forkInReport_ from "@effect-ts/core/Effect"
     */
    forkInReport<R, E, A>(
      this: T.Effect<R, E, A>,
      scope: Scope<Exit<any, any>>,
      reportFailure: T.FailureReporter,
      __trace?: string | undefined
    ): T.RIO<R, Fiber.Runtime<E, A>>

    /**
     * @ets_rewrite_method forkWithErrorHandler_ from "@effect-ts/core/Effect"
     */
    forkWithErrorHandler<R, R2, E, A>(
      self: T.Effect<R, E, A>,
      handler: (e: E) => T.RIO<R2, void>,
      __trace?: string | undefined
    ): T.RIO<R & R2, Fiber.FiberContext<E, A>>

    /**
     * @ets_rewrite_method get from "@effect-ts/core/Effect"
     */
    get<R, E, A>(
      this: T.Effect<R, E, O.Option<A>>,
      __trace?: string | undefined
    ): T.Effect<R, O.Option<E>, A>

    /**
     * @ets_rewrite_method ifM_ from "@effect-ts/core/Effect"
     */
    ifM<R, E, R1, E1, A1, R2, E2, A2>(
      this: Effect<R, E, boolean>,
      onTrue: () => Effect<R1, E1, A1>,
      onFalse: () => Effect<R2, E2, A2>,
      __trace?: string
    ): Effect<R & R1 & R2, E | E1 | E2, A1 | A2>

    /**
     * @ets_rewrite_method provideAll_ from "@effect-ts/core/Effect"
     */
    injectAll<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      env: AX
    ): T.Effect<unknown, EX, AX>

    /**
     * @ets_rewrite_method provideAll_ from "@effect-ts/core/Effect"
     */
    injectEnv<RX, EX, AX, AX2>(
      this: T.Effect<RX, EX, AX>,
      env: AX2
    ): T.Effect<RX extends Has<AX2> & infer K ? K : unknown, EX, AX>

    /**
     * @ets_rewrite_method provideSome_ from "@effect-ts/core/Effect"
     */
    injectSome<RX, EX, AX, R2>(
      this: T.Effect<RX, EX, AX>,
      env: (_: R2) => AX
    ): T.Effect<R2, EX, AX>

    /**
     * @ets_rewrite_method provideService_ from "@effect-ts/core/Effect"
     */
    injectService<RX, EX, AX, A2>(
      this: T.Effect<RX, EX, AX>,
      tag: Tag<A2>,
      value: A2
    ): T.Effect<RX extends Has<A2> & infer K ? K : unknown, EX, AX>

    /**
     * @ets_rewrite_method provideServiceM_ from "@effect-ts/core/Effect"
     */
    injectServiceM<RX, EX, AX, R2, E2, A2>(
      this: T.Effect<RX, EX, AX>,
      tag: Tag<A2>,
      value: T.Effect<R2, E2, A2>
    ): T.Effect<R2 & (RX extends Has<A2> & infer K ? K : unknown), EX | E2, AX>

    /**
     * @ets_rewrite_method provideSomeLayer_ from "@effect-ts/core/Effect"
     */
    inject<RX, EX, AX, R2, E2, A2>(
      this: T.Effect<RX, EX, AX>,
      layer: Layer<R2, E2, A2>
    ): T.Effect<Erase<RX, A2> & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method ignore from "@effect-ts/core/Effect"
     */
    ignore<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.RIO<R, void>

    /**
     * @ets_rewrite_method in_ from "@effect-ts/core/Effect"
     */
    in<R, E, A>(
      this: T.Effect<R, E, A>,
      scope: Scope<any>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method interruptAllChildren from "@effect-ts/core/Effect"
     */
    interruptAllChildren<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method interruptStatus_ from "@effect-ts/core/Effect"
     */
    interruptStatus<R, E, A>(
      this: T.Effect<R, E, A>,
      flag: Fiber.InterruptStatus,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method interruptible from "@effect-ts/core/Effect"
     */
    interruptible<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method isFailure from "@effect-ts/core/Effect"
     */
    isFailure<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, boolean>

    /**
     * @ets_rewrite_method isSuccess from "@effect-ts/core/Effect"
     */
    isSuccess<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, boolean>

    /**
     * @ets_rewrite_method join_ from "@effect-ts/core/Effect"
     */
    join<R, E, A, R1, E1, A1>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R1, E1, A1>,
      __trace?: string | undefined
    ): T.Effect<E.Either<R, R1>, E | E1, A | A1>

    /**
     * @ets_rewrite_method joinEither_ from "@effect-ts/core/Effect"
     */
    joinEither<R, E, A, R1, E1, A1>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R1, E1, A1>,
      __trace?: string | undefined
    ): T.Effect<E.Either<R, R1>, E | E1, E.Either<A, A1>>

    /**
     * @ets_rewrite_method left from "@effect-ts/core/Effect"
     */
    left<R, E, B, C>(self: T.Effect<R, E, E.Either<B, C>>): T.Effect<R, O.Option<E>, B>

    /**
     * @ets_rewrite_method leftOrFail_ from "@effect-ts/core/Effect"
     */
    leftOrFail<R, E, B, C, E1>(
      this: T.Effect<R, E, E.Either<B, C>>,
      orFail: (c: C) => E1,
      __trace?: string | undefined
    ): T.Effect<R, E | E1, B>

    /**
     * @ets_rewrite_method leftOrFailException from "@effect-ts/core/Effect"
     */
    leftOrFailException<R, E, B, C>(
      this: T.Effect<R, E, E.Either<B, C>>,
      __trace?: string | undefined
    ): T.Effect<R, E | NoSuchElementException, B>

    /**
     * @ets_rewrite_method let_ from "@effect-ts/core/Effect"
     */
    let<RX, EX, AX extends Record<string, unknown>, N extends string, B>(
      this: T.Effect<RX, EX, AX>,
      n: N & N extends keyof AX ? [`${N} already in use`] : N,
      f: (a: AX) => B,
      __trace?: string
    ): T.Effect<
      RX,
      EX,
      Compute<
        AX & {
          readonly [k in N]: B
        },
        "flat"
      >
    >

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Effect"
     */
    map<RX, EX, AX, B>(
      this: T.Effect<RX, EX, AX>,
      f: (a: AX) => B,
      __trace?: string
    ): T.Effect<RX, EX, B>

    /**
     * @ets_rewrite_method mapErrorCause_ from "@effect-ts/core/Effect"
     */
    mapErrorCause<R, E, A, E2>(
      this: T.Effect<R, E, A>,
      f: (cause: Cause<E>) => Cause<E2>,
      __trace?: string | undefined
    ): T.Effect<R, E2, A>

    /**
     * @ets_rewrite_method mapError_ from "@effect-ts/core/Effect"
     */
    mapError<R, E, E2, A>(
      this: T.Effect<R, E, A>,
      f: (e: E) => E2,
      __trace?: string | undefined
    ): T.Effect<R, E2, A>

    /**
     * @ets_rewrite_method mapN_ from "@effect-ts/core/Effect"
     */
    mapN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      f: (..._: ForcedArray<{ [k in keyof T]: _A<T[k]> }>) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_method mapNPar_ from "@effect-ts/core/Effect"
     */
    mapNPar<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      f: (...args: ForcedArray<{ [k in keyof T]: _A<T[k]> }>) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_method mapNParN_ from "@effect-ts/core/Effect"
     */
    mapNParN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      n: number,
      f: (...args: ForcedArray<{ [k in keyof T]: _A<T[k]> }>) => B,
      __trace?: string
    ): (t: Tp.Tuple<T>) => Effect<_R<T[number]>, _E<T[number]>, B>

    /**
     * @ets_rewrite_method mapTryCatch_ from "@effect-ts/core/Effect"
     */
    mapTryCatch<R, E1, E, A, B>(
      this: T.Effect<R, E1, A>,
      f: (a: A) => B,
      onThrow: (u: unknown) => E,
      __trace?: string | undefined
    ): T.Effect<R, E1 | E, B>

    /**
     * @ets_rewrite_method merge from "@effect-ts/core/Effect"
     */
    merge<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, E | A>

    /**
     * @ets_rewrite_method onError_ from "@effect-ts/core/Effect"
     */
    onError<R, E, A, R2, E2, X>(
      this: T.Effect<R, E, A>,
      cleanup: (exit: Cause<E>) => T.Effect<R2, E2, X>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A>

    /**
     * @ets_rewrite_method onExit_ from "@effect-ts/core/Effect"
     */
    onExit<R, E, A, R2, E2, X>(
      this: T.Effect<R, E, A>,
      cleanup: (exit: Exit<E, A>) => T.Effect<R2, E2, X>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A>

    /**
     * @ets_rewrite_method onFirst from "@effect-ts/core/Effect"
     */
    onFirst<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, Tp.Tuple<[A, R]>>

    /**
     * @ets_rewrite_method onInterrupt_ from "@effect-ts/core/Effect"
     */
    onInterrupt<R, E, A, R2, X>(
      self: T.Effect<R, E, A>,
      cleanup: (interruptors: readonly Fiber.FiberID[]) => T.Effect<R2, never, X>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E, A>

    /**
     * @ets_rewrite_method onSecond from "@effect-ts/core/Effect"
     */
    onSecond<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, Tp.Tuple<[R, A]>>

    /**
     * @ets_rewrite_method onTermination_ from "@effect-ts/core/Effect"
     */
    onTermination<R1, R, E, A, X>(
      this: T.Effect<R, E, A>,
      cleanup: (_: Cause<never>) => T.RIO<R1, X>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E, A>

    /**
     * @ets_rewrite_method once from "@effect-ts/core/Effect"
     */
    once<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.UIO<T.Effect<R, E, void>>

    /**
     * @ets_rewrite_method onlyDefaultEnv from "smart:identity"
     */
    onlyDefaultEnv<E, A>(
      self: T.Effect<T.DefaultEnv, E, A>
    ): T.Effect<T.DefaultEnv, E, A>

    /**
     * @ets_rewrite_method option from "@effect-ts/core/Effect"
     */
    option<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.RIO<R, O.Option<A>>

    /**
     * @ets_rewrite_method optional from "@effect-ts/core/Effect"
     */
    optional<R, E, A>(
      this: T.Effect<R, O.Option<E>, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, O.Option<A>>

    /**
     * @ets_rewrite_method orDie from "@effect-ts/core/Effect"
     */
    orDie<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, A>

    /**
     * @ets_rewrite_method orDieKeep from "@effect-ts/core/Effect"
     */
    orDieKeep<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, A>

    /**
     * @ets_rewrite_method orDieWith_ from "@effect-ts/core/Effect"
     */
    orDieWith<R, E, A>(
      this: T.Effect<R, E, A>,
      f: (e: E) => unknown,
      __trace?: string | undefined
    ): T.Effect<R, never, A>

    /**
     * @ets_rewrite_method orElseEither_ from "@effect-ts/core/Effect"
     */
    orElseEither<R, E, A, R2, E2, A2>(
      this: T.Effect<R, E, A>,
      that: () => T.Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E2, E.Either<A, A2>>

    /**
     * @ets_rewrite_method orElseFail_ from "@effect-ts/core/Effect"
     */
    orElseFail<R, E, A, E2>(
      this: T.Effect<R, E, A>,
      e: E2,
      __trace?: string | undefined
    ): T.Effect<R, E2, A>

    /**
     * @ets_rewrite_method orElseOptional_ from "@effect-ts/core/Effect"
     */
    orElseOptional<R, E, A, R2, E2, A2>(
      this: T.Effect<R, O.Option<E>, A>,
      that: () => T.Effect<R2, O.Option<E2>, A2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, O.Option<E | E2>, A | A2>

    /**
     * @ets_rewrite_method orElseSucceed_ from "@effect-ts/core/Effect"
     */
    orElseSucceed<R, E, A, A2>(
      this: T.Effect<R, E, A>,
      a: A2,
      __trace?: string | undefined
    ): T.Effect<R, E, A | A2>

    /**
     * @ets_rewrite_method orElse_ from "@effect-ts/core/Effect"
     */
    orElse<R, E, A, R2, E2, A2>(
      this: T.Effect<R, E, A>,
      that: () => T.Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E2, A | A2>

    /**
     * @ets_rewrite_method overrideForkScope_ from "@effect-ts/core/Effect"
     */
    overrideForkScope<R, E, A>(
      this: T.Effect<R, E, A>,
      scope: Scope<Exit<any, any>>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method race_ from "@effect-ts/core/Effect"
     */
    race<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX | B>

    /**
     * @ets_rewrite_method raceEither_ from "@effect-ts/core/Effect"
     */
    raceEither<R, E, A, R2, E2, A2>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, E.Either<A, A2>>

    /**
     * @ets_rewrite_method raceFirst_ from "@effect-ts/core/Effect"
     */
    raceFirst<R, R2, E, E2, A, A2>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A | A2>

    /**
     * @ets_rewrite_method raceWith_ from "@effect-ts/core/Effect"
     */
    raceWith<R, E, A, R1, E1, A1, R2, E2, A2, R3, E3, A3>(
      this: Effect<R, E, A>,
      right: Effect<R1, E1, A1>,
      leftWins: (exit: Exit<E, A>, fiber: Fiber.Fiber<E1, A1>) => Effect<R2, E2, A2>,
      rightWins: (exit: Exit<E1, A1>, fiber: Fiber.Fiber<E, A>) => Effect<R3, E3, A3>,
      __trace?: string
    ): Effect<R & R1 & R2 & R3, E2 | E3, A2 | A3>

    /**
     * @ets_rewrite_method raceWithScope_ from "@effect-ts/core/Effect"
     */
    raceWithScope<R, E, A, R1, E1, A1, R2, E2, A2, R3, E3, A3>(
      this: Effect<R, E, A>,
      right: Effect<R1, E1, A1>,
      leftWins: (exit: Exit<E, A>, fiber: Fiber.Fiber<E1, A1>) => Effect<R2, E2, A2>,
      rightWins: (exit: Exit<E1, A1>, fiber: Fiber.Fiber<E, A>) => Effect<R3, E3, A3>,
      scope: Scope<Exit<any, any>>,
      __trace?: string
    ): Effect<R & R1 & R2 & R3, E2 | E3, A2 | A3>

    /**
     * @ets_rewrite_method refailWithTrace from "@effect-ts/core/Effect"
     */
    refailWithTrace<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method refineOrDie_ from "@effect-ts/core/Effect"
     */
    refineOrDie<R, A, E, E1>(
      this: T.Effect<R, E, A>,
      pf: (e: E) => O.Option<E1>,
      __trace?: string | undefined
    ): T.Effect<R, E1, A>

    /**
     * @ets_rewrite_method refineOrDieWith_ from "@effect-ts/core/Effect"
     */
    refineOrDieWith<R, A, E, E1>(
      this: T.Effect<R, E, A>,
      pf: (e: E) => O.Option<E1>,
      f: (e: E) => unknown,
      __trace?: string | undefined
    ): T.Effect<R, E1, A>

    /**
     * @ets_rewrite_method reject_ from "@effect-ts/core/Effect"
     */
    reject<R, E, A, E1>(
      this: T.Effect<R, E, A>,
      pf: (a: A) => O.Option<E1>,
      __trace?: string | undefined
    ): T.Effect<R, E | E1, A>

    /**
     * @ets_rewrite_method repeat_ from "@effect-ts/core/Effect"
     */
    repeat<R, E, A, SR, B>(
      this: T.Effect<R, E, A>,
      schedule: Schedule<SR, A, B>,
      __trace?: string | undefined
    ): T.Effect<R & SR & Has<Clock>, E, B>

    /**
     * @ets_rewrite_method repeatN_ from "@effect-ts/core/Effect"
     */
    repeatN<R, E, A>(
      this: T.Effect<R, E, A>,
      n: number,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method repeatOrElse_ from "@effect-ts/core/Effect"
     */
    repeatOrElse<R, E, A, SR, B, R2, E2, C>(
      this: Effect<R, E, A>,
      schedule: Schedule<SR, A, B>,
      orElse: (_: E, __: O.Option<B>) => Effect<R2, E2, C>,
      __trace?: string
    ): Effect<R & SR & R2 & HasClock, E2, C | B>

    /**
     * @ets_rewrite_method repeatOrElseEither_ from "@effect-ts/core/Effect"
     */
    repeatOrElseEither<R, E, Env1, A, B, R2, E2, C>(
      this: Effect<R, E, A>,
      schedule: Schedule<Env1, A, B>,
      orElse: (_: E, __: O.Option<B>) => Effect<R2, E2, C>,
      __trace?: string
    ): Effect<R & Env1 & R2 & HasClock, E2, E.Either<C, B>>

    /**
     * @ets_rewrite_method repeatUntilM_ from "@effect-ts/core/Effect"
     */
    repeatUntilM<R, E, A, R1, E1>(
      this: T.Effect<R, E, A>,
      f: (a: A) => T.Effect<R1, E1, boolean>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E | E1, A>

    /**
     * @ets_rewrite_method repeatUntil_ from "@effect-ts/core/Effect"
     */
    repeatUntil<R, E, A>(
      this: T.Effect<R, E, A>,
      f: (a: A) => boolean,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method repeatWhileM_ from "@effect-ts/core/Effect"
     */
    repeatWhileM<R, E, A, R1, E1>(
      this: T.Effect<R, E, A>,
      f: (a: A) => T.Effect<R1, E1, boolean>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E | E1, A>

    /**
     * @ets_rewrite_method repeatWhile_ from "@effect-ts/core/Effect"
     */
    repeatWhile<R, E, A>(
      this: T.Effect<R, E, A>,
      f: (a: A) => boolean,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method replaceService_ from "@effect-ts/core/Effect"
     */
    replaceService<R1, E1, A1, T>(
      ma: T.Effect<R1 & Has<T>, E1, A1>,
      tag: Tag<T>,
      f: (_: T) => T,
      __trace?: string | undefined
    ): T.Effect<R1 & Has<T>, E1, A1>

    /**
     * @ets_rewrite_method replaceServiceM_ from "@effect-ts/core/Effect"
     */
    replaceServiceM<R, E, T, R1, E1, A1>(
      this: Effect<R1 & Has<T>, E1, A1>,
      tag: Tag<T>,
      f: (_: T) => Effect<R, E, T>,
      __trace?: string
    ): Effect<R & R1 & Has<T>, E | E1, A1>

    /**
     * @ets_rewrite_method replicate_ from "@effect-ts/core/Effect"
     */
    replicate<R, E, A>(this: T.Effect<R, E, A>, n: number): readonly T.Effect<R, E, A>[]

    /**
     * @ets_rewrite_method require_ from "@effect-ts/core/Effect"
     */
    require<R, A, E, E2>(
      this: T.Effect<R, E, O.Option<A>>,
      error: () => E2,
      __trace?: string | undefined
    ): T.Effect<R, E | E2, A>

    /**
     * @ets_rewrite_method reserve_ from "@effect-ts/core/Effect"
     */
    reserve<R, E, R2, E2, R3, E3, B, A>(
      this: Effect<R, E, M.Reservation<R2, E2, A>>,
      use: (a: A) => Effect<R3, E3, B>,
      __trace?: string
    ): Effect<R & R2 & R3, E | E2 | E3, B>

    /**
     * @ets_rewrite_method resetForkScope_ from "@effect-ts/core/Effect"
     */
    resetForkScope<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method result from "@effect-ts/core/Effect"
     */
    result<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      __trace?: string
    ): T.Effect<RX, never, Exit<EX, AX>>

    /**
     * @ets_rewrite_method resurrect from "@effect-ts/core/Effect"
     */
    resurrect<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, unknown, A>

    /**
     * @ets_rewrite_method retry_ from "@effect-ts/core/Effect"
     */
    retry<R, E extends I, I, A, R1, O>(
      this: T.Effect<R, E, A>,
      policy: Schedule<R1, I, O>,
      __trace?: string | undefined
    ): T.Effect<R & R1 & Has<Clock>, E, A>

    /**
     * @ets_rewrite_method retryOrElse_ from "@effect-ts/core/Effect"
     */
    retryOrElse<R, E extends I, I, A, R1, O, R2, E2, A2>(
      self: Effect<R, E, A>,
      policy: Schedule<R1, I, O>,
      orElse: (e: E, o: O) => Effect<R2, E2, A2>,
      __trace?: string
    ): Effect<R & R1 & R2 & HasClock, E2, A | A2>

    /**
     * @ets_rewrite_method retryOrElseEither_ from "@effect-ts/core/Effect"
     */
    retryOrElseEither<R, E extends I, A, I, R1, O, R2, E2, A2>(
      self: Effect<R, E, A>,
      policy: Schedule<R1, I, O>,
      orElse: (e: E, o: O) => Effect<R2, E2, A2>,
      __trace?: string
    ): Effect<R & R1 & R2 & HasClock, E2, E.Either<A2, A>>

    /**
     * @ets_rewrite_method retryUntilM_ from "@effect-ts/core/Effect"
     */
    retryUntilM<R, E, A, R1, E1>(
      this: T.Effect<R, E, A>,
      f: (a: E) => T.Effect<R1, E1, boolean>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E | E1, A>

    /**
     * @ets_rewrite_method retryUntil_ from "@effect-ts/core/Effect"
     */
    retryUntil<R, E, A>(
      this: T.Effect<R, E, A>,
      f: (a: E) => boolean,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method retryWhileM_ from "@effect-ts/core/Effect"
     */
    retryWhileM<R, E, A, R1, E1>(
      this: T.Effect<R, E, A>,
      f: (a: E) => T.Effect<R1, E1, boolean>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E | E1, A>

    /**
     * @ets_rewrite_method retryWhile_ from "@effect-ts/core/Effect"
     */
    retryWhile<R, E, A>(
      this: T.Effect<R, E, A>,
      f: (a: E) => boolean,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method right from "@effect-ts/core/Effect"
     */
    right<R, E, B, C>(
      this: T.Effect<R, E, E.Either<B, C>>,
      __trace?: string | undefined
    ): T.Effect<R, O.Option<E>, C>

    /**
     * @ets_rewrite_method runPromise from "@effect-ts/core/Effect"
     */
    runPromise<EX, AX>(this: T.Effect<T.DefaultEnv, EX, AX>): Promise<AX>

    /**
     * @ets_rewrite_method runPromiseExit from "@effect-ts/core/Effect"
     */
    runPromiseExit<EX, AX>(this: T.Effect<T.DefaultEnv, EX, AX>): Promise<Exit<EX, AX>>

    /**
     * @ets_rewrite_method runFiber from "@effect-ts/core/Effect"
     */
    runFiber<EX, AX>(this: T.Effect<T.DefaultEnv, EX, AX>): Fiber.Fiber<EX, AX>

    /**
     * @ets_rewrite_method sandbox from "@effect-ts/core/Effect"
     */
    sandbox<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R, Cause<E>, A>

    /**
     * @ets_rewrite_method sandboxWith_ from "@effect-ts/core/Effect"
     */
    sandboxWith<R, E, A, E2>(
      this: Effect<R, E, A>,
      f: (_: Effect<R, Cause<E>, A>) => Effect<R, Cause<E2>, A>,
      __trace?: string
    ): Effect<R, E2, A>

    /**
     * @ets_rewrite_method some from "@effect-ts/core/Effect"
     */
    some<R, E, A>(
      this: T.Effect<R, E, O.Option<A>>,
      __trace?: string | undefined
    ): T.Effect<R, O.Option<E>, A>

    /**
     * @ets_rewrite_method someOrElseM_ from "@effect-ts/core/Effect"
     */
    someOrElseM<R, E, A, R2, E2, B>(
      this: T.Effect<R, E, O.Option<A>>,
      orElse: T.Effect<R2, E2, B>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, A | B>

    /**
     * @ets_rewrite_method someOrElse_ from "@effect-ts/core/Effect"
     */
    someOrElse<R, E, A, B>(
      this: T.Effect<R, E, O.Option<A>>,
      orElse: () => B,
      __trace?: string | undefined
    ): T.Effect<R, E, A | B>

    /**
     * @ets_rewrite_method someOrFail_ from "@effect-ts/core/Effect"
     */
    someOrFail<R, E, A, E2>(
      this: T.Effect<R, E, O.Option<A>>,
      orFail: () => E2,
      __trace?: string | undefined
    ): T.Effect<R, E | E2, A>

    /**
     * @ets_rewrite_method someOrFailException from "@effect-ts/core/Effect"
     */
    someOrFailException<R, E, A>(
      this: T.Effect<R, E, O.Option<A>>,
      __trace?: string | undefined
    ): T.Effect<R, E | NoSuchElementException, A>

    /**
     * @ets_rewrite_method summarized_ from "@effect-ts/core/Effect"
     */
    summarized<R, E, A, R2, E2, B, C>(
      this: Effect<R, E, A>,
      summary: Effect<R2, E2, B>,
      f: (start: B, end: B) => C,
      __trace?: string
    ): Effect<R & R2, E | E2, Tp.Tuple<[C, A]>>

    /**
     * @ets_rewrite_method supervised_ from "@effect-ts/core/Effect"
     */
    supervised<R, E, A>(
      this: T.Effect<R, E, A>,
      supervisor: Supervisor<any>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method tap_ from "@effect-ts/core/Effect"
     */
    tap<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapError_ from "@effect-ts/core/Effect"
     */
    tapError<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: (e: EX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapCause_ from "@effect-ts/core/Effect"
     */
    tapCause<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: (e: Cause<EX>) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapBoth_ from "@effect-ts/core/Effect"
     */
    tapBoth<RX, EX, AX, R2, E2, B, R3, E3, C>(
      this: T.Effect<RX, EX, AX>,
      f: (e: EX) => T.Effect<R2, E2, B>,
      g: (e: AX) => T.Effect<R2, E3, C>,
      __trace?: string
    ): T.Effect<RX & R2 & R3, EX | E2 | E3, AX>

    /**
     * @ets_rewrite_method fromRawEffect from "@effect-ts/core/Effect/Layer"
     */
    toLayer<RX, EX, AX>(this: T.Effect<RX, EX, AX>): Layer<RX, EX, AX>

    /**
     * @ets_rewrite_method fromEffect_ from "@effect-ts/core/Effect/Layer"
     */
    toLayer<RX, EX, AX>(
      this: T.Effect<RX, EX, AX>,
      tag: Tag<AX>
    ): Layer<RX, EX, Has<AX>>

    /**
     * @ets_rewrite_method fromEffect from "@effect-ts/core/Effect/Managed"
     */
    toManaged<RX, EX, AX>(this: T.Effect<RX, EX, AX>): M.Managed<RX, EX, AX>

    /**
     * @ets_rewrite_method toManagedRelease_ from "@effect-ts/core/Effect"
     */
    toManaged<A, R1, E1, R>(
      this: T.Effect<R1, E1, A>,
      release: (a: A) => T.Effect<R, never, any>
    ): M.Managed<R1 & R, E1, A>

    /**
     * @ets_rewrite_method timed from "@effect-ts/core/Effect"
     */
    timed<R, E, A>(
      this: T.Effect<R, E, A>,
      __trace?: string | undefined
    ): T.Effect<R & Has<Clock>, E, Tp.Tuple<[number, A]>>

    /**
     * @ets_rewrite_method timedWith_ from "@effect-ts/core/Effect"
     */
    timedWith<R, E, A, R2, E2>(
      this: T.Effect<R, E, A>,
      msTime: T.Effect<R2, E2, number>,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, Tp.Tuple<[number, A]>>

    /**
     * @ets_rewrite_method timeoutFail_ from "@effect-ts/core/Effect"
     */
    timeoutFail<R, E, E2, A>(
      this: T.Effect<R, E, A>,
      d: number,
      e: () => E2,
      __trace?: string | undefined
    ): T.Effect<R & Has<Clock>, E | E2, A>

    /**
     * @ets_rewrite_method timeoutTo_ from "@effect-ts/core/Effect"
     */
    timeoutTo<R, E, A, B, B2>(
      this: T.Effect<R, E, A>,
      delay: number,
      orElse: B,
      f: (a: A) => B2,
      __trace?: string | undefined
    ): T.Effect<R & Has<Clock>, E, B | B2>

    /**
     * @ets_rewrite_method timeout_ from "@effect-ts/core/Effect"
     */
    timeout<R, E, A>(
      this: T.Effect<R, E, A>,
      d: number,
      __trace?: string | undefined
    ): T.Effect<R & Has<Clock>, E, O.Option<A>>

    /**
     * @ets_rewrite_method to_ from "@effect-ts/core/Effect"
     */
    to<R, E, A>(
      this: T.Effect<R, E, A>,
      promise: P.Promise<E, A>,
      __trace?: string | undefined
    ): T.Effect<R, never, boolean>

    /**
     * @ets_rewrite_method traced from "@effect-ts/core/Effect"
     */
    traced<R, E, A>(this: T.Effect<R, E, A>): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method tracingStatus_ from "@effect-ts/core/Effect"
     */
    tracingStatus<R, E, A>(this: T.Effect<R, E, A>, flag: boolean): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method uncause from "@effect-ts/core/Effect"
     */
    uncause<R, E>(
      this: T.RIO<R, Cause<E>>,
      __trace?: string | undefined
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method unfailable from "smart:identity"
     */
    unfailable<R, A>(this: T.Effect<R, never, A>): T.RIO<R, A>

    /**
     * @ets_rewrite_method uninterruptible from "@effect-ts/core/Effect"
     */
    uninterruptible: <R, E, A>(effect: T.Effect<R, E, A>) => T.Effect<R, E, A>

    /**
     * @ets_rewrite_method unlessM_ from "@effect-ts/core/Effect"
     */
    unlessM<R2, E2, R, E, A>(
      this: T.Effect<R, E, A>,
      bool: T.Effect<R2, E2, boolean>,
      __trace?: string | undefined
    ): T.Effect<R2 & R, E2 | E, void>

    /**
     * @ets_rewrite_method unless_ from "@effect-ts/core/Effect"
     */
    unless<R, E, A>(
      this: T.Effect<R, E, A>,
      pred: () => boolean,
      __trace?: string | undefined
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method unrefineWith_ from "@effect-ts/core/Effect"
     */
    unrefineWith<R, E, E1, E2, A>(
      this: T.Effect<R, E, A>,
      pf: (u: unknown) => O.Option<E1>,
      f: (e: E) => E2,
      __trace?: string | undefined
    ): T.Effect<R, E1 | E2, A>

    /**
     * @ets_rewrite_method unrefine_ from "@effect-ts/core/Effect"
     */
    unrefine<R, E, A, E1>(
      this: T.Effect<R, E, A>,
      pf: (u: unknown) => O.Option<E1>,
      __trace?: string | undefined
    ): T.Effect<R, E | E1, A>

    /**
     * @ets_rewrite_method unrefine_ from "@effect-ts/core/Effect"
     */
    unsandbox<R, E, A>(
      this: T.Effect<R, Cause<E>, A>,
      __trace?: string | undefined
    ): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method untraced from "@effect-ts/core/Effect"
     */
    untraced<R, E, A>(this: T.Effect<R, E, A>): T.Effect<R, E, A>

    /**
     * @ets_rewrite_method updateService_ from "@effect-ts/core/Effect"
     */
    updateService<T, R, E, A>(
      this: T.Effect<R, E, A>,
      tag: Tag<T>,
      f: (_: T) => T,
      __trace?: string | undefined
    ): T.Effect<R & Has<T>, E, A>

    /**
     * @ets_rewrite_method whenM_ from "@effect-ts/core/Effect"
     */
    whenM<R1, E1, A, R, E>(
      this: T.Effect<R1, E1, A>,
      predicate: T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): T.Effect<R & R1, E1 | E, void>

    /**
     * @ets_rewrite_method when_ from "@effect-ts/core/Effect"
     */
    when<R1, E1, A>(
      this: T.Effect<R1, E1, A>,
      predicate: () => boolean,
      __trace?: string | undefined
    ): T.Effect<R1, E1, O.Option<A>>

    /**
     * @ets_rewrite_method zip_ from "@effect-ts/core/Effect"
     */
    zip<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, Tp.Tuple<[AX, B]>>

    /**
     * @ets_rewrite_method zipPar_ from "@effect-ts/core/Effect"
     */
    zipPar<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, Tp.Tuple<[AX, B]>>

    /**
     * @ets_rewrite_method zipRight_ from "@effect-ts/core/Effect"
     */
    zipRight<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method zipRightPar_ from "@effect-ts/core/Effect"
     */
    zipRightPar<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method zipLeft_ from "@effect-ts/core/Effect"
     */
    zipLeft<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method zipLeftPar_ from "@effect-ts/core/Effect"
     */
    zipLeftPar<RX, EX, AX, R2, E2, B>(
      this: T.Effect<RX, EX, AX>,
      f: T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method zipWith_ from "@effect-ts/core/Effect"
     */
    zipWith<R, E, A, R2, E2, A2, B>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R2, E2, A2>,
      f: (a: A, b: A2) => B,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, B>

    /**
     * @ets_rewrite_method zipWithPar_ from "@effect-ts/core/Effect"
     */
    zipWithPar<R, E, A, R2, E2, A2, B>(
      this: T.Effect<R, E, A>,
      that: T.Effect<R2, E2, A2>,
      f: (a: A, b: A2) => B,
      __trace?: string | undefined
    ): T.Effect<R & R2, E | E2, B>
  }
}
