// ets_tracing: off

/* eslint-disable @typescript-eslint/no-namespace */
import {
  absolve,
  absorb,
  absorbWith_,
  access,
  accessM,
  accessService,
  accessServiceM,
  accessServices,
  accessServicesT,
  accessServicesTM,
  andThen_,
  ap_,
  Applicative,
  as_,
  asService_,
  asSome,
  asSomeError,
  asUnit,
  awaitAllChildren,
  bimap_,
  bind_,
  bindAll_,
  bindAllPar_,
  bindAllParN_,
  bracketExit_,
  bracketFiber_,
  bracketOnError_,
  cached_,
  cachedInvalidate_,
  catchAll_,
  catchAllCause_,
  catchAllDefect_,
  catchSome_,
  catchSomeCause_,
  catchSomeDefect_,
  catchTag_,
  cause,
  chain_,
  chainError_,
  collect,
  collect_,
  collectAll,
  collectAllPar,
  collectAllParN,
  collectAllParN_,
  collectAllSuccesses,
  collectAllSuccessesPar,
  collectAllSuccessesParN,
  collectAllUnit,
  collectAllUnitPar,
  collectAllUnitParN,
  collectAllUnitParN_,
  collectAllWith,
  collectAllWith_,
  collectAllWithPar,
  collectAllWithPar_,
  collectAllWithParN,
  collectAllWithParN_,
  collectPar,
  collectPar_,
  collectParN,
  collectParN_,
  compose_,
  cond,
  cond_,
  condM,
  condM_,
  continueOrFail_,
  continueOrFailM_,
  defaultEnv,
  defaultPlatform,
  delay_,
  deriveLifted,
  descriptor,
  descriptorWith,
  die,
  dieWith,
  do as do__,
  done,
  dropWhile,
  dropWhile_,
  effectAsync,
  effectAsyncBlockingOn,
  effectAsyncInterrupt,
  effectAsyncInterruptBlockingOn,
  effectAsyncM,
  effectAsyncOption,
  effectAsyncOptionBlockingOn,
  effectMaybeAsyncInterrupt,
  effectMaybeAsyncInterruptBlockingOn,
  either,
  ensuring_,
  ensuringChild_,
  ensuringChildren_,
  environment,
  eventually,
  fail,
  failWith,
  filter,
  filter_,
  filterNot,
  filterNot_,
  filterNotPar,
  filterNotPar_,
  filterNotParN,
  filterNotParN_,
  filterPar,
  filterPar_,
  filterParN,
  filterParN_,
  first,
  firstSuccessOf,
  flatten,
  flattenErrorOption_,
  flip,
  flipWith_,
  foldCauseM_,
  foldM_,
  forEach,
  forEach_,
  forEachExec,
  forEachExec_,
  forEachPar,
  forEachPar_,
  forEachParN,
  forEachParN_,
  forever,
  fork,
  forkAll,
  forkAllUnit,
  forkAs_,
  forkDaemon,
  forkDaemonReport_,
  forkIn_,
  forkInReport_,
  forkManaged,
  forkScope,
  forkScopeMask,
  forkScopeMask_,
  forkScopeWith,
  forkWithErrorHandler_,
  fromAsync,
  fromEither,
  fromFiber,
  fromFiberM,
  fromIO,
  fromNodeCb,
  fromNullable,
  fromOption,
  fromPredicate,
  gen,
  genM,
  get,
  getIdentity,
  getIdentityPar,
  getOrFail,
  getOrFailUnit,
  getValidationApplicative,
  halt,
  haltWith,
  if as if__,
  if_,
  ifM_,
  ignore,
  in_,
  interrupt,
  interruptAllChildren,
  interruptAs,
  interruptible,
  interruptibleMask,
  interruptStatus_,
  isFailure,
  isSuccess,
  iterate,
  join_,
  joinEither_,
  left,
  leftOrFail_,
  leftOrFailException,
  let_,
  loop,
  loopUnit,
  makeCustomRuntime,
  map_,
  mapError_,
  mapErrorCause_,
  mapN,
  mapN_,
  mapNPar,
  mapNPar_,
  mapNParN,
  mapNParN_,
  mapTryCatch_,
  match,
  matchIn,
  matchMorph,
  matchTag,
  matchTagIn,
  memoize,
  memoizeEq,
  merge,
  mergeAll,
  mergeAll_,
  mergeAllPar,
  mergeAllPar_,
  mergeAllParN,
  mergeAllParN_,
  never,
  none,
  once,
  onError_,
  onExit_,
  onFirst,
  onInterrupt_,
  onSecond,
  onTermination_,
  option,
  optional,
  orDie,
  orDieKeep,
  orDieWith_,
  orElse_,
  orElseEither_,
  orElseFail_,
  orElseOptional_,
  orElseSucceed_,
  overrideForkScope_,
  parallel,
  parallelN,
  partition,
  partition_,
  partitionPar,
  partitionPar_,
  partitionParN,
  partitionParN_,
  prettyReporter,
  promise,
  provide,
  provide_,
  provideAll,
  provideAll_,
  provideLayer,
  provideLayer_,
  provideService_,
  provideServiceM_,
  provideSome,
  provideSome_,
  provideSomeLayer,
  provideSomeLayer_,
  race_,
  raceAll,
  raceAllWait,
  raceAllWithStrategy,
  raceEither_,
  raceFirst_,
  raceWith_,
  raceWithScope_,
  reduce,
  reduce_,
  reduceAll,
  reduceAll_,
  reduceAllPar,
  reduceAllPar_,
  reduceAllParN,
  reduceAllParN_,
  reduceRight,
  reduceRight_,
  refailWithTrace,
  refineOrDie_,
  refineOrDieWith_,
  reject_,
  repeat_,
  repeatN_,
  repeatOrElse_,
  repeatOrElseEither_,
  repeatUntil_,
  repeatUntilM_,
  repeatWhile_,
  repeatWhileM_,
  replaceService_,
  replaceServiceM_,
  replicate_,
  require_,
  reserve_,
  resetForkScope,
  result,
  resurrect,
  retry_,
  retryOrElse_,
  retryOrElseEither_,
  retryUntil_,
  retryUntilM_,
  retryWhile_,
  retryWhileM_,
  right,
  runFiber,
  runPromise,
  runPromiseExit,
  runtime,
  sandbox,
  sandboxWith_,
  second,
  sequential,
  service,
  services,
  sleep,
  some,
  someOrElse_,
  someOrElseM_,
  someOrFail_,
  someOrFailException,
  struct,
  structPar,
  structParN,
  structParN_,
  succeed,
  succeedWith,
  summarized_,
  supervised_,
  suspend,
  tap_,
  tapBoth_,
  tapCause_,
  tapError_,
  timed,
  timedWith_,
  timeout_,
  timeoutFail_,
  timeoutTo_,
  to_,
  toManagedRelease_,
  trace,
  traced,
  tracedMask,
  tracingStatus_,
  transplant,
  try as try__,
  tryCatch,
  tryCatchOption,
  tryCatchPromise,
  tryCatchSuspend,
  tryPromise,
  tuple,
  tuplePar,
  tupleParN,
  uncause,
  uninterruptible,
  uninterruptibleMask,
  union,
  unionFn,
  unit,
  unitTraced,
  unless_,
  unlessM_,
  unrefine_,
  unrefineWith_,
  untraced,
  untracedMask,
  updateService_,
  validate,
  validate_,
  validateExec,
  validateExec_,
  validateFirst,
  validateFirst_,
  validateFirstPar,
  validateFirstPar_,
  validateFirstParN,
  validateFirstParN_,
  validatePar,
  validatePar_,
  validateParN,
  validateParN_,
  when_,
  whenCase,
  whenCase_,
  whenM_,
  withChildren,
  withRuntime,
  withRuntimeM,
  yieldNow,
  zip_,
  zipLeft_,
  zipLeftPar_,
  zipPar_,
  zipRight_,
  zipRightPar_,
  zipWith_,
  zipWithPar_,
} from "@effect-ts/core/Effect"
import { fromEffect_, fromRawEffect } from "@effect-ts/core/Effect/Layer"
import { fromEffect } from "@effect-ts/core/Effect/Managed"

