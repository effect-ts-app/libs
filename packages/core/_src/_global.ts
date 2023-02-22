/* eslint-disable unused-imports/no-unused-imports */
import "./operators.js"

/**
 * @tsplus global
 */
import { Data } from "@effect/data/Data"

/**
 * @tsplus global
 */
import { Opt, Option } from "@effect-app/core/Option"

/**
 * @tsplus global
 */
import { None, Some } from "@effect/data/Option"

/**
 * @tsplus global
 */
import { Either, Left, Right } from "@effect/data/Either"

/**
 * @tsplus global
 */
import { Predicate, Refinement } from "@effect/data/Predicate"

/**
 * @tsplus global
 */
import { flow, LazyArg, pipe, tuple, tupled } from "@effect-app/core/Function"

/**
 * @tsplus global
 */
import { NonEmptyArguments, NonEmptySet, ROSet } from "@effect-app/core/Prelude"

/**
 * @tsplus global
 */
import { Equivalence } from "@effect/data/typeclass/Equivalence"

/**
 * @tsplus global
 */
import { Schedule } from "@effect/io/Schedule"

/**
 * @tsplus global
 */
import { Effect, Semaphore } from "@effect/io/Effect"

/**
 * @tsplus global
 */
import { Stream } from "@effect/stream/Stream"

/**
 * @tsplus global
 */
import { Sink } from "@effect/stream/Sink"

/**
 * @tsplus global
 */
import { Channel } from "@effect/stream/Channel"

/**
 * @tsplus global
 */
import { Take } from "@effect/stream/Take"

/**
 * @tsplus global
 */
import { GroupBy } from "@effect/stream/GroupBy"

/**
 * @tsplus global
 */
import { SubscriptionRef } from "@effect/stream/SubscriptionRef"

/**
 * @tsplus global
 */
import { Dequeue, Queue } from "@effect/io/Queue"

/**
 * @tsplus global
 */
import { Hub } from "@effect/io/Hub"

/**
 * @tsplus global
 */
import { Deferred } from "@effect/io/Deferred"

/**
 * @tsplus global
 */
import { FiberRef } from "@effect/io/FiberRef"

/**
 * @tsplus global
 */
import { Layer } from "@effect/io/Layer"

/**
 * @tsplus global
 */
import { Fiber } from "@effect/io/Fiber"

/**
 * @tsplus global
 */
import { Supervisor } from "@effect/io/Supervisor"

/**
 * @tsplus global
 */
import { Exit } from "@effect/io/Exit"

/**
 * @tsplus global
 */
import { Cause } from "@effect/io/Cause"

/**
 * @tsplus global
 */
import { Ref } from "@effect/io/Ref"

/**
 * @tsplus global
 */
import { Scope } from "@effect/io/Scope"

/**
 * @tsplus global
 */
import { Matcher } from "@effect/match"

/**
 * @tsplus global
 */
import { Context, Tag } from "@effect/data/Context"

/**
 * @tsplus global
 */
import { Chunk, NonEmptyChunk } from "@effect/data/Chunk"

/**
 * @tsplus global
 */
import { Order } from "@effect/data/typeclass/Order"

/**
 * @tsplus global
 */
import { Ordering } from "@effect/data/Ordering"

/**
 * @tsplus global
 */
import { Equal } from "@effect/data/Equal"

/**
 * @tsplus global
 */
import { NonEmptyArray, NonEmptyReadonlyArray } from "@effect/data/ReadonlyArray"

/**
 * @tsplus global
 */
import { Duration, Duration as DUR } from "@effect/data/Duration"

/**
 * @tsplus global
 */
import { HashMap } from "@effect/data/HashMap"

/**
 * @tsplus global
 */
import { HashSet } from "@effect/data/HashSet"

/**
 * @tsplus global
 */
import { MutableList } from "@effect/data/MutableList"
/**
 * @tsplus global
 */
import { MutableHashMap } from "@effect/data/MutableHashMap"
/**
 * @tsplus global
 */
import { MutableQueue } from "@effect/data/MutableQueue"
/**
 * @tsplus global
 */
import { MutableRef } from "@effect/data/MutableRef"

/**
 * @tsplus global
 */
import { Lens, lens, Optic } from "@fp-ts/optic"

/**
 * @tsplus global
 */
import type { lazyGetter } from "@effect-app/core/utils"

/**
 * @tsplus global
 */
import { Debug } from "@effect/io/Debug"

// TODO: these may be problematic global imports causing bundling issues?
// "import type {} from" doesn't work outside this package
import "./_global.ext.js"
import "./Array.js"
// import "./Aspects.js"
import "./Chunk.js"
import "./Effect.js"
import "./Either.js"
import "./global.js"
import "./Optic.js"
import "./Option.js"
import "./Queue.js"
import "./Tag.js"
import "./Unify.js"
