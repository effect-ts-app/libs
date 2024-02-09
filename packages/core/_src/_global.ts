/* eslint-disable unused-imports/no-unused-imports */

/**
 * @tsplus global
 */
import { Data } from "@effect-app/core/Data"

/**
 * @tsplus global
 */
import { Opt, Option } from "@effect-app/core/Option"

/**
 * @tsplus global
 */
import { None, Some } from "effect/Option"

/**
 * @tsplus global
 */
import { Predicate, Refinement } from "effect/Predicate"

/**
 * @tsplus global
 */
import { flow, LazyArg, pipe, tuple, tupled } from "@effect-app/core/Function"

/**
 * @tsplus global
 */
import { NonEmptySet, ROSet } from "@effect-app/core/Prelude"

/**
 * @tsplus global
 */
import { Equivalence } from "effect/Equivalence"

/**
 * @tsplus global
 */
import { Schedule } from "effect/Schedule"

/**
 * @tsplus global
 */
import { Effect, Semaphore } from "effect/Effect"

/**
 * @tsplus global
 */
import { STM } from "effect/STM"

/**
 * @tsplus global
 */
import { Stream } from "effect/Stream"

/**
 * @tsplus global
 */
import { Sink } from "effect/Sink"

/**
 * @tsplus global
 */
import { Channel } from "effect/Channel"

/**
 * @tsplus global
 */
import { Take } from "effect/Take"

/**
 * @tsplus global
 */
import { GroupBy } from "effect/GroupBy"

/**
 * @tsplus global
 */
import { SubscriptionRef } from "effect/SubscriptionRef"

/**
 * @tsplus global
 */
import { Dequeue, Queue } from "effect/Queue"

/**
 * @tsplus global
 */
import { Matcher } from "effect/Match"

/**
 * @tsplus global
 */
import { PubSub } from "effect/PubSub"

/**
 * @tsplus global
 */
import { Deferred } from "effect/Deferred"

/**
 * @tsplus global
 */
import { FiberRef } from "effect/FiberRef"

/**
 * @tsplus global
 */
import { Layer } from "effect/Layer"

/**
 * @tsplus global
 */
import { Fiber } from "effect/Fiber"

/**
 * @tsplus global
 */
import { Supervisor } from "effect/Supervisor"

/**
 * @tsplus global
 */
import { Exit } from "effect/Exit"

/**
 * @tsplus global
 */
import { Cause } from "effect/Cause"

/**
 * @tsplus global
 */
import { Ref } from "effect/Ref"

/**
 * @tsplus global
 */
import { Scope } from "effect/Scope"

// /**
//  * @tsplus global
//  */
// import { Matcher } from "@effect/match"

/**
 * @tsplus global
 */
import { Context, GenericTag, Tag } from "effect/Context"

/**
 * @tsplus global
 */
import { Chunk, NonEmptyChunk } from "effect/Chunk"

/**
 * @tsplus global
 */
import { List } from "effect/List"

/**
 * @tsplus global
 */
import { Order } from "effect/Order"

/**
 * @tsplus global
 */
import { Ordering } from "effect/Ordering"

/**
 * @tsplus global
 */
import { Equal } from "effect/Equal"

/**
 * @tsplus global
 */
import { Hash } from "effect/Hash"

/**
 * @tsplus global
 */
import { NonEmptyArray, NonEmptyReadonlyArray } from "effect/ReadonlyArray"

/**
 * @tsplus global
 */
import { ReadonlyRecord } from "effect/ReadonlyRecord"

/**
 * @tsplus global
 */
import { Duration, Duration as DUR } from "effect/Duration"

/**
 * @tsplus global
 */
import { HashMap } from "effect/HashMap"

/**
 * @tsplus global
 */
import { HashSet } from "effect/HashSet"

/**
 * @tsplus global
 */
import { MutableList } from "effect/MutableList"
/**
 * @tsplus global
 */
import { MutableHashMap } from "effect/MutableHashMap"
/**
 * @tsplus global
 */
import { MutableQueue } from "effect/MutableQueue"
/**
 * @tsplus global
 */
import { MutableRef } from "effect/MutableRef"

/**
 * @tsplus global
 */
import { Lens, lens, Optic } from "@fp-ts/optic"

/**
 * @tsplus global
 */
import type { lazyGetter } from "@effect-app/core/utils"

// TODO: these may be problematic global imports causing bundling issues?
// "import type {} from" doesn't work outside this package
import "./_global.ext.js"
import "./Array.js"
// import "./Aspects.js"
import "./Chunk.js"
import "./Effect.js"
import "./global.js"
import "./Optic.js"
import "./Option.js"
import "./Tag.js"
import "./Unify.js"