// /**
//  * @ets_rewrite_method onlyDefaultEnv from "smart:identity"
//  */
// onlyDefaultEnv<E, A>(
//   self: T.Effect<T.DefaultEnv, E, A>
// ): T.Effect<T.DefaultEnv, E, A>

// /**
//  * @ets_rewrite_method unfailable from "smart:identity"
//  */
// unfailable<R, A>(this: T.Effect<R, never, A>): T.RIO<R, A>

/**
 * @tsplus static ets/Effect.Ops access
 */
export const ext_access = access

/**
 * @tsplus static ets/Effect.Ops accessM
 */
export const ext_accessM = accessM

/**
 * @tsplus static ets/Effect.Ops accessServiceM
 */
export const ext_accessServiceM = accessServiceM

/**
 * @tsplus static ets/Effect.Ops accessService
 */
export const ext_accessService = accessService

/**
 * @tsplus static ets/Effect.Ops accessServices
 */
export const ext_accessServices = accessServices

/**
 * @tsplus static ets/Effect.Ops accessServicesM
 */
export const ext_accessServicesM = accessServices

/**
 * @tsplus static ets/Effect.Ops accessServicesT
 */
export const ext_accessServicesT = accessServicesT

/**
 * @tsplus static ets/Effect.Ops accessServicesTM
 */
export const ext_accessServicesTM = accessServicesTM

/**
 * @tsplus static ets/Effect collect
 *  // data_first collect_
 */
export const ext_collect = collect

/**
 * @tsplus static ets/Effect.Ops collect
 */
export const ext_collect_ = collect_

/**
 * @tsplus static ets/Effect.Ops collectAll
 */
export const ext_collectAll = collectAll

/**
 * @tsplus static ets/Effect.Ops collectAllPar
 */
export const ext_collectAllPar = collectAllPar

/**
 * @tsplus static ets/Effect collectAllParN
 *  // data_first collectAllParN_
 */
export const ext_collectAllParN = collectAllParN

/**
 * @tsplus static ets/Effect.Ops collectAllParN
 */
export const ext_collectAllParN_ = collectAllParN_

/**
 * @tsplus static ets/Effect.Ops collectAllSuccesses
 */
export const ext_collectAllSuccesses = collectAllSuccesses

/**
 * @tsplus static ets/Effect.Ops collectAllSuccessesPar
 */
export const ext_collectAllSuccessesPar = collectAllSuccessesPar

/**
 * @tsplus static ets/Effect.Ops collectAllSuccessesParN
 */
export const ext_collectAllSuccessesParN = collectAllSuccessesParN

/**
 * @tsplus static ets/Effect.Ops collectAllUnit
 */
export const ext_collectAllUnit = collectAllUnit

/**
 * @tsplus static ets/Effect.Ops collectAllUnitPar
 */
export const ext_collectAllUnitPar = collectAllUnitPar

/**
 * @tsplus static ets/Effect collectAllUnitParN
 *  // data_first collectAllUnitParN_
 */
export const ext_collectAllUnitParN = collectAllUnitParN

/**
 * @tsplus static ets/Effect.Ops collectAllUnitParN
 */
export const ext_collectAllUnitParN_ = collectAllUnitParN_

/**
 * @tsplus static ets/Effect collectAllWith
 *  // data_first collectAllWith_
 */
export const ext_collectAllWith = collectAllWith

/**
 * @tsplus static ets/Effect.Ops collectAllWith
 */
export const ext_collectAllWith_ = collectAllWith_

/**
 * @tsplus static ets/Effect collectAllWithPar
 *  // data_first collectAllWithPar_
 */
export const ext_collectAllWithPar = collectAllWithPar

/**
 * @tsplus static ets/Effect.Ops collectAllWithPar
 */
export const ext_collectAllWithPar_ = collectAllWithPar_

/**
 * @tsplus static ets/Effect collectAllWithParN
 *  // data_first collectAllWithParN_
 */
export const ext_collectAllWithParN = collectAllWithParN

/**
 * @tsplus static ets/Effect.Ops collectAllWithParN
 */
export const ext_collectAllWithParN_ = collectAllWithParN_

/**
 * @tsplus static ets/Effect collectPar
 *  // data_first collectPar_
 */
export const ext_collectPar = collectPar

/**
 * @tsplus static ets/Effect.Ops collectPar
 */
export const ext_collectPar_ = collectPar_

/**
 * @tsplus static ets/Effect collectParN
 *  // data_first collectParN_
 */
export const ext_collectParN = collectParN

/**
 * @tsplus static ets/Effect.Ops collectParN
 */
export const ext_collectParN_ = collectParN_

/**
 * @tsplus static ets/Effect cond
 *  // data_first cond_
 */
export const ext_cond = cond

/**
 * @tsplus static ets/Effect.Ops cond
 */
export const ext_cond_ = cond_

/**
 * @tsplus static ets/Effect condM
 *  // data_first condM_
 */
export const ext_condM = condM

/**
 * @tsplus static ets/Effect.Ops condM
 */
export const ext_condM_ = condM_

/**
 * @tsplus static ets/Effect.Ops descriptor
 */
export const ext_descriptor = descriptor

/**
 * @tsplus static ets/Effect.Ops descriptorWith
 */
export const ext_descriptorWith = descriptorWith

/**
 * @tsplus static ets/Effect dropWhile
 *  // data_first dropWhile_
 */
export const ext_dropWhile = dropWhile

/**
 * @tsplus static ets/Effect.Ops dropWhile
 */
export const ext_dropWhile_ = dropWhile_

/**
 * @tsplus static ets/Effect.Ops Applicative
 */
export const ext_Applicative = Applicative

/**
 * @tsplus static ets/Effect.Ops asyncInterrupt
 */
