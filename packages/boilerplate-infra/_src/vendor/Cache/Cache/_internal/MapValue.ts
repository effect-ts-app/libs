import type { EntryStats } from "../../EntryStats/definition.js"
import type { MapKey } from "./MapKey.js"

/**
 * A `MapValue` represents a value in the cache. A value may either be
 * `Pending` with a `Deferred` that will contain the result of computing the
 * lookup function, when it is available, or `Complete` with an `Exit` value
 * that contains the result of computing the lookup function.
 */
export type MapValue<Key, Error, Value> =
  | Pending<Key, Error, Value>
  | Complete<Key, Error, Value>
  | Refreshing<Key, Error, Value>

export class Pending<Key, Error, Value> {
  readonly _tag = "Pending"
  constructor(
    readonly key: MapKey<Key>,
    readonly deferred: Deferred<Error, Value>
  ) {}
}

export class Complete<Key, Error, Value> {
  readonly _tag = "Complete"
  constructor(
    readonly key: MapKey<Key>,
    readonly exit: Exit<Error, Value>,
    readonly entryStats: EntryStats,
    readonly timeToLiveMillis: number
  ) {}
}

export class Refreshing<Key, Error, Value> {
  readonly _tag = "Refreshing"
  constructor(
    readonly deferred: Deferred<Error, Value>,
    readonly complete: Complete<Key, Error, Value>
  ) {}
}
