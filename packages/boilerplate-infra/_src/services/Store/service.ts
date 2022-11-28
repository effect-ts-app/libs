/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UniqueKey } from "@azure/cosmos"
import type { Parser, ParserEnv } from "@effect-ts-app/schema/custom/Parser"

import type { These } from "@effect-ts-app/boilerplate-prelude/schema"
import type { OptimisticConcurrencyException } from "../../errors.js"

export type StoreConfig<E> = {
  uniqueKeys?: UniqueKey[]
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
  find: (id: Id) => Effect<never, never, Maybe<PM>>
  set: (e: PM) => Effect<never, OptimisticConcurrencyException, PM>
  batchSet: <T extends Collection<PM>>(
    items: T
  ) => Effect<never, OptimisticConcurrencyException, readonly PM[]>
  bulkSet: <T extends Collection<PM>>(
    items: T
  ) => Effect<never, OptimisticConcurrencyException, readonly PM[]>
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

const makeMap = Effect.sync(() => {
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
export const ContextMap = Tag<ContextMap>()
export const LiveContextMap = Layer.fromEffect(ContextMap)(makeMap)

export interface PersistenceModelType<Id extends string> {
  id: Id
  _etag: string | undefined
}

export interface StorageConfig {
  STORAGE_PREFIX: string
  env: string
  serviceName: string
}