export const ext_effectAsyncInterrupt = effectAsyncInterrupt

/**
 * @tsplus static ets/Effect.Ops asyncInterrupt
 */
export const ext_effectAsyncInterruptBlockingOn = effectAsyncInterruptBlockingOn

/**
 * @tsplus static ets/Effect.Ops async
 */
export const ext_effectAsync = effectAsync

/**
 * @tsplus static ets/Effect.Ops async
 */
export const ext_effectAsyncBlockingOn = effectAsyncBlockingOn

/**
 * @tsplus static ets/Effect.Ops asyncEffect
 */
export const ext_effectAsyncM = effectAsyncM

/**
 * @tsplus static ets/Effect.Ops asyncOption
 */
export const ext_effectAsyncOption = effectAsyncOption

/**
 * @tsplus static ets/Effect.Ops asyncOption
 */
export const ext_effectAsyncOptionBlockingOn = effectAsyncOptionBlockingOn

/**
 * @tsplus static ets/Effect.Ops asyncOptionInterrupt
 */
export const ext_effectMaybeAsyncInterrupt = effectMaybeAsyncInterrupt

/**
 * @tsplus static ets/Effect.Ops asyncOptionInterrupt
 */
export const ext_effectMaybeAsyncInterruptBlockingOn =
  effectMaybeAsyncInterruptBlockingOn

/**
 * @tsplus static ets/Effect.Ops do_
 */
export const ext_do = do__

/**
 * @tsplus static ets/Effect.Ops deriveLifted
 */
export const ext_deriveLifted = deriveLifted

/**
 * @tsplus static ets/Effect.Ops done
 */
export const ext_done = done

/**
 * @tsplus static ets/Effect.Ops die
 */
export const ext_dieWith = dieWith

/**
 * @tsplus static ets/Effect.Ops dieNow
 */
export const ext_die = die

/**
 * @tsplus static ets/Effect.Ops defaultEnv
 */
export const ext_defaultEnv = defaultEnv

/**
 * @tsplus static ets/Effect.Ops defaultPlatform
 */
export const ext_defaultPlatform = defaultPlatform

/**
 * @tsplus static ets/Effect.Ops environment
 */
export const ext_environment = environment

/**
 * @tsplus static ets/Effect.Ops forEach
 */
export const ext_forEach_ = forEach_

/**
 * @tsplus static ets/Effect forEach
 *  // data_first forEach_
 */
export const ext_forEach = forEach

/**
 * @tsplus static ets/Effect.Ops forEachPar
 */
export const ext_forEachPar_ = forEachPar_

/**
 * @tsplus static ets/Effect forEachPar
 *  // data_first forEachPar_
 */
export const ext_forEachPar = forEachPar

/**
 * @tsplus static ets/Effect.Ops forEachParN
 */
export const ext_forEachParN_ = forEachParN_

/**
 * @tsplus static ets/Effect forEachParN
 *  // data_first forEachParN_
 */
export const ext_forEachParN = forEachParN

/**
 * @tsplus static ets/Effect.Ops fail
 */
export const ext_failWith = failWith

/**
 * @tsplus static ets/Effect.Ops failNow
 */
export const ext_fail = fail

/**
 * @tsplus static ets/Effect filter
 *  // data_first filter_
 */
export const ext_filter = filter

/**
 * @tsplus static ets/Effect.Ops filter
 */
export const ext_filter_ = filter_

/**
 * @tsplus static ets/Effect filterNot
 *  // data_first filterNot_
 */
export const ext_filterNot = filterNot

/**
 * @tsplus static ets/Effect.Ops filterNot
 */
export const ext_filterNot_ = filterNot_

/**
 * @tsplus static ets/Effect filterNotPar
 *  // data_first filterNotPar_
 */
export const ext_filterNotPar = filterNotPar

/**
 * @tsplus static ets/Effect.Ops filterNotPar
 */
export const ext_filterNotPar_ = filterNotPar_

/**
 * @tsplus static ets/Effect filterNotParN
 *  // data_first filterNotParN_
 */
export const ext_filterNotParN = filterNotParN

/**
 * @tsplus static ets/Effect.Ops filterNotParN
 */
export const ext_filterNotParN_ = filterNotParN_

/**
 * @tsplus static ets/Effect filterPar
 *  // data_first filterPar_
 */
export const ext_filterPar = filterPar

/**
 * @tsplus static ets/Effect.Ops filterPar
 */
export const ext_filterPar_ = filterPar_

/**
 * @tsplus static ets/Effect filterParN
 *  // data_first filterParN_
 */
export const ext_filterParN = filterParN

/**
 * @tsplus static ets/Effect.Ops filterParN
 */
export const ext_filterParN_ = filterParN_

/**
 * @tsplus static ets/Effect forEachExec
 *  // data_first forEachExec_
 */
export const ext_forEachExec = forEachExec

/**
 * @tsplus static ets/Effect.Ops forEachExec
 */
export const ext_forEachExec_ = forEachExec_

/**
 * @tsplus static ets/Effect.Ops first
 */
export const ext_first = first

/**
 * @tsplus static ets/Effect.Ops forkAll
 */
export const ext_forkAll = forkAll

/**
 * @tsplus static ets/Effect.Ops forkAllUnit
 */
export const ext_forkAllUnit = forkAllUnit

/**
 * @tsplus static ets/Effect.Ops forkScope
 */
export const ext_forkScope = forkScope

/**
 * @tsplus static ets/Effect forkScopeMask
 *  // data_first forkScopeMask_
 */
export const ext_forkScopeMask = forkScopeMask

/**
 * @tsplus static ets/Effect.Ops forkScopeMask
 */
export const ext_forkScopeMask_ = forkScopeMask_

/**
 * @tsplus static ets/Effect.Ops forkScopeWith
 */
export const ext_forkScopeWith = forkScopeWith

/**
 * @tsplus static ets/Effect.Ops firstSuccessOf
 */
export const ext_firstSuccessOf = firstSuccessOf

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromAsync = fromAsync

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromEither = fromEither

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromFiber = fromFiber

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromFiberM = fromFiberM

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromPredicate = fromPredicate

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromPredicate = fromPredicate

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromIO = fromIO

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

// /**
//  * @tsplus static ets/Effect.Ops from
//  */
// export const ext_fromNodeCb = fromNodeCb

/**
 * @tsplus static ets/Effect.Ops from
 */
export const ext_fromOption = fromOption

/**
 * @tsplus static ets/Effect.Ops fromNullable
 */
export const ext_fromNullable = fromNullable

/**
 * @tsplus static ets/Effect.Ops gen
 */
export const ext_gen = gen

/**
 * @tsplus static ets/Effect.Ops genM
 */
export const ext_genM = genM

/**
 * @tsplus static ets/Effect.Ops getIdentity
 */
export const ext_getIdentity = getIdentity

/**
 * @tsplus static ets/Effect.Ops getIdentityPar
 */
