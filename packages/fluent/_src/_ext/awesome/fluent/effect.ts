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
import { absolve } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect absolve
 */
export const ext_absolve = absolve

import { absorb } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect absorb
 */
export const ext_absorb = absorb

import { absorbWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect absorbWith
 */
export const ext_absorbWith_ = absorbWith_

import { andThen_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect andThen
 */
export const ext_andThen_ = andThen_

import { ap_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ap
 */
export const ext_ap_ = ap_

import { asService_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect asService
 */
export const ext_asService_ = asService_

import { as_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect as
 */
export const ext_as_ = as_

import { asSome } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect asSome
 */
export const ext_asSome = asSome

import { asSomeError } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect asSomeError
 */
export const ext_asSomeError = asSomeError

import { asUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect asUnit
 */
export const ext_asUnit = asUnit

import { awaitAllChildren } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect awaitAllChildren
 */
export const ext_awaitAllChildren = awaitAllChildren

import { bimap_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bimap
 */
export const ext_bimap_ = bimap_

import { bind_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bind
 */
export const ext_bind_ = bind_

import { bindAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bindAll
 */
export const ext_bindAll_ = bindAll_

import { bindAllPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bindAllPar
 */
export const ext_bindAllPar_ = bindAllPar_

import { bindAllParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bindAllParN
 */
export const ext_bindAllParN_ = bindAllParN_

import { bracketExit_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bracket
 */
export const ext_bracketExit_ = bracketExit_

import { bracketFiber_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bracketFiber
 */
export const ext_bracketFiber_ = bracketFiber_

import { bracketOnError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect bracketOnError
 */
export const ext_bracketOnError_ = bracketOnError_

import { cached_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect cached
 */
export const ext_cached_ = cached_

import { cachedInvalidate_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect cachedInvalidate
 */
export const ext_cachedInvalidate_ = cachedInvalidate_

import { catchAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchAll
 */
export const ext_catchAll_ = catchAll_

import { catchTag_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchTag
 */
export const ext_catchTag_ = catchTag_

import { catchAllCause_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchAllCause
 */
export const ext_catchAllCause_ = catchAllCause_

import { catchAllDefect_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchAllDefect
 */
export const ext_catchAllDefect_ = catchAllDefect_

import { catchSome_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchSome
 */
export const ext_catchSome_ = catchSome_

import { catchSomeCause_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchSomeCause
 */
export const ext_catchSomeCause_ = catchSomeCause_

import { catchSomeDefect_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchSomeDefect
 */
export const ext_catchSomeDefect_ = catchSomeDefect_

import { cause } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect cause
 */
export const ext_cause = cause

import { chain_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect chain
 */
export const ext_chain_ = chain_

import { chainError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect chainError
 */
export const ext_chainError_ = chainError_

import { compose_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect compose
 */
export const ext_compose_ = compose_

import { continueOrFail_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect continueOrFail
 */
export const ext_continueOrFail_ = continueOrFail_

import { continueOrFailM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect continueOrFailM
 */
export const ext_continueOrFailM_ = continueOrFailM_

import { delay_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect delay
 */
export const ext_delay_ = delay_

import { either } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect either
 */
export const ext_either = either

import { ensuring_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ensuring
 */
export const ext_ensuring_ = ensuring_

import { ensuringChild_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ensuringChild
 */
export const ext_ensuringChild_ = ensuringChild_

import { ensuringChildren_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ensuringChildren
 */
export const ext_ensuringChildren_ = ensuringChildren_

import { eventually } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect eventually
 */
export const ext_eventually = eventually

import { flatten } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect flatten
 */
export const ext_flatten = flatten

import { flattenErrorOption_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect flattenErrorOption
 */
export const ext_flattenErrorOption_ = flattenErrorOption_

import { flip } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect flip
 */
export const ext_flip = flip

import { flipWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect flipWith
 */
export const ext_flipWith_ = flipWith_

import { foldCauseM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect foldCauseM
 */
export const ext_foldCauseM_ = foldCauseM_

import { foldM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect foldM
 */
export const ext_foldM_ = foldM_

import { forever } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forever
 */
export const ext_forever = forever

import { fork } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect fork
 */
export const ext_fork = fork

import { forkAs_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkAs
 */
export const ext_forkAs_ = forkAs_

import { forkManaged } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkManaged
 */
export const ext_forkManaged = forkManaged

import { forkDaemon } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkDaemon
 */
export const ext_forkDaemon = forkDaemon

import { forkDaemonReport_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkDaemonReport
 */
export const ext_forkDaemonReport_ = forkDaemonReport_

import { forkIn_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkIn
 */
export const ext_forkIn_ = forkIn_

import { forkInReport_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkInReport
 */
export const ext_forkInReport_ = forkInReport_

import { forkWithErrorHandler_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect forkWithErrorHandler
 */
export const ext_forkWithErrorHandler_ = forkWithErrorHandler_

import { get } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect get
 */
export const ext_get = get

import { ifM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ifM
 */
export const ext_ifM_ = ifM_

import { provideAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect injectAll
 */
export const ext_provideAll_ = provideAll_

import { provideAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect injectEnv
 */
export const ext_provideAll_ = provideAll_

import { provideSome_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect injectSome
 */
export const ext_provideSome_ = provideSome_

import { provideService_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect injectService
 */
export const ext_provideService_ = provideService_

import { provideServiceM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect injectServiceM
 */
export const ext_provideServiceM_ = provideServiceM_

import { provideSomeLayer_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect inject
 */
export const ext_provideSomeLayer_ = provideSomeLayer_

import { ignore } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect ignore
 */
export const ext_ignore = ignore

import { in_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect in
 */
export const ext_in_ = in_

import { interruptAllChildren } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect interruptAllChildren
 */
export const ext_interruptAllChildren = interruptAllChildren

import { interruptStatus_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect interruptStatus
 */
export const ext_interruptStatus_ = interruptStatus_

import { interruptible } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect interruptible
 */
export const ext_interruptible = interruptible

import { isFailure } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect isFailure
 */
export const ext_isFailure = isFailure

import { isSuccess } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect isSuccess
 */
export const ext_isSuccess = isSuccess

import { join_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect join
 */
export const ext_join_ = join_

import { joinEither_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect joinEither
 */
export const ext_joinEither_ = joinEither_

import { left } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect left
 */
export const ext_left = left

import { leftOrFail_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect leftOrFail
 */
export const ext_leftOrFail_ = leftOrFail_

import { leftOrFailException } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect leftOrFailException
 */
export const ext_leftOrFailException = leftOrFailException

import { let_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect let
 */
export const ext_let_ = let_

import { map_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect map
 */
export const ext_map_ = map_

import { mapErrorCause_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapErrorCause
 */
export const ext_mapErrorCause_ = mapErrorCause_

import { mapError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapError
 */
export const ext_mapError_ = mapError_

import { mapN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapN
 */
export const ext_mapN_ = mapN_

import { mapNPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapNPar
 */
export const ext_mapNPar_ = mapNPar_

import { mapNParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapNParN
 */
export const ext_mapNParN_ = mapNParN_

import { mapTryCatch_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapTryCatch
 */
export const ext_mapTryCatch_ = mapTryCatch_

import { merge } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect merge
 */
export const ext_merge = merge

import { onError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onError
 */
export const ext_onError_ = onError_

import { onExit_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onExit
 */
export const ext_onExit_ = onExit_

import { onFirst } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onFirst
 */
export const ext_onFirst = onFirst

import { onInterrupt_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onInterrupt
 */
export const ext_onInterrupt_ = onInterrupt_

import { onSecond } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onSecond
 */
export const ext_onSecond = onSecond

import { onTermination_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect onTermination
 */
export const ext_onTermination_ = onTermination_

import { once } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect once
 */
export const ext_once = once

    /**
     * @ets_rewrite_method onlyDefaultEnv from "smart:identity"
     */
    onlyDefaultEnv<E, A>(
      self: T.Effect<T.DefaultEnv, E, A>
    ): T.Effect<T.DefaultEnv, E, A>
import { option } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect option
 */
export const ext_option = option

import { optional } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect optional
 */
export const ext_optional = optional

import { orDie } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orDie
 */
export const ext_orDie = orDie

import { orDieKeep } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orDieKeep
 */
export const ext_orDieKeep = orDieKeep

import { orDieWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orDieWith
 */
export const ext_orDieWith_ = orDieWith_

import { orElseEither_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orElseEither
 */
export const ext_orElseEither_ = orElseEither_

import { orElseFail_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orElseFail
 */
export const ext_orElseFail_ = orElseFail_

import { orElseOptional_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orElseOptional
 */
export const ext_orElseOptional_ = orElseOptional_

import { orElseSucceed_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orElseSucceed
 */
export const ext_orElseSucceed_ = orElseSucceed_

import { orElse_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orElse
 */
export const ext_orElse_ = orElse_

import { overrideForkScope_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect overrideForkScope
 */
export const ext_overrideForkScope_ = overrideForkScope_

import { race_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect race
 */
export const ext_race_ = race_

import { raceEither_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect raceEither
 */
export const ext_raceEither_ = raceEither_

import { raceFirst_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect raceFirst
 */
export const ext_raceFirst_ = raceFirst_

import { raceWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect raceWith
 */
export const ext_raceWith_ = raceWith_

import { raceWithScope_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect raceWithScope
 */
export const ext_raceWithScope_ = raceWithScope_

import { refailWithTrace } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect refailWithTrace
 */
export const ext_refailWithTrace = refailWithTrace

import { refineOrDie_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect refineOrDie
 */
export const ext_refineOrDie_ = refineOrDie_

import { refineOrDieWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect refineOrDieWith
 */
export const ext_refineOrDieWith_ = refineOrDieWith_

import { reject_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect reject
 */
export const ext_reject_ = reject_

import { repeat_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeat
 */
export const ext_repeat_ = repeat_

import { repeatN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatN
 */
export const ext_repeatN_ = repeatN_

import { repeatOrElse_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatOrElse
 */
export const ext_repeatOrElse_ = repeatOrElse_

import { repeatOrElseEither_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatOrElseEither
 */
export const ext_repeatOrElseEither_ = repeatOrElseEither_

import { repeatUntilM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatUntilM
 */
export const ext_repeatUntilM_ = repeatUntilM_

import { repeatUntil_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatUntil
 */
export const ext_repeatUntil_ = repeatUntil_

import { repeatWhileM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatWhileM
 */
export const ext_repeatWhileM_ = repeatWhileM_

import { repeatWhile_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect repeatWhile
 */
export const ext_repeatWhile_ = repeatWhile_

import { replaceService_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect replaceService
 */
export const ext_replaceService_ = replaceService_

import { replaceServiceM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect replaceServiceM
 */
export const ext_replaceServiceM_ = replaceServiceM_

import { replicate_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect replicate
 */
export const ext_replicate_ = replicate_

import { require_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect require
 */
export const ext_require_ = require_

import { reserve_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect reserve
 */
export const ext_reserve_ = reserve_

import { resetForkScope_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect resetForkScope
 */
export const ext_resetForkScope_ = resetForkScope_

import { result } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect result
 */
export const ext_result = result

import { resurrect } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect resurrect
 */
export const ext_resurrect = resurrect

import { retry_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retry
 */
export const ext_retry_ = retry_

import { retryOrElse_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryOrElse
 */
export const ext_retryOrElse_ = retryOrElse_

import { retryOrElseEither_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryOrElseEither
 */
export const ext_retryOrElseEither_ = retryOrElseEither_

import { retryUntilM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryUntilM
 */
export const ext_retryUntilM_ = retryUntilM_

import { retryUntil_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryUntil
 */
export const ext_retryUntil_ = retryUntil_

import { retryWhileM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryWhileM
 */
export const ext_retryWhileM_ = retryWhileM_

import { retryWhile_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect retryWhile
 */
export const ext_retryWhile_ = retryWhile_

import { right } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect right
 */
export const ext_right = right

import { runPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect runPromise
 */
export const ext_runPromise = runPromise

import { runPromiseExit } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect runPromiseExit
 */
export const ext_runPromiseExit = runPromiseExit

import { runFiber } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect runFiber
 */
export const ext_runFiber = runFiber

import { sandbox } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect sandbox
 */
export const ext_sandbox = sandbox

import { sandboxWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect sandboxWith
 */
export const ext_sandboxWith_ = sandboxWith_

import { some } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect some
 */
export const ext_some = some

import { someOrElseM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect someOrElseM
 */
export const ext_someOrElseM_ = someOrElseM_

import { someOrElse_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect someOrElse
 */
export const ext_someOrElse_ = someOrElse_

import { someOrFail_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect someOrFail
 */
export const ext_someOrFail_ = someOrFail_

import { someOrFailException } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect someOrFailException
 */
export const ext_someOrFailException = someOrFailException

import { summarized_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect summarized
 */
export const ext_summarized_ = summarized_

import { supervised_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect supervised
 */
export const ext_supervised_ = supervised_

import { tap_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tap
 */
export const ext_tap_ = tap_

import { tapError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tapError
 */
export const ext_tapError_ = tapError_

import { tapCause_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tapCause
 */
export const ext_tapCause_ = tapCause_

import { tapBoth_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tapBoth
 */
export const ext_tapBoth_ = tapBoth_

import { fromRawEffect } from "@effect-ts/core/Effect/Layer"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromRawEffect = fromRawEffect

import { fromEffect_ } from "@effect-ts/core/Effect/Layer"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromEffect_ = fromEffect_

import { fromEffect } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed toManaged
 */
export const ext_fromEffect = fromEffect

import { toManagedRelease_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect toManaged
 */
export const ext_toManagedRelease_ = toManagedRelease_

import { timed } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect timed
 */
export const ext_timed = timed

import { timedWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect timedWith
 */
export const ext_timedWith_ = timedWith_

import { timeoutFail_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect timeoutFail
 */
export const ext_timeoutFail_ = timeoutFail_

import { timeoutTo_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect timeoutTo
 */
export const ext_timeoutTo_ = timeoutTo_

import { timeout_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect timeout
 */
export const ext_timeout_ = timeout_

import { to_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect to
 */
export const ext_to_ = to_

import { traced } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect traced
 */
export const ext_traced = traced

import { tracingStatus_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tracingStatus
 */
export const ext_tracingStatus_ = tracingStatus_

import { uncause } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect uncause
 */
export const ext_uncause = uncause

    /**
     * @ets_rewrite_method unfailable from "smart:identity"
     */
    unfailable<R, A>(this: T.Effect<R, never, A>): T.RIO<R, A>
import { uninterruptible } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect uninterruptible
 */
export const ext_uninterruptible = uninterruptible

import { unlessM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect unlessM
 */
export const ext_unlessM_ = unlessM_

import { unless_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect unless
 */
export const ext_unless_ = unless_

import { unrefineWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect unrefineWith
 */
export const ext_unrefineWith_ = unrefineWith_

import { unrefine_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect unrefine
 */
export const ext_unrefine_ = unrefine_

import { unrefine_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect unsandbox
 */
export const ext_unrefine_ = unrefine_

import { untraced } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect untraced
 */
export const ext_untraced = untraced

import { updateService_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect updateService
 */
export const ext_updateService_ = updateService_

import { whenM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect whenM
 */
export const ext_whenM_ = whenM_

import { when_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect when
 */
export const ext_when_ = when_

import { zip_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zip
 */
export const ext_zip_ = zip_

import { zipPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipPar
 */
export const ext_zipPar_ = zipPar_

import { zipRight_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipRight
 */
export const ext_zipRight_ = zipRight_

import { zipRightPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipRightPar
 */
export const ext_zipRightPar_ = zipRightPar_

import { zipLeft_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipLeft
 */
export const ext_zipLeft_ = zipLeft_

import { zipLeftPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipLeftPar
 */
export const ext_zipLeftPar_ = zipLeftPar_

import { zipWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipWith
 */
export const ext_zipWith_ = zipWith_

import { zipWithPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect zipWithPar
 */
export const ext_zipWithPar_ = zipWithPar_
