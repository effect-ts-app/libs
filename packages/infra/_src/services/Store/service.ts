/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UniqueKey } from "@azure/cosmos"
import type { Parser, ParserEnv } from "@effect-app/schema/custom/Parser"

import type { These } from "@effect-app/prelude/schema"
import type { OptimisticConcurrencyException } from "../../errors.js"
import type { FieldValues } from "../../filter/types.js"
import type { QueryBuilder } from "./filterApi/query.js"

export type StoreConfig<E> = {
  uniqueKeys?: UniqueKey[]
  maxBulkSize?: number
  partitionValue: (e: E) => string | undefined
  allowNamespace?: (namespace: string) => boolean
  defaultValues?: Partial<E>
}

export type SupportedValues = string | boolean | number | null
export type SupportedValues2 = string | boolean | number

// default is eq
export type Where =
  | { key: string; t?: "eq" | "not-eq"; value: SupportedValues }
  | { key: string; t: "gt" | "lt" | "gte" | "lte"; value: SupportedValues2 }
  | {
    key: string
    t: "contains" | "starts-with" | "ends-with" | "not-contains" | "not-starts-with" | "not-ends-with"
    value: string
  }
  | { key: string; t: "includes" | "not-includes"; value: string }
  | {
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
export type Filter<E extends FieldValues> =
  | JoinFindFilter
  | StoreWhereFilter
  | LegacyFilter<E>
  | QueryBuilder<E>

export type FilterJoinSelect = {
  type: "filter_join_select"
  keys: readonly string[] /* value paths of E */
  valueKey: string /* value paths of E[keys][valueKey] */
  value: any /* value path[valueKey] of E */
}

export interface FilterArgs<PM extends PersistenceModelType<string>, U extends keyof PM = never> {
  filter?: Filter<PM>
  select?: NonEmptyReadonlyArray<U>
  limit?: number
  skip?: number
}

export type FilterFunc<PM extends PersistenceModelType<string>> = <U extends keyof PM = never>(
  args: FilterArgs<PM, U>
) => Effect<never, never, (U extends undefined ? PM : Pick<PM, U>)[]>

export interface Store<PM extends PersistenceModelType<Id>, Id extends string> {
  all: Effect<never, never, PM[]>
  filter: FilterFunc<PM>
  /** @deprecated */
  filterJoinSelect: <T extends object>(
    filter: FilterJoinSelect
  ) => Effect<never, never, (T & { _rootId: string })[]>
  find: (id: Id) => Effect<never, never, Option<PM>>
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

/**
 * @tsplus type StoreMaker
 * @tsplus companion StoreMaker.Ops
 */
export abstract class StoreMaker extends TagClass<StoreMaker>() {
  abstract make: <PM extends PersistenceModelType<Id>, Id extends string, R = never, E = never>(
    name: string,
    seed?: Effect<R, E, Iterable<PM>>,
    config?: StoreConfig<PM>
  ) => Effect<R, E, Store<PM, Id>>
}

export const makeContextMap = (): ContextMap => {
  const etags = new Map<string, string>()
  const getEtag = (id: string) => etags.get(id)
  const setEtag = (id: string, eTag: string | undefined) => {
    eTag === undefined ? etags.delete(id) : etags.set(id, eTag)
  }

  const parsedCache = new Map<
    Parser<any, any, any>,
    Map<unknown, These.These<unknown, unknown>>
  >()

  const parserCache = new Map<
    Parser<any, any, any>,
    (i: any) => These.These<any, any>
  >()

  const setAndReturn = <I, E, A>(
    p: Parser<I, E, A>,
    np: (i: I) => These.These<E, A>
  ) => {
    parserCache.set(p, np)
    return np
  }

  const parserEnv: ParserEnv = {
    // TODO: lax: true would turn off refinement checks, may help on large payloads
    // but of course removes confirming of validation rules (which may be okay for a database owned by the app, as we write safely)
    lax: false,
    cache: {
      getOrSetParser: (p) => parserCache.get(p) ?? setAndReturn(p, (i) => parserEnv.cache!.getOrSet(i, p)),
      getOrSetParsers: (parsers) => {
        return Object.entries(parsers).reduce((prev, [k, v]) => {
          prev[k] = parserEnv.cache!.getOrSetParser(v)
          return prev
        }, {} as any)
      },
      getOrSet: (i, parse): any => {
        const c = parsedCache.get(parse)
        if (c) {
          const f = c.get(i)
          if (f) {
            // console.log("$$$ cache hit", i)
            return f
          } else {
            const nf = parse(i, parserEnv)
            c.set(i, nf)
            return nf
          }
        } else {
          const nf = parse(i, parserEnv)
          parsedCache.set(parse, new Map([[i, nf]]))
          return nf
        }
      }
    }
  }

  return {
    get: getEtag,
    set: setEtag,
    parserEnv
  }
}

/**
 * @tsplus static ContextMap.Ops Make
 */
export const makeMap = Effect.sync(() => makeContextMap())

/**
 * @tsplus type ContextMap
 * @tsplus companion ContextMap.Ops
 */
export abstract class ContextMap extends TagClass<ContextMap>() {
  abstract get: (id: string) => string | undefined
  abstract set: (id: string, eTag: string | undefined) => void
  abstract parserEnv: ParserEnv
}

export interface PersistenceModelType<Id extends string> {
  id: Id
  _etag: string | undefined
}

export interface StorageConfig {
  url: Secret
  prefix: string
  dbName: string
}