export const ext_getIdentityPar = getIdentityPar

/**
 * @tsplus static ets/Effect.Ops getOrFail
 */
export const ext_getOrFail = getOrFail

/**
 * @tsplus static ets/Effect.Ops getOrFailUnit
 */
export const ext_getOrFailUnit = getOrFailUnit

/**
 * @tsplus static ets/Effect.Ops getValidationApplicative
 */
export const ext_getValidationApplicative = getValidationApplicative

/**
 * @tsplus static ets/Effect.Ops halt
 */
export const ext_haltWith = haltWith

/**
 * @tsplus static ets/Effect.Ops haltNow
 */
export const ext_halt = halt

/**
 * @tsplus static ets/Effect if
 *  // data_first if_
 */
export const ext_if = if__

/**
 * @tsplus static ets/Effect.Ops if
 */
export const ext_if_ = if_

/**
 * @tsplus static ets/Effect.Ops interrupt
 */
export const ext_interrupt = interrupt

/**
 * @tsplus static ets/Effect.Ops interruptAs
 */
export const ext_interruptAs = interruptAs

/**
 * @tsplus static ets/Effect.Ops interruptibleMask
 */
export const ext_interruptibleMask = interruptibleMask

/**
 * @tsplus static ets/Effect.Ops iterate
 */
export const ext_iterate = iterate

/**
 * @tsplus static ets/Effect.Ops loop
 */
export const ext_loop = loop

/**
 * @tsplus static ets/Effect.Ops loopUnit
 */
export const ext_loopUnit = loopUnit

/**
 * @tsplus static ets/Effect.Ops makeCustomRuntime
 */
export const ext_makeCustomRuntime = makeCustomRuntime

/**
 * @tsplus static ets/Effect mapN
 *  // data_first mapN_
 */
export const ext_mapN = mapN

/**
 * @tsplus static ets/Effect.Ops mapN
 */
export const ext_mapNOp_ = mapN_

/**
 * @tsplus static ets/Effect mapNPar
 *  // data_first mapNPar_
 */
export const ext_mapNPar = mapNPar

/**
 * @tsplus static ets/Effect.Ops mapNPar
 */
export const ext_mapNParOp_ = mapNPar_

/**
 * @tsplus static ets/Effect mapNParN
 *  // data_first mapNParN_
 */
export const ext_mapNParN = mapNParN

/**
 * @tsplus static ets/Effect.Ops mapNParN
 */
export const ext_mapNParNOp_ = mapNParN_

/**
 * @tsplus static ets/Effect.Ops match
 */
export const ext_match = match

/**
 * @tsplus static ets/Effect.Ops matchIn
 */
export const ext_matchIn = matchIn

/**
 * @tsplus static ets/Effect.Ops matchMorph
 */
export const ext_matchMorph = matchMorph

/**
 * @tsplus static ets/Effect.Ops matchTag
 */
export const ext_matchTag = matchTag

/**
 * @tsplus static ets/Effect.Ops matchTagIn
 */
export const ext_matchTagIn = matchTagIn

/**
 * @tsplus static ets/Effect.Ops memoize
 */
export const ext_memoize = memoize

/**
 * @tsplus static ets/Effect.Ops memoizeEq
 */
export const ext_memoizeEq = memoizeEq

/**
 * @tsplus static ets/Effect mergeAll
 *  // data_first mergeAll_
 */
export const ext_mergeAll = mergeAll

/**
 * @tsplus static ets/Effect.Ops mergeAll
 */
export const ext_mergeAll_ = mergeAll_

/**
 * @tsplus static ets/Effect mergeAllPar
 *  // data_first mergeAllPar_
 */
export const ext_mergeAllPar = mergeAllPar

/**
 * @tsplus static ets/Effect.Ops mergeAllPar
 */
export const ext_mergeAllPar_ = mergeAllPar_

/**
 * @tsplus static ets/Effect mergeAllParN
 *  // data_first mergeAllParN_
 */
export const ext_mergeAllParN = mergeAllParN

/**
 * @tsplus static ets/Effect.Ops mergeAllParN
 */
export const ext_mergeAllParN_ = mergeAllParN_

/**
 * @tsplus static ets/Effect.Ops never
 */
export const ext_never = never

/**
 * @tsplus static ets/Effect.Ops none
 */
export const ext_none = none

/**
 * @tsplus static ets/Effect.Ops parallel
 */
export const ext_parallel = parallel

/**
 * @tsplus static ets/Effect.Ops parallelN
 */
export const ext_parallelN = parallelN

/**
 * @tsplus static ets/Effect partition
 *  // data_first partition_
 */
export const ext_partition = partition

/**
 * @tsplus static ets/Effect.Ops partition
 */
export const ext_partition_ = partition_

/**
 * @tsplus static ets/Effect partitionPar
 *  // data_first partitionPar_
 */
export const ext_partitionPar = partitionPar

/**
 * @tsplus static ets/Effect.Ops partitionPar
 */
export const ext_partitionPar_ = partitionPar_

/**
 * @tsplus static ets/Effect partitionParN
 *  // data_first partitionParN_
 */
export const ext_partitionParN = partitionParN

/**
 * @tsplus static ets/Effect.Ops partitionParN
 */
export const ext_partitionParN_ = partitionParN_

/**
 * @tsplus static ets/Effect.Ops prettyReporter
 */
export const ext_prettyReporter = prettyReporter

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_promise = promise

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_tryCatchPromiseOp = tryCatchPromise

/**
 * @tsplus static ets/Effect provide
 *  // data_first provide_
 */
export const ext_provide = provide

/**
 * @tsplus static ets/Effect.Ops provide_
 */
export const ext_provide_ = provide_

/**
 * @tsplus static ets/Effect provideAll
 *  // data_first provideAll_
 */
export const ext_provideAll = provideAll

/**
 * @tsplus static ets/Effect.Ops provideAll
 */
export const ext_provideAllOp_ = provideAll_

/**
 * @tsplus static ets/Effect provideLayer
 *  // data_first provideLayer_
 */
export const ext_provideLayer = provideLayer

/**
 * @tsplus static ets/Effect.Ops provideLayer
 */
export const ext_provideLayer_ = provideLayer_

/**
 * @tsplus static ets/Effect provideSomeLayer
 *  // data_first provideSomeLayer_
 */
export const ext_provideSomeLayer = provideSomeLayer

/**
 * @tsplus static ets/Effect.Ops provideSomeLayer
 */
export const ext_provideSomeLayer_ = provideSomeLayer_

/**
 * @tsplus static ets/Effect provideSome
 *  // data_first provideSome_
 */
export const ext_provideSome = provideSome

/**
 * @tsplus static ets/Effect.Ops provideSome
 * @tsplus fluent ets/Effect injectSome
 */
export const ext_provideSome_ = provideSome_

/**
 * @tsplus static ets/Effect.Ops raceAll
 */
export const ext_raceAll = raceAll

/**
 * @tsplus static ets/Effect.Ops raceAllWait
 */
