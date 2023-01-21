/* eslint-disable unused-imports/no-unused-imports */
import "./operators.js"

/**
 * @tsplus global
 */
import { Opt } from "@effect-app/core/Option"

/**
 * @tsplus global
 */
import { None, Some } from "@fp-ts/data/Option"

/**
 * @tsplus global
 */
import { Either, Left, Right } from "@fp-ts/data/Either"

/**
 * @tsplus global
 */
import { Predicate, Refinement } from "@fp-ts/data/Predicate"

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
import { Equivalence } from "@fp-ts/data/Equivalence"

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
import { Queue } from "@effect/io/Queue"

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
import { Context, Tag } from "@fp-ts/data/Context"

/**
 * @tsplus global
 */
import { Chunk, NonEmptyChunk } from "@fp-ts/data/Chunk"

/**
 * @tsplus global
 */
import { Order } from "@fp-ts/core/typeclass/Order"

/**
 * @tsplus global
 */
import { Ordering } from "@fp-ts/data/Ordering"

/**
 * @tsplus global
 */
import { Equal } from "@fp-ts/data/Equal"

/**
 * @tsplus global
 */
import { NonEmptyArray, NonEmptyReadonlyArray } from "@fp-ts/data/ReadonlyArray"

/**
 * @tsplus global
 */
import { Duration as DUR } from "@fp-ts/data/Duration"

/**
 * @tsplus global
 */
import { HashMap } from "@fp-ts/data/HashMap"

/**
 * @tsplus global
 */
import { HashSet } from "@fp-ts/data/HashSet"

/**
 * @tsplus global
 */
import { MutableList } from "@fp-ts/data/MutableList"
/**
 * @tsplus global
 */
import { MutableHashMap } from "@fp-ts/data/MutableHashMap"
/**
 * @tsplus global
 */
import { MutableQueue } from "@fp-ts/data/MutableQueue"
/**
 * @tsplus global
 */
import { MutableRef } from "@fp-ts/data/MutableRef"

/**
 * @tsplus global
 */
import { Lens, lens, Optic } from "@fp-ts/optic"

import "./_ext/Prelude.ext.js"
import "./Array.js"
import "./Aspects.js"
import "./Chunk.js"
import "./Effect.js"
import "./Either.js"
import "./global.js"
import "./Option.js"
import "./Tag.js"
import "./Unify.js"
