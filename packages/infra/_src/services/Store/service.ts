/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UniqueKey } from "@azure/cosmos"
import type { Parser, ParserEnv } from "@effect-app/schema/custom/Parser"

import type { These } from "@effect-app/prelude/schema"
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

/**
 * @tsplus type StoreMaker.Ops
 */
export interface StoreMakerOps extends Tag<StoreMaker> {}
export const StoreMaker: StoreMakerOps = Tag<StoreMaker>()

/**
 * @tsplus static ContextMap.Ops Make
 */
export const makeMap = Effect(() => {
  const etags = ROMap.make<string, string>([])["|>"](ROMap.toMutable)
  const getEtag = (id: string) => etags.get(id)
  const setEtag = (id: string, eTag: string | undefined) => {
    eTag === undefined ? etags.delete(id) : etags.set(id, eTag)
  }

  const parsedCache = ROMap.make<
    Parser<any, any, any>,
    Map<unknown, These.These<unknown, unknown>>
  >([])["|>"](ROMap.toMutable)

  const parserCache = ROMap.make<
    Parser<any, any, any>,
    (i: any) => These.These<any, any>
  >([])["|>"](ROMap.toMutable)

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
      getOrSetParser: p => parserCache.get(p) ?? setAndReturn(p, i => parserEnv.cache!.getOrSet(i, p)),
      getOrSetParsers: parsers => {
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
          parsedCache.set(parse, ROMap.make([[i, nf]])["|>"](ROMap.toMutable))
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
})
export interface ContextMap extends Effect.Success<typeof makeMap> {}
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
  url: ConfigSecret
  prefix: string
  dbName: string
}