export const ext_raceAllWait = raceAllWait

/**
 * @tsplus static ets/Effect.Ops raceAllWithStrategy
 */
export const ext_raceAllWithStrategy = raceAllWithStrategy

/**
 * @tsplus static ets/Effect reduce
 *  // data_first reduce_
 */
export const ext_reduce = reduce

/**
 * @tsplus static ets/Effect.Ops reduce
 */
export const ext_reduce_ = reduce_

/**
 * @tsplus static ets/Effect reduceAll
 *  // data_first reduceAll_
 */
export const ext_reduceAll = reduceAll

/**
 * @tsplus static ets/Effect.Ops reduceAll
 */
export const ext_reduceAll_ = reduceAll_

/**
 * @tsplus static ets/Effect reduceAllPar
 *  // data_first reduceAllPar_
 */
export const ext_reduceAllPar = reduceAllPar

/**
 * @tsplus static ets/Effect.Ops reduceAllPar
 */
export const ext_reduceAllPar_ = reduceAllPar_

/**
 * @tsplus static ets/Effect reduceAllParN
 *  // data_first reduceAllParN_
 */
export const ext_reduceAllParN = reduceAllParN

/**
 * @tsplus static ets/Effect.Ops reduceAllParN
 */
export const ext_reduceAllParN_ = reduceAllParN_

/**
 * @tsplus static ets/Effect reduceRight
 *  // data_first reduceRight_
 */
export const ext_reduceRight = reduceRight

/**
 * @tsplus static ets/Effect.Ops reduceRight
 */
export const ext_reduceRight_ = reduceRight_

/**
 * @tsplus static ets/Effect.Ops runtime
 */
export const ext_runtime = runtime

/**
 * @tsplus static ets/Effect.Ops second
 */
export const ext_second = second

/**
 * @tsplus static ets/Effect.Ops sequential
 */
export const ext_sequential = sequential

/**
 * @tsplus static ets/Effect.Ops service
 */
export const ext_service = service

/**
 * @tsplus static ets/Effect.Ops services
 */
export const ext_services = services

/**
 * @tsplus static ets/Effect.Ops sleep
 */
export const ext_sleep = sleep

/**
 * @tsplus static ets/Effect.Ops struct
 */
export const ext_struct = struct

/**
 * @tsplus static ets/Effect.Ops structPar
 */
export const ext_structPar = structPar

/**
 * @tsplus static ets/Effect structParN
 *  // data_first structParN_
 */
export const ext_structParN = structParN

/**
 * @tsplus static ets/Effect.Ops structParN
 */
export const ext_structParN_ = structParN_

/**
 * @tsplus static ets/Effect.Ops succeed
 */
export const ext_succeedWith = succeedWith

/**
 * @tsplus static ets/Effect.Ops suspend
 */
export const ext_suspend = suspend

/**
 * @tsplus static ets/Effect.Ops succeedNow
 */
export const ext_succeed = succeed

/**
 * @tsplus static ets/Effect.Ops trace
 */
export const ext_trace = trace

/**
 * @tsplus static ets/Effect.Ops tracedMask
 */
export const ext_tracedMask = tracedMask

/**
 * @tsplus static ets/Effect.Ops transplant
 */
export const ext_transplant = transplant

/**
 * @tsplus static ets/Effect.Ops try
 */
export const ext_try = try__

/**
 * @tsplus static ets/Effect.Ops tryCatch
 */
export const ext_tryCatch = tryCatch

/**
 * @tsplus static ets/Effect.Ops tryCatchOption
 */
export const ext_tryCatchOption = tryCatchOption

/**
 * @tsplus static ets/Effect.Ops tryCatchSuspend
 */
export const ext_tryCatchSuspend = tryCatchSuspend

/**
 * @tsplus static ets/Effect.Ops tryCatchPromise
 */
export const ext_tryCatchPromise = tryCatchPromise

/**
 * @tsplus static ets/Effect.Ops tryPromise
 */
export const ext_tryPromise = tryPromise

/**
 * @tsplus static ets/Effect.Ops tuple
 */
export const ext_tuple = tuple

/**
 * @tsplus static ets/Effect.Ops tuplePar
 */
export const ext_tuplePar = tuplePar

/**
 * @tsplus static ets/Effect.Ops tupleParN
 */
export const ext_tupleParN = tupleParN

/**
 * @tsplus static ets/Effect.Ops uninterruptibleMask
 */
export const ext_uninterruptibleMask = uninterruptibleMask

/**
 * @tsplus static ets/Effect.Ops union
 */
export const ext_union = union

/**
 * @tsplus static ets/Effect.Ops unionFn
 */
export const ext_unionFn = unionFn

/**
 * @tsplus static ets/Effect.Ops unit
 */
export const ext_unit = unit

/**
 * @tsplus static ets/Effect.Ops unitTraced
 */
export const ext_unitTraced = unitTraced

/**
 * @tsplus static ets/Effect.Ops untracedMask
 */
export const ext_untracedMask = untracedMask

/**
 * @tsplus static ets/Effect validate
 *  // data_first validate_
 */
export const ext_validate = validate

/**
 * @tsplus static ets/Effect.Ops validate
 */
export const ext_validate_ = validate_

/**
 * @tsplus static ets/Effect validatePar
 *  // data_first validatePar_
 */
export const ext_validatePar = validatePar

/**
 * @tsplus static ets/Effect.Ops validatePar
 */
export const ext_validatePar_ = validatePar_

/**
 * @tsplus static ets/Effect validateParN
 *  // data_first validateParN_
 */
export const ext_validateParN = validateParN

/**
 * @tsplus static ets/Effect.Ops validateParN
 */
export const ext_validateParN_ = validateParN_

/**
 * @tsplus static ets/Effect validateExec
 *  // data_first validateExec_
 */
export const ext_validateExec = validateExec

/**
 * @tsplus static ets/Effect.Ops validateExec
 */
export const ext_validateExec_ = validateExec_

/**
 * @tsplus static ets/Effect validateFirst
 *  // data_first validateFirst_
 */
export const ext_validateFirst = validateFirst

/**
 * @tsplus static ets/Effect.Ops validateFirst
 */
export const ext_validateFirst_ = validateFirst_

/**
 * @tsplus static ets/Effect validateFirstPar
 *  // data_first validateFirstPar_
 */
export const ext_validateFirstPar = validateFirstPar

/**
 * @tsplus static ets/Effect.Ops validateFirstPar
 */
export const ext_validateFirstPar_ = validateFirstPar_

/**
 * @tsplus static ets/Effect validateFirstParN
 *  // data_first validateFirstParN_
 */
export const ext_validateFirstParN = validateFirstParN

/**
 * @tsplus static ets/Effect.Ops validateFirstParN
 */
export const ext_validateFirstParN_ = validateFirstParN_

/**
 * @tsplus static ets/Effect whenCase
 *  // data_first whenCase_
 */
export const ext_whenCase = whenCase

