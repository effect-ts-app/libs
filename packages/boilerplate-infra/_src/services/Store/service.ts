/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UniqueKey } from "@azure/cosmos"

import type { OptimisticConcurrencyException } from "../../errors.js"

export type StoreConfig<E> = {
  uniqueKeys?: UniqueKey[]
  maxBulkSize?: number
  partitionValue: (e: E) => string | undefined
}

export type SupportedValues = string | boolean | number | null

// default is eq
export type Where = { key: string; t?: "eq" | "not-eq"; value: SupportedValues } | {
  key: string
  t: "in" | "not-in"
  value: readonly (SupportedValues)[]
}

// default is where
export type StoreWhereFilter = {
  type?: "where"
  mode?: "and" | "or" // default is and
  where: readonly [
    Where,
    ...(Where[])
  ]
}
export type LegacyFilter<E> =
  | { by: keyof E; type: "startsWith"; value: any }
  | { by: keyof E; type: "endsWith"; value: any }
  | { by: keyof E; type: "contains"; value: any }
export type JoinFindFilter = {
  type: "join_find"
  keys: readonly string[] /* value paths of E */
  valueKey: string /* value paths of E[keys][valueKey] */
  value: any /* value path[valueKey] of E */
}
export type Filter<E> =
  | JoinFindFilter
  | StoreWhereFilter
  | LegacyFilter<E>

export type FilterJoinSelect = {
  type: "filter_join_select"
  keys: readonly string[] /* value paths of E */
  valueKey: string /* value paths of E[keys][valueKey] */
  value: any /* value path[valueKey] of E */
}

export interface Store<PM extends PersistenceModelType<Id>, Id extends string> {
  all: Effect<never, never, Chunk<PM>>
  filter: (
    filter: Filter<PM>,
    cursor?: { limit?: number; skip?: number }
  ) => Effect<never, never, Chunk<PM>>
  filterJoinSelect: <T extends object>(
    filter: FilterJoinSelect
  ) => Effect<never, never, Chunk<T & { _rootId: string }>>
  find: (id: Id) => Effect<never, never, Opt<PM>>
  set: (e: PM) => Effect<never, OptimisticConcurrencyException, PM>
  batchSet: (
    items: NonEmptyReadonlyArray<PM>
  ) => Effect<never, OptimisticConcurrencyException, NonEmptyReadonlyArray<PM>>
  bulkSet: (
    items: NonEmptyReadonlyArray<PM>
  ) => Effect<never, OptimisticConcurrencyException, NonEmptyReadonlyArray<PM>>
  /**
   * Requires the PM type, not Id, because various stores may need to calculate e.g partition keys.
   */
  remove: (e: PM) => Effect<never, never, void>
}

export interface StoreMaker {
  make: <E extends PersistenceModelType<Id>, Id extends string, Id2 extends Id>(
    name: string,
    existing?: Effect<never, never, ROMap<Id2, E>>,
    config?: StoreConfig<E>
  ) => Effect<never, never, Store<E, Id>>
}

export const StoreMaker = Tag<StoreMaker>()

/**
 * @tsplus type ContextMap
 */
export interface ContextMap {
  fork: Effect<never, never, void>
  get: (id: string) => string | undefined
  set: (id: string, eTag: string | undefined) => void
}

/**
 * @tsplus type ContextMap.Ops
 */
export interface ContextMapOps extends Tag<ContextMap> {}
export const ContextMap: ContextMapOps = Tag<ContextMap>()

export interface PersistenceModelType<Id extends string> {
  id: Id
  _etag: string | undefined
}

export interface StorageConfig {
  prefix: string
  dbName: string
}
