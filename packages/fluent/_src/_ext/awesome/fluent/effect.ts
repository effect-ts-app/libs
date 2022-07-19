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
import { access } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops access
 */
export const ext_access = access

import { accessM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessM
 */
export const ext_accessM = accessM

import { accessServiceM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessServiceM
 */
export const ext_accessServiceM = accessServiceM

import { accessService } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessService
 */
export const ext_accessService = accessService

import { accessServices } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessServices
 */
export const ext_accessServices = accessServices

import { accessServices } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessServicesM
 */
export const ext_accessServices = accessServices

import { accessServicesT } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessServicesT
 */
export const ext_accessServicesT = accessServicesT

import { accessServicesTM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops accessServicesTM
 */
export const ext_accessServicesTM = accessServicesTM

    /**
     * @ets_rewrite_static collect from "@effect-ts/core/Effect"
     * @ets_data_first collect_
     */
    collect<A, R, E, B>(
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>
import { collect_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collect
 */
export const ext_collect_ = collect_

import { collectAll } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAll
 */
export const ext_collectAll = collectAll

import { collectAllPar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllPar
 */
export const ext_collectAllPar = collectAllPar

    /**
     * @ets_rewrite_static collectAllPar from "@effect-ts/core/Effect"
     * @ets_data_first collectAllParN_
     */
    collectAllParN(
      n: number,
      __trace?: string | undefined
    ): <R, E, A>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<A>>
import { collectAllParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllParN
 */
export const ext_collectAllParN_ = collectAllParN_

import { collectAllSuccesses } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllSuccesses
 */
export const ext_collectAllSuccesses = collectAllSuccesses

import { collectAllSuccessesPar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllSuccessesPar
 */
export const ext_collectAllSuccessesPar = collectAllSuccessesPar

import { collectAllSuccessesPar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllSuccessesParN
 */
export const ext_collectAllSuccessesPar = collectAllSuccessesPar

import { collectAllUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllUnit
 */
export const ext_collectAllUnit = collectAllUnit

import { collectAllUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllUnitPar
 */
export const ext_collectAllUnit = collectAllUnit

    /**
     * @ets_rewrite_static collectAllUnitParN from "@effect-ts/core/Effect"
     * @ets_data_first collectAllUnitParN_
     */
    collectAllUnitParN(
      n: number,
      __trace?: string | undefined
    ): <R, E, A>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, void>
import { collectAllUnitParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllUnitParN
 */
export const ext_collectAllUnitParN_ = collectAllUnitParN_

    /**
     * @ets_rewrite_static collectAllWith from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWith_
     */
    collectAllWith<A, B>(
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>
import { collectAllWith_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllWith
 */
export const ext_collectAllWith_ = collectAllWith_

    /**
     * @ets_rewrite_static collectAllWithPar from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWithPar_
     */
    collectAllWithPar<A, B>(
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>
import { collectAllWithPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllWithPar
 */
export const ext_collectAllWithPar_ = collectAllWithPar_

    /**
     * @ets_rewrite_static collectAllWithParN from "@effect-ts/core/Effect"
     * @ets_data_first collectAllWithParN_
     */
    collectAllWithParN<A, B>(
      n: number,
      pf: (a: A) => O.Option<B>,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<Effect<R, E, A>>) => Effect<R, E, Chunk<B>>
import { collectAllWithParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectAllWithParN
 */
export const ext_collectAllWithParN_ = collectAllWithParN_

    /**
     * @ets_rewrite_static collectPar from "@effect-ts/core/Effect"
     * @ets_data_first collectPar_
     */
    collectPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>
import { collectPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectPar
 */
export const ext_collectPar_ = collectPar_

    /**
     * @ets_rewrite_static collectParN from "@effect-ts/core/Effect"
     * @ets_data_first collectParN_
     */
    collectParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, O.Option<E>, B>,
      __trace?: string | undefined
    ): (self: Iterable<A>) => T.Effect<R, E, Chunk<B>>
import { collectParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops collectParN
 */
export const ext_collectParN_ = collectParN_

    /**
     * @ets_rewrite_static cond from "@effect-ts/core/Effect"
     * @ets_data_first cond_
     */
    cond<E, A>(
      onTrue: () => A,
      onFalse: () => E,
      __trace?: string | undefined
    ): (b: boolean) => T.Effect<unknown, E, A>
import { cond_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops cond
 */
export const ext_cond_ = cond_

    /**
     * @ets_rewrite_static condM from "@effect-ts/core/Effect"
     * @ets_data_first condM_
     */
    condM<R, R2, E, A>(
      onTrue: T.RIO<R, A>,
      onFalse: T.RIO<R2, E>,
      __trace?: string | undefined
    ): (b: boolean) => T.Effect<R & R2, E, A>
import { condM_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops condM
 */
export const ext_condM_ = condM_

import { Applicative } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops descriptor
 */
export const ext_Applicative = Applicative

import { descriptorWith } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops descriptorWith
 */
export const ext_descriptorWith = descriptorWith

    /**
     * @ets_rewrite_static dropWhile from "@effect-ts/core/Effect"
     * @ets_data_first dropWhile_
     */
    dropWhile<A, R, E>(
      p: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Array<A>>
import { dropWhile_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops dropWhile
 */
export const ext_dropWhile_ = dropWhile_

import { Applicative } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops Applicative
 */
export const ext_Applicative = Applicative

import { effectAsyncInterrupt } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncInterrupt
 */
export const ext_effectAsyncInterrupt = effectAsyncInterrupt

import { effectAsyncInterruptBlockingOn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncInterrupt
 */
export const ext_effectAsyncInterruptBlockingOn = effectAsyncInterruptBlockingOn

import { effectAsync } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops async
 */
export const ext_effectAsync = effectAsync

import { effectAsyncBlockingOn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops async
 */
export const ext_effectAsyncBlockingOn = effectAsyncBlockingOn

import { effectAsyncM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncEffect
 */
export const ext_effectAsyncM = effectAsyncM

import { effectAsyncOption } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncOption
 */
export const ext_effectAsyncOption = effectAsyncOption

import { effectAsyncOptionBlockingOn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncOption
 */
export const ext_effectAsyncOptionBlockingOn = effectAsyncOptionBlockingOn

import { effectMaybeAsyncInterrupt } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncOptionInterrupt
 */
export const ext_effectMaybeAsyncInterrupt = effectMaybeAsyncInterrupt

import { effectMaybeAsyncInterruptBlockingOn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops asyncOptionInterrupt
 */
export const ext_effectMaybeAsyncInterruptBlockingOn = effectMaybeAsyncInterruptBlockingOn

import { do } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops do_
 */
export const ext_do = do

import { deriveLifted } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops deriveLifted
 */
export const ext_deriveLifted = deriveLifted

import { done } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops done
 */
export const ext_done = done

import { dieWith } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops die
 */
export const ext_dieWith = dieWith

import { die } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops dieNow
 */
export const ext_die = die

import { defaultEnv } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops defaultEnv
 */
export const ext_defaultEnv = defaultEnv

import { defaultPlatform } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops defaultPlatform
 */
export const ext_defaultPlatform = defaultPlatform

import { environment } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops environment
 */
export const ext_environment = environment

import { forEach_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forEach
 */
export const ext_forEach_ = forEach_

    /**
     * @ets_rewrite_static forEach from "@effect-ts/core/Effect"
     * @ets_data_first forEach_
     */
    forEach<A, R, E, B>(
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>
import { forEachPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forEachPar
 */
export const ext_forEachPar_ = forEachPar_

    /**
     * @ets_rewrite_static forEachPar from "@effect-ts/core/Effect"
     * @ets_data_first forEachPar_
     */
    forEachPar<A, R, E, B>(
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>
import { forEachParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forEachParN
 */
export const ext_forEachParN_ = forEachParN_

    /**
     * @ets_rewrite_static forEachParN from "@effect-ts/core/Effect"
     * @ets_data_first forEachParN_
     */
    forEachParN<A, R, E, B>(
      n: number,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>
import { failWith } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops fail
 */
export const ext_failWith = failWith

import { fail } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops failNow
 */
export const ext_fail = fail

    /**
     * @ets_rewrite_static filter from "@effect-ts/core/Effect"
     * @ets_data_first filter_
     */
    filter<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>
import { filter_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filter
 */
export const ext_filter_ = filter_

    /**
     * @ets_rewrite_static filterNot from "@effect-ts/core/Effect"
     * @ets_data_first filterNot_
     */
    filterNot<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>
import { filterNot_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filterNot
 */
export const ext_filterNot_ = filterNot_

    /**
     * @ets_rewrite_static filterNotPar from "@effect-ts/core/Effect"
     * @ets_data_first filterNotPar_
     */
    filterNotPar<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>
import { filterNotPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filterNotPar
 */
export const ext_filterNotPar_ = filterNotPar_

    /**
     * @ets_rewrite_static filterNotParN from "@effect-ts/core/Effect"
     * @ets_data_first filterNotParN_
     */
    filterNotParN<R, E, A>(
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Chunk<A>>
import { filterNotParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filterNotParN
 */
export const ext_filterNotParN_ = filterNotParN_

    /**
     * @ets_rewrite_static filterPar from "@effect-ts/core/Effect"
     * @ets_data_first filterPar_
     */
    filterPar<A, R, E>(
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, readonly A[]>
import { filterPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filterPar
 */
export const ext_filterPar_ = filterPar_

    /**
     * @ets_rewrite_static filterParN from "@effect-ts/core/Effect"
     * @ets_data_first filterParN_
     */
    filterParN<A, R, E>(
      n: number,
      f: (a: A) => T.Effect<R, E, boolean>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, E, Chunk<A>>
import { filterParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops filterParN
 */
export const ext_filterParN_ = filterParN_

    /**
     * @ets_rewrite_static forEachExec from "@effect-ts/core/Effect"
     * @ets_data_first forEachExec_
     */
    forEachExec<R, E, A, B>(
      es: T.ExecutionStrategy,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => Effect<R, E, Chunk<B>>
import { forEachExec_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forEachExec
 */
export const ext_forEachExec_ = forEachExec_

import { first } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops first
 */
export const ext_first = first

import { forkAll } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forkAll
 */
export const ext_forkAll = forkAll

import { forkAllUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forkAllUnit
 */
export const ext_forkAllUnit = forkAllUnit

import { forkScope } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forkScope
 */
export const ext_forkScope = forkScope

    /**
     * @ets_rewrite_static forkScopeMask from "@effect-ts/core/Effect"
     * @ets_data_first forkScopeMask_
     */
    forkScopeMask<R, E, A>(
      f: (restore: T.ForkScopeRestore) => T.Effect<R, E, A>,
      __trace?: string | undefined
    ): (newScope: Scope<Exit<any, any>>) => T.Effect<R, E, A>
import { forkScopeMask_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forkScopeMask
 */
export const ext_forkScopeMask_ = forkScopeMask_

import { forkScope } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops forkScopeWith
 */
export const ext_forkScope = forkScope

import { firstSuccessOf } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops firstSuccessOf
 */
export const ext_firstSuccessOf = firstSuccessOf

import { fromAsync } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromAsync = fromAsync

import { fromEither } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromEither = fromEither

import { fromFiber } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromFiber = fromFiber

import { fromFiberM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromFiberM = fromFiberM

import { fromPredicate } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromPredicate = fromPredicate

import { fromPredicate } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromPredicate = fromPredicate

import { fromIO } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromIO = fromIO

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromNodeCb } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

import { fromOption } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromOption = fromOption

import { fromNullable } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops fromNullable
 */
export const ext_fromNullable = fromNullable

import { gen } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops gen
 */
export const ext_gen = gen

import { genM } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops genM
 */
export const ext_genM = genM

import { getIdentity } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops getIdentity
 */
export const ext_getIdentity = getIdentity

import { getIdentityPar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops getIdentityPar
 */
export const ext_getIdentityPar = getIdentityPar

import { getOrFail } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops getOrFail
 */
export const ext_getOrFail = getOrFail

import { getOrFailUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops getOrFailUnit
 */
export const ext_getOrFailUnit = getOrFailUnit

import { getValidationApplicative } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops getValidationApplicative
 */
export const ext_getValidationApplicative = getValidationApplicative

import { haltWith } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops halt
 */
export const ext_haltWith = haltWith

import { halt } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops haltNow
 */
export const ext_halt = halt

    /**
     * @ets_rewrite_static if from "@effect-ts/core/Effect"
     * @ets_data_first if_
     */
    if<R1, E1, A1, R2, E2, A2>(
      onTrue: () => Effect<R1, E1, A1>,
      onFalse: () => Effect<R2, E2, A2>,
      __trace?: string | undefined
    ): (b: boolean) => Effect<R1 & R2, E1 | E2, A1 | A2>
import { if_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops if
 */
export const ext_if_ = if_

import { interrupt } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops interrupt
 */
export const ext_interrupt = interrupt

import { interruptAs } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops interruptAs
 */
export const ext_interruptAs = interruptAs

import { interruptibleMask } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops interruptibleMask
 */
export const ext_interruptibleMask = interruptibleMask

import { iterate } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops iterate
 */
export const ext_iterate = iterate

import { loop } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops loop
 */
export const ext_loop = loop

import { loopUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops loopUnit
 */
export const ext_loopUnit = loopUnit

import { makeCustomRuntime } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops makeCustomRuntime
 */
export const ext_makeCustomRuntime = makeCustomRuntime

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
import { mapN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mapN
 */
export const ext_mapN_ = mapN_

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
import { mapNPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mapNPar
 */
export const ext_mapNPar_ = mapNPar_

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
import { mapNParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mapNParN
 */
export const ext_mapNParN_ = mapNParN_

import { match } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops match
 */
export const ext_match = match

import { matchIn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops matchIn
 */
export const ext_matchIn = matchIn

import { matchMorph } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops matchMorph
 */
export const ext_matchMorph = matchMorph

import { matchTag } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops matchTag
 */
export const ext_matchTag = matchTag

import { matchTagIn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops matchTagIn
 */
export const ext_matchTagIn = matchTagIn

import { memoize } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops memoize
 */
export const ext_memoize = memoize

import { memoizeEq } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops memoizeEq
 */
export const ext_memoizeEq = memoizeEq

    /**
     * @ets_rewrite_static mergeAll from "@effect-ts/core/Effect"
     * @ets_data_first mergeAll_
     */
    mergeAll<A, B>(
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<T.Effect<R, E, A>>) => T.Effect<R, E, B>
import { mergeAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mergeAll
 */
export const ext_mergeAll_ = mergeAll_

    /**
     * @ets_rewrite_static mergeAllPar from "@effect-ts/core/Effect"
     * @ets_data_first mergeAllPar_
     */
    mergeAllPar<A, B>(
      zero: B,
      f: (b: B, a: A) => B,
      __trace?: string | undefined
    ): <R, E>(as: Iterable<T.Effect<R, E, A>>) => T.Effect<R, E, B>
import { mergeAllPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mergeAllPar
 */
export const ext_mergeAllPar_ = mergeAllPar_

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
import { mergeAllParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops mergeAllParN
 */
export const ext_mergeAllParN_ = mergeAllParN_

import { never } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops never
 */
export const ext_never = never

import { none } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops none
 */
export const ext_none = none

import { parallel } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops parallel
 */
export const ext_parallel = parallel

import { parallelN } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops parallelN
 */
export const ext_parallelN = parallelN

    /**
     * @ets_rewrite_static partition from "@effect-ts/core/Effect"
     * @ets_data_first partition_
     */
    partition<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.RIO<R, Separated<Iterable<E>, Iterable<B>>>
import { partition_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops partition
 */
export const ext_partition_ = partition_

    /**
     * @ets_rewrite_static partitionPar from "@effect-ts/core/Effect"
     * @ets_data_first partitionPar_
     */
    partitionPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.RIO<R, Separated<Iterable<E>, Iterable<B>>>
import { partitionPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops partitionPar
 */
export const ext_partitionPar_ = partitionPar_

    /**
     * @ets_rewrite_static partitionParN from "@effect-ts/core/Effect"
     * @ets_data_first partitionParN_
     */
    partitionParN<A, R, E, B>(
      n: number,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string
    ): (as: Iterable<A>) => Effect<R, never, Separated<Iterable<E>, Iterable<B>>>
import { partitionParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops partitionParN
 */
export const ext_partitionParN_ = partitionParN_

import { prettyReporter } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops prettyReporter
 */
export const ext_prettyReporter = prettyReporter

import { promise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_promise = promise

import { tryCatchPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_tryCatchPromise = tryCatchPromise

    /**
     * @ets_rewrite_static provide from "@effect-ts/core/Effect"
     * @ets_data_first provide_
     */
    provide<R>(
      r: R,
      __trace?: string | undefined
    ): <E, A, R0>(next: T.Effect<R & R0, E, A>) => T.Effect<R0, E, A>
import { provide_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops provide_
 */
export const ext_provide_ = provide_

    /**
     * @ets_rewrite_static provideAll from "@effect-ts/core/Effect"
     * @ets_data_first provideAll_
     */
    provideAll<R>(
      r: R,
      __trace?: string | undefined
    ): <E, A>(next: T.Effect<R, E, A>) => T.Effect<unknown, E, A>
import { provideAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops provideAll
 */
export const ext_provideAll_ = provideAll_

    /**
     * @ets_rewrite_static provideLayer from "@effect-ts/core/Effect"
     * @ets_data_first provideLayer_
     */
    provideLayer<R, E, A>(
      layer: Layer<R, E, A>
    ): <E1, A1>(self: T.Effect<A, E1, A1>) => T.Effect<R, E | E1, A1>
import { provideLayer_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops provideLayer
 */
export const ext_provideLayer_ = provideLayer_

    /**
     * @ets_rewrite_static provideSomeLayer from "@effect-ts/core/Effect"
     * @ets_data_first provideSomeLayer_
     */
    provideSomeLayer<R, E, A>(
      layer: Layer<R, E, A>
    ): <R1, E1, A1>(self: T.Effect<R1 & A, E1, A1>) => T.Effect<R & R1, E | E1, A1>
import { provideSomeLayer_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops provideSomeLayer
 */
export const ext_provideSomeLayer_ = provideSomeLayer_

    /**
     * @ets_rewrite_static provideSome from "@effect-ts/core/Effect"
     * @ets_data_first provideSome_
     */
    provideSome<R0, R>(
      f: (r0: R0) => R,
      __trace?: string | undefined
    ): <E, A>(effect: T.Effect<R, E, A>) => T.Effect<R0, E, A>
import { provideSome_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops provideSome
 */
export const ext_provideSome_ = provideSome_

import { raceAll } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops raceAll
 */
export const ext_raceAll = raceAll

import { raceAllWait } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops raceAllWait
 */
export const ext_raceAllWait = raceAllWait

import { raceAllWithStrategy } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops raceAllWithStrategy
 */
export const ext_raceAllWithStrategy = raceAllWithStrategy

    /**
     * @ets_rewrite_static reduce from "@effect-ts/core/Effect"
     * @ets_data_first reduce_
     */
    reduce<Z, R, E, A>(
      zero: Z,
      f: (z: Z, a: A) => Effect<R, E, Z>,
      __trace?: string
    ): (i: Iterable<A>) => Effect<R, E, Z>
import { reduce_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops reduce
 */
export const ext_reduce_ = reduce_

    /**
     * @ets_rewrite_static reduceAll from "@effect-ts/core/Effect"
     * @ets_data_first reduceAll_
     */
    reduceAll<A>(
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): <R, E>(as: NonEmptyArray<T.Effect<R, E, A>>) => T.Effect<R, E, A>
import { reduceAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops reduceAll
 */
export const ext_reduceAll_ = reduceAll_

    /**
     * @ets_rewrite_static reduceAllPar from "@effect-ts/core/Effect"
     * @ets_data_first reduceAllPar_
     */
    reduceAllPar<A>(
      f: (acc: A, a: A) => A,
      __trace?: string | undefined
    ): <R, E>(as: NonEmptyArray<T.Effect<R, E, A>>) => T.Effect<R, E, A>
import { reduceAllPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops reduceAllPar
 */
export const ext_reduceAllPar_ = reduceAllPar_

    /**
     * @ets_rewrite_static reduceAllParN from "@effect-ts/core/Effect"
     * @ets_data_first reduceAllParN_
     */
    reduceAllParN<A>(
      n: number,
      f: (acc: A, a: A) => A,
      __trace?: string
    ): <R, E>(as: NonEmptyArray<Effect<R, E, A>>) => Effect<R, E, A>
import { reduceAllParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops reduceAllParN
 */
export const ext_reduceAllParN_ = reduceAllParN_

    /**
     * @ets_rewrite_static reduceRight from "@effect-ts/core/Effect"
     * @ets_data_first reduceRight_
     */
    reduceRight<R, E, A, Z>(
      zero: Z,
      f: (a: A, z: Z) => T.Effect<R, E, Z>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, E, Z>
import { reduceRight_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops reduceRight
 */
export const ext_reduceRight_ = reduceRight_

import { runtime } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops runtime
 */
export const ext_runtime = runtime

import { second } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops second
 */
export const ext_second = second

import { sequential } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops sequential
 */
export const ext_sequential = sequential

import { service } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops service
 */
export const ext_service = service

import { services } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops services
 */
export const ext_services = services

import { sleep } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops sleep
 */
export const ext_sleep = sleep

import { struct } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops struct
 */
export const ext_struct = struct

import { structPar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops structPar
 */
export const ext_structPar = structPar

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
import { structParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops structParN
 */
export const ext_structParN_ = structParN_

import { succeedWith } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops succeed
 */
export const ext_succeedWith = succeedWith

import { suspend } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops suspend
 */
export const ext_suspend = suspend

import { succeed } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops succeedNow
 */
export const ext_succeed = succeed

import { trace } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops trace
 */
export const ext_trace = trace

import { tracedMask } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tracedMask
 */
export const ext_tracedMask = tracedMask

import { transplant } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops transplant
 */
export const ext_transplant = transplant

import { try } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops try
 */
export const ext_try = try

import { tryCatch } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryCatch
 */
export const ext_tryCatch = tryCatch

import { tryCatch } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryCatchOption
 */
export const ext_tryCatch = tryCatch

import { tryCatchSuspend } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryCatchSuspend
 */
export const ext_tryCatchSuspend = tryCatchSuspend

import { tryCatchPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryCatchPromise
 */
export const ext_tryCatchPromise = tryCatchPromise

import { tryPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryPromise
 */
export const ext_tryPromise = tryPromise

import { tuple } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tuple
 */
export const ext_tuple = tuple

import { tuplePar } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tuplePar
 */
export const ext_tuplePar = tuplePar

import { tupleParN } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tupleParN
 */
export const ext_tupleParN = tupleParN

import { uninterruptibleMask } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops uninterruptibleMask
 */
export const ext_uninterruptibleMask = uninterruptibleMask

import { union } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops union
 */
export const ext_union = union

import { unionFn } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops unionFn
 */
export const ext_unionFn = unionFn

import { unit } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops unit
 */
export const ext_unit = unit

import { unitTraced } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops unitTraced
 */
export const ext_unitTraced = unitTraced

import { untracedMask } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops untracedMask
 */
export const ext_untracedMask = untracedMask

    /**
     * @ets_rewrite_static validate from "@effect-ts/core/Effect"
     * @ets_data_first validate_
     */
    validate<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>
import { validate_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validate
 */
export const ext_validate_ = validate_

    /**
     * @ets_rewrite_static validatePar from "@effect-ts/core/Effect"
     * @ets_data_first validatePar_
     */
    validatePar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>
import { validatePar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validatePar
 */
export const ext_validatePar_ = validatePar_

    /**
     * @ets_rewrite_static validateParN from "@effect-ts/core/Effect"
     * @ets_data_first validateParN_
     */
    validateParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (as: Iterable<A>) => T.Effect<R, Chunk<E>, Chunk<B>>
import { validateParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validateParN
 */
export const ext_validateParN_ = validateParN_

    /**
     * @ets_rewrite_static validateExec from "@effect-ts/core/Effect"
     * @ets_data_first validateExec_
     */
    validateExec<R, E, A, B>(
      es: T.ExecutionStrategy,
      f: (a: A) => Effect<R, E, B>,
      __trace?: string
    ): (as: Iterable<A>) => Effect<R, Chunk<E>, Chunk<B>>
import { validateExec_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validateExec
 */
export const ext_validateExec_ = validateExec_

    /**
     * @ets_rewrite_static validateFirst from "@effect-ts/core/Effect"
     * @ets_data_first validateFirst_
     */
    validateFirst<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>
import { validateFirst_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validateFirst
 */
export const ext_validateFirst_ = validateFirst_

    /**
     * @ets_rewrite_static validateFirstPar from "@effect-ts/core/Effect"
     * @ets_data_first validateFirstPar_
     */
    validateFirstPar<A, R, E, B>(
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>
import { validateFirstPar_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validateFirstPar
 */
export const ext_validateFirstPar_ = validateFirstPar_

    /**
     * @ets_rewrite_static validateFirstParN from "@effect-ts/core/Effect"
     * @ets_data_first validateFirstParN_
     */
    validateFirstParN<A, R, E, B>(
      n: number,
      f: (a: A) => T.Effect<R, E, B>,
      __trace?: string | undefined
    ): (i: Iterable<A>) => T.Effect<R, Chunk<E>, B>
import { validateFirstParN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops validateFirstParN
 */
export const ext_validateFirstParN_ = validateFirstParN_

    /**
     * @ets_rewrite_static whenCase from "@effect-ts/core/Effect"
     * @ets_data_first whenCase_
     */
    whenCase<R, E, A, X>(
      pf: (a: A) => O.Option<T.Effect<R, E, X>>,
      __trace?: string | undefined
    ): (a: A) => T.Effect<R, E, void>
import { whenCase_ } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops whenCase
 */
export const ext_whenCase_ = whenCase_

import { withChildren } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops withChildren
 */
export const ext_withChildren = withChildren

import { withRuntime } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops withRuntime
 */
export const ext_withRuntime = withRuntime

import { withRuntime } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops withRuntimeM
 */
export const ext_withRuntime = withRuntime

import { yieldNow } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops yieldNow
 */
export const ext_yieldNow = yieldNow

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