/**
 * @tsplus static ets/Effect.Ops whenCase
 */
export const ext_whenCase_ = whenCase_

/**
 * @tsplus static ets/Effect.Ops withChildren
 */
export const ext_withChildren = withChildren

/**
 * @tsplus static ets/Effect.Ops withRuntime
 */
export const ext_withRuntime = withRuntime

/**
 * @tsplus static ets/Effect.Ops withRuntimeM
 */
export const ext_withRuntimeM = withRuntimeM

/**
 * @tsplus static ets/Effect.Ops yieldNow
 */
export const ext_yieldNow = yieldNow

/**
 * @tsplus fluent ets/Effect absolve
 */
export const ext_absolve = absolve

/**
 * @tsplus fluent ets/Effect absorb
 */
export const ext_absorb = absorb

/**
 * @tsplus fluent ets/Effect absorbWith
 */
export const ext_absorbWith_ = absorbWith_

/**
 * @tsplus fluent ets/Effect andThen
 */
export const ext_andThen_ = andThen_

/**
 * @tsplus fluent ets/Effect ap
 */
export const ext_ap_ = ap_

/**
 * @tsplus fluent ets/Effect asService
 */
export const ext_asService_ = asService_

/**
 * @tsplus fluent ets/Effect as
 */
export const ext_as_ = as_

/**
 * @tsplus fluent ets/Effect asSome
 */
export const ext_asSome = asSome

/**
 * @tsplus fluent ets/Effect asSomeError
 */
export const ext_asSomeError = asSomeError

/**
 * @tsplus fluent ets/Effect asUnit
 */
export const ext_asUnit = asUnit

/**
 * @tsplus fluent ets/Effect awaitAllChildren
 */
export const ext_awaitAllChildren = awaitAllChildren

/**
 * @tsplus fluent ets/Effect bimap
 */
export const ext_bimap_ = bimap_

/**
 * @tsplus fluent ets/Effect bind
 */
export const ext_bind_ = bind_

/**
 * @tsplus fluent ets/Effect bindAll
 */
export const ext_bindAll_ = bindAll_

/**
 * @tsplus fluent ets/Effect bindAllPar
 */
export const ext_bindAllPar_ = bindAllPar_

/**
 * @tsplus fluent ets/Effect bindAllParN
 */
export const ext_bindAllParN_ = bindAllParN_

/**
 * @tsplus fluent ets/Effect bracket
 */
export const ext_bracketExit_ = bracketExit_

/**
 * @tsplus fluent ets/Effect bracketFiber
 */
export const ext_bracketFiber_ = bracketFiber_

/**
 * @tsplus fluent ets/Effect bracketOnError
 */
export const ext_bracketOnError_ = bracketOnError_

/**
 * @tsplus fluent ets/Effect cached
 */
export const ext_cached_ = cached_

/**
 * @tsplus fluent ets/Effect cachedInvalidate
 */
export const ext_cachedInvalidate_ = cachedInvalidate_

/**
 * @tsplus fluent ets/Effect catchAll
 */
export const ext_catchAll_ = catchAll_

/**
 * @tsplus fluent ets/Effect catchTag
 */
export const ext_catchTag_ = catchTag_

/**
 * @tsplus fluent ets/Effect catchAllCause
 */
export const ext_catchAllCause_ = catchAllCause_

/**
 * @tsplus fluent ets/Effect catchAllDefect
 */
export const ext_catchAllDefect_ = catchAllDefect_

/**
 * @tsplus fluent ets/Effect catchSome
 */
export const ext_catchSome_ = catchSome_

/**
 * @tsplus fluent ets/Effect catchSomeCause
 */
export const ext_catchSomeCause_ = catchSomeCause_

/**
 * @tsplus fluent ets/Effect catchSomeDefect
 */
export const ext_catchSomeDefect_ = catchSomeDefect_

/**
 * @tsplus fluent ets/Effect cause
 */
export const ext_cause = cause

/**
 * @tsplus fluent ets/Effect flatMap
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Effect flatMapError
 */
export const ext_chainError_ = chainError_

/**
 * @tsplus fluent ets/Effect compose
 */
export const ext_compose_ = compose_

/**
 * @tsplus fluent ets/Effect continueOrFail
 */
export const ext_continueOrFail_ = continueOrFail_

/**
 * @tsplus fluent ets/Effect continueOrFailM
 */
export const ext_continueOrFailM_ = continueOrFailM_

/**
 * @tsplus fluent ets/Effect delay
 */
export const ext_delay_ = delay_

/**
 * @tsplus fluent ets/Effect either
 */
export const ext_either = either

/**
 * @tsplus fluent ets/Effect ensuring
 */
export const ext_ensuring_ = ensuring_

/**
 * @tsplus fluent ets/Effect ensuringChild
 */
export const ext_ensuringChild_ = ensuringChild_

/**
 * @tsplus fluent ets/Effect ensuringChildren
 */
export const ext_ensuringChildren_ = ensuringChildren_

/**
 * @tsplus fluent ets/Effect eventually
 */
export const ext_eventually = eventually

/**
 * @tsplus fluent ets/Effect flatten
 */
export const ext_flatten = flatten

/**
 * @tsplus fluent ets/Effect flattenErrorOption
 */
export const ext_flattenErrorOption_ = flattenErrorOption_

/**
 * @tsplus fluent ets/Effect flip
 */
export const ext_flip = flip

/**
 * @tsplus fluent ets/Effect flipWith
 */
export const ext_flipWith_ = flipWith_

/**
 * @tsplus fluent ets/Effect foldCauseM
 */
export const ext_foldCauseM_ = foldCauseM_

/**
 * @tsplus fluent ets/Effect foldM
 */
export const ext_foldM_ = foldM_

/**
 * @tsplus fluent ets/Effect forever
 */
export const ext_forever = forever

/**
 * @tsplus fluent ets/Effect fork
 */
export const ext_fork = fork

/**
 * @tsplus fluent ets/Effect forkAs
 */
export const ext_forkAs_ = forkAs_

/**
 * @tsplus fluent ets/Effect forkManaged
 */
export const ext_forkManaged = forkManaged

/**
 * @tsplus fluent ets/Effect forkDaemon
 */
export const ext_forkDaemon = forkDaemon

/**
 * @tsplus fluent ets/Effect forkDaemonReport
 */
export const ext_forkDaemonReport_ = forkDaemonReport_

/**
 * @tsplus fluent ets/Effect forkIn
 */
export const ext_forkIn_ = forkIn_

/**
 * @tsplus fluent ets/Effect forkInReport
 */
export const ext_forkInReport_ = forkInReport_

/**
 * @tsplus fluent ets/Effect forkWithErrorHandler
 */
export const ext_forkWithErrorHandler_ = forkWithErrorHandler_

/**
 * @tsplus fluent ets/Effect get
 */
export const ext_get = get

/**
 * @tsplus fluent ets/Effect ifM
 */
export const ext_ifM_ = ifM_

