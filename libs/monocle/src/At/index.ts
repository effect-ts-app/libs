// ets_tracing: off

import type { HashMap } from "@effect-ts/core"
import { pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"

import * as _ from "../Internal/index.js"
import type { Iso } from "../Iso/index.js"
import type { Lens } from "../Lens/index.js"

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface At<S, I, A> {
  readonly at: (i: I) => Lens<S, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Lift an instance of `At` using an `Iso`
 */
export const fromIso =
  <T, S>(iso: Iso<T, S>) =>
  <I, A>(sia: At<S, I, A>): At<T, I, A> => ({
    at: (i) => pipe(iso, _.isoAsLens, _.lensComposeLens(sia.at(i)))
  })

export const atRecord: <A = never>() => At<
  Readonly<Record<string, A>>,
  string,
  Option<A>
> = _.atRecord

export const atHashMap: <K = never, A = never>() => At<
  Readonly<HashMap.HashMap<K, A>>,
  K,
  Option<A>
> = _.atHashMap