/**
 * @tsplus fluent ets/Effect injectAll
 * @tsplus fluent ets/Effect injectEnv
 */
export const ext_provideAll_ = provideAll_

/**
 * @tsplus fluent ets/Effect injectService
 */
export const ext_provideService_ = provideService_

/**
 * @tsplus fluent ets/Effect injectServiceM
 */
export const ext_provideServiceM_ = provideServiceM_

/**
 * @tsplus fluent ets/Effect inject
 */
export const ext_inject_ = provideSomeLayer_

/**
 * @tsplus fluent ets/Effect ignore
 */
export const ext_ignore = ignore

/**
 * @tsplus fluent ets/Effect in
 */
export const ext_in_ = in_

/**
 * @tsplus fluent ets/Effect interruptAllChildren
 */
export const ext_interruptAllChildren = interruptAllChildren

/**
 * @tsplus fluent ets/Effect interruptStatus
 */
export const ext_interruptStatus_ = interruptStatus_

/**
 * @tsplus fluent ets/Effect interruptible
 */
export const ext_interruptible = interruptible

/**
 * @tsplus fluent ets/Effect isFailure
 */
export const ext_isFailure = isFailure

/**
 * @tsplus fluent ets/Effect isSuccess
 */
export const ext_isSuccess = isSuccess

/**
 * @tsplus fluent ets/Effect join
 */
export const ext_join_ = join_

/**
 * @tsplus fluent ets/Effect joinEither
 */
export const ext_joinEither_ = joinEither_

/**
 * @tsplus fluent ets/Effect left
 */
export const ext_left = left

/**
 * @tsplus fluent ets/Effect leftOrFail
 */
export const ext_leftOrFail_ = leftOrFail_

/**
 * @tsplus fluent ets/Effect leftOrFailException
 */
export const ext_leftOrFailException = leftOrFailException

/**
 * @tsplus fluent ets/Effect let
 */
export const ext_let_ = let_

/**
 * @tsplus fluent ets/Effect map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Effect mapErrorCause
 */
export const ext_mapErrorCause_ = mapErrorCause_

/**
 * @tsplus fluent ets/Effect mapError
 */
export const ext_mapError_ = mapError_

/**
 * @tsplus fluent ets/Effect mapN
 */
export const ext_mapN_ = mapN_

/**
 * @tsplus fluent ets/Effect mapNPar
 */
export const ext_mapNPar_ = mapNPar_

/**
 * @tsplus fluent ets/Effect mapNParN
 */
export const ext_mapNParN_ = mapNParN_

/**
 * @tsplus fluent ets/Effect mapTryCatch
 */
export const ext_mapTryCatch_ = mapTryCatch_

/**
 * @tsplus fluent ets/Effect merge
 */
export const ext_merge = merge

/**
 * @tsplus fluent ets/Effect onError
 */
export const ext_onError_ = onError_

/**
 * @tsplus fluent ets/Effect onExit
 */
export const ext_onExit_ = onExit_

/**
 * @tsplus fluent ets/Effect onFirst
 */
export const ext_onFirst = onFirst

/**
 * @tsplus fluent ets/Effect onInterrupt
 */
export const ext_onInterrupt_ = onInterrupt_

/**
 * @tsplus fluent ets/Effect onSecond
 */
export const ext_onSecond = onSecond

/**
 * @tsplus fluent ets/Effect onTermination
 */
export const ext_onTermination_ = onTermination_

/**
 * @tsplus fluent ets/Effect once
 */
export const ext_once = once

/**
 * @tsplus fluent ets/Effect option
 */
export const ext_option = option

/**
 * @tsplus fluent ets/Effect optional
 */
export const ext_optional = optional

/**
 * @tsplus fluent ets/Effect orDie
 */
export const ext_orDie = orDie

/**
 * @tsplus fluent ets/Effect orDieKeep
 */
export const ext_orDieKeep = orDieKeep

/**
 * @tsplus fluent ets/Effect orDieWith
 */
export const ext_orDieWith_ = orDieWith_

/**
 * @tsplus fluent ets/Effect orElseEither
 */
export const ext_orElseEither_ = orElseEither_

/**
 * @tsplus fluent ets/Effect orElseFail
 */
export const ext_orElseFail_ = orElseFail_

/**
 * @tsplus fluent ets/Effect orElseOptional
 */
export const ext_orElseOptional_ = orElseOptional_

/**
 * @tsplus fluent ets/Effect orElseSucceed
 */
export const ext_orElseSucceed_ = orElseSucceed_

/**
 * @tsplus fluent ets/Effect orElse
 */
export const ext_orElse_ = orElse_

/**
 * @tsplus fluent ets/Effect overrideForkScope
 */
export const ext_overrideForkScope_ = overrideForkScope_

/**
 * @tsplus fluent ets/Effect race
 */
export const ext_race_ = race_

/**
 * @tsplus fluent ets/Effect raceEither
 */
export const ext_raceEither_ = raceEither_

/**
 * @tsplus fluent ets/Effect raceFirst
 */
export const ext_raceFirst_ = raceFirst_

/**
 * @tsplus fluent ets/Effect raceWith
 */
export const ext_raceWith_ = raceWith_

/**
 * @tsplus fluent ets/Effect raceWithScope
 */
export const ext_raceWithScope_ = raceWithScope_

/**
 * @tsplus fluent ets/Effect refailWithTrace
 */
export const ext_refailWithTrace = refailWithTrace

/**
 * @tsplus fluent ets/Effect refineOrDie
 */
export const ext_refineOrDie_ = refineOrDie_

/**
 * @tsplus fluent ets/Effect refineOrDieWith
 */
export const ext_refineOrDieWith_ = refineOrDieWith_

/**
 * @tsplus fluent ets/Effect reject
 */
export const ext_reject_ = reject_

/**
 * @tsplus fluent ets/Effect repeat
 */
export const ext_repeat_ = repeat_

/**
 * @tsplus fluent ets/Effect repeatN
 */
export const ext_repeatN_ = repeatN_

/**
 * @tsplus fluent ets/Effect repeatOrElse
 */
export const ext_repeatOrElse_ = repeatOrElse_

/**
 * @tsplus fluent ets/Effect repeatOrElseEither
 */
export const ext_repeatOrElseEither_ = repeatOrElseEither_

/**
 * @tsplus fluent ets/Effect repeatUntilM
 */
export const ext_repeatUntilM_ = repeatUntilM_

/**
 * @tsplus fluent ets/Effect repeatUntil
 */
export const ext_repeatUntil_ = repeatUntil_

/**
 * @tsplus fluent ets/Effect repeatWhileM
 */
export const ext_repeatWhileM_ = repeatWhileM_

/**
 * @tsplus fluent ets/Effect repeatWhile
 */
export const ext_repeatWhile_ = repeatWhile_

/**
 * @tsplus fluent ets/Effect replaceService
 */
export const ext_replaceService_ = replaceService_

/**
 * @tsplus fluent ets/Effect replaceServiceM
 */
export const ext_replaceServiceM_ = replaceServiceM_

/**
 * @tsplus fluent ets/Effect replicate
 */
export const ext_replicate_ = replicate_

/**
 * @tsplus fluent ets/Effect require
 */
export const ext_require_ = require_

/**
 * @tsplus fluent ets/Effect reserve
 */
export const ext_reserve_ = reserve_

/**
 * @tsplus fluent ets/Effect resetForkScope
 */
export const ext_resetForkScope_ = resetForkScope

/**
 * @tsplus getter ets/Effect result
 */
export const ext_result = <R, E, A>(value: Effect<R, E, A>) => result(value)

/**
 * @tsplus fluent ets/Effect resurrect
 */
export const ext_resurrect = resurrect

/**
 * @tsplus fluent ets/Effect retry
 */
export const ext_retry_ = retry_

/**
 * @tsplus fluent ets/Effect retryOrElse
 */
export const ext_retryOrElse_ = retryOrElse_

/**
 * @tsplus fluent ets/Effect retryOrElseEither
 */
export const ext_retryOrElseEither_ = retryOrElseEither_

/**
 * @tsplus fluent ets/Effect retryUntilM
 */
export const ext_retryUntilM_ = retryUntilM_

/**
 * @tsplus fluent ets/Effect retryUntil
 */
export const ext_retryUntil_ = retryUntil_

/**
 * @tsplus fluent ets/Effect retryWhileM
 */
export const ext_retryWhileM_ = retryWhileM_

/**
 * @tsplus fluent ets/Effect retryWhile
 */
export const ext_retryWhile_ = retryWhile_

/**
 * @tsplus fluent ets/Effect right
 */
export const ext_right = right

/**
 * @tsplus fluent ets/Effect runPromise
 */
export const ext_runPromise = runPromise

/**
 * @tsplus fluent ets/Effect runPromiseExit
 */
export const ext_runPromiseExit = runPromiseExit

/**
 * @tsplus fluent ets/Effect runFiber
 */
export const ext_runFiber = runFiber

/**
 * @tsplus fluent ets/Effect sandbox
 */
export const ext_sandbox = sandbox

/**
 * @tsplus fluent ets/Effect sandboxWith
 */
export const ext_sandboxWith_ = sandboxWith_

/**
 * @tsplus fluent ets/Effect some
 */
export const ext_some = some

/**
 * @tsplus fluent ets/Effect someOrElseM
 */
export const ext_someOrElseM_ = someOrElseM_

/**
 * @tsplus fluent ets/Effect someOrElse
 */
export const ext_someOrElse_ = someOrElse_

/**
 * @tsplus fluent ets/Effect someOrFail
 */
export const ext_someOrFail_ = someOrFail_

/**
 * @tsplus fluent ets/Effect someOrFailException
 */
export const ext_someOrFailException = someOrFailException

/**
 * @tsplus fluent ets/Effect summarized
 */
export const ext_summarized_ = summarized_

/**
 * @tsplus fluent ets/Effect supervised
 */
export const ext_supervised_ = supervised_

/**
 * @tsplus fluent ets/Effect tap
 */
export const ext_tap_ = tap_

/**
 * @tsplus fluent ets/Effect tapError
 */
export const ext_tapError_ = tapError_

/**
 * @tsplus fluent ets/Effect tapCause
 */
export const ext_tapCause_ = tapCause_

/**
 * @tsplus fluent ets/Effect tapBoth
 */
export const ext_tapBoth_ = tapBoth_

/**
 * @tsplus fluent ets/Effect toLayer
 */
export const ext_fromRawEffect = fromRawEffect

/**
 * @tsplus fluent ets/Effect toLayer
 */
export const ext_fromEffect_ = fromEffect_

/**
 * @tsplus fluent ets/Effect toManaged
 */
export const ext_fromEffect = fromEffect

/**
 * @tsplus fluent ets/Effect toManaged
 */
export const ext_toManagedRelease_ = toManagedRelease_

/**
 * @tsplus fluent ets/Effect timed
 */
export const ext_timed = timed

/**
 * @tsplus fluent ets/Effect timedWith
 */
export const ext_timedWith_ = timedWith_

/**
 * @tsplus fluent ets/Effect timeoutFail
 */
export const ext_timeoutFail_ = timeoutFail_

/**
 * @tsplus fluent ets/Effect timeoutTo
 */
export const ext_timeoutTo_ = timeoutTo_

/**
 * @tsplus fluent ets/Effect timeout
 */
export const ext_timeout_ = timeout_

/**
 * @tsplus fluent ets/Effect to
 */
export const ext_to_ = to_

/**
 * @tsplus fluent ets/Effect traced
 */
export const ext_traced = traced

/**
 * @tsplus fluent ets/Effect tracingStatus
 */
export const ext_tracingStatus_ = tracingStatus_

/**
 * @tsplus fluent ets/Effect uncause
 */
export const ext_uncause = uncause

/**
 * @tsplus fluent ets/Effect uninterruptible
 */
export const ext_uninterruptible = uninterruptible

/**
 * @tsplus fluent ets/Effect unlessM
 */
export const ext_unlessM_ = unlessM_

/**
 * @tsplus fluent ets/Effect unless
 */
export const ext_unless_ = unless_

/**
 * @tsplus fluent ets/Effect unrefineWith
 */
export const ext_unrefineWith_ = unrefineWith_

/**
 * @tsplus fluent ets/Effect unrefine
 */
export const ext_unrefine_ = unrefine_

/**
 * @tsplus fluent ets/Effect unsandbox
 */
export const ext_unsandbox_ = unrefine_

/**
 * @tsplus fluent ets/Effect untraced
 */
export const ext_untraced = untraced

/**
 * @tsplus fluent ets/Effect updateService
 */
export const ext_updateService_ = updateService_

/**
 * @tsplus fluent ets/Effect whenM
 */
export const ext_whenM_ = whenM_

/**
 * @tsplus fluent ets/Effect when
 */
export const ext_when_ = when_

/**
 * @tsplus fluent ets/Effect zip
 */
export const ext_zip_ = zip_

/**
 * @tsplus fluent ets/Effect zipPar
 */
export const ext_zipPar_ = zipPar_

/**
 * @tsplus fluent ets/Effect zipRight
 */
export const ext_zipRight_ = zipRight_

/**
 * @tsplus fluent ets/Effect zipRightPar
 */
export const ext_zipRightPar_ = zipRightPar_

/**
 * @tsplus fluent ets/Effect zipLeft
 */
export const ext_zipLeft_ = zipLeft_

/**
 * @tsplus fluent ets/Effect zipLeftPar
 */
export const ext_zipLeftPar_ = zipLeftPar_

/**
 * @tsplus fluent ets/Effect zipWith
 */
export const ext_zipWith_ = zipWith_

/**
 * @tsplus fluent ets/Effect zipWithPar
 */
export const ext_zipWithPar_ = zipWithPar_
