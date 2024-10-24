/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UniqueKey } from "@azure/cosmos"
import { Context, Effect } from "effect-app"
import type { NonEmptyReadonlyArray, Option, Secret } from "effect-app"
import type { OptimisticConcurrencyException } from "../../errors.js"
import type { FieldValues } from "../../filter/types.js"
import type { FieldPath } from "../../filter/types/path/index.js"
import type { FilterResult } from "./filterApi/query.js"

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

export type Filter = readonly FilterResult[]

export interface O<TFieldValues extends FieldValues> {
  key: FieldPath<TFieldValues>
  direction: "ASC" | "DESC"
}

export interface FilterArgs<Encoded extends { id: string }, U extends keyof Encoded = never> {
  t: Encoded
  filter?: Filter | undefined
  select?: NonEmptyReadonlyArray<U> | undefined
  order?: NonEmptyReadonlyArray<O<NoInfer<Encoded>>>
  limit?: number | undefined
  skip?: number | undefined
}

export type FilterFunc<Encoded extends { id: string }> = <U extends keyof Encoded = never>(
  args: FilterArgs<Encoded, U>
) => Effect<(U extends undefined ? Encoded : Pick<Encoded, U>)[]>

export interface Store<
  Encoded extends { id: Id },
  Id extends string,
  PM extends PersistenceModelType<Encoded> = PersistenceModelType<Encoded>
> {
  all: Effect<PM[]>
  filter: FilterFunc<Encoded>
  find: (id: Id) => Effect<Option<PM>>
  set: (e: PM) => Effect<PM, OptimisticConcurrencyException>
  batchSet: (
    items: NonEmptyReadonlyArray<PM>
  ) => Effect<NonEmptyReadonlyArray<PM>, OptimisticConcurrencyException>
  bulkSet: (
    items: NonEmptyReadonlyArray<PM>
  ) => Effect<NonEmptyReadonlyArray<PM>, OptimisticConcurrencyException>
  /**
   * Requires the Encoded type, not Id, because various stores may need to calculate e.g partition keys.
   */
  remove: (e: Encoded) => Effect<void>
}

/**
 * @tsplus type StoreMaker
 * @tsplus companion StoreMaker.Ops
 */
export class StoreMaker extends Context.TagId("effect-app/StoreMaker")<StoreMaker, {
  make: <Encoded extends { id: Id }, Id extends string, R = never, E = never>(
    name: string,
    seed?: Effect<Iterable<Encoded>, E, R>,
    config?: StoreConfig<Encoded>
  ) => Effect<Store<Encoded, Id>, E, R>
}>() {
}

export const makeContextMap = () => {
  const etags = new Map<string, string>()
  const getEtag = (id: string) => etags.get(id)
  const setEtag = (id: string, eTag: string | undefined) => {
    eTag === undefined ? etags.delete(id) : etags.set(id, eTag)
  }

  // const parsedCache = new Map<
  //   Parser<any, any, any>,
  //   Map<unknown, These.These<unknown, unknown>>
  // >()

  // const parserCache = new Map<
  //   Parser<any, any, any>,
  //   (i: any) => These.These<any, any>
  // >()

  // const setAndReturn = <I, E, A>(
  //   p: Parser<I, E, A>,
  //   np: (i: I) => These.These<E, A>
  // ) => {
  //   parserCache.set(p, np)
  //   return np
  // }

  // const parserEnv: ParserEnv = {
  //   // TODO: lax: true would turn off refinement checks, may help on large payloads
  //   // but of course removes confirming of validation rules (which may be okay for a database owned by the app, as we write safely)
  //   lax: false,
  //   cache: {
  //     getOrSetParser: (p) => parserCache.get(p) ?? setAndReturn(p, (i) => parserEnv.cache!.getOrSet(i, p)),
  //     getOrSetParsers: (parsers) => {
  //       return Object.entries(parsers).reduce((prev, [k, v]) => {
  //         prev[k] = parserEnv.cache!.getOrSetParser(v)
  //         return prev
  //       }, {} as any)
  //     },
  //     getOrSet: (i, parse): any => {
  //       const c = parsedCache.get(parse)
  //       if (c) {
  //         const f = c.get(i)
  //         if (f) {
  //           // console.log("$$$ cache hit", i)
  //           return f
  //         } else {
  //           const nf = parse(i, parserEnv)
  //           c.set(i, nf)
  //           return nf
  //         }
  //       } else {
  //         const nf = parse(i, parserEnv)
  //         parsedCache.set(parse, new Map([[i, nf]]))
  //         return nf
  //       }
  //     }
  //   }
  // }

  return {
    get: getEtag,
    set: setEtag
    // parserEnv
  }
}

const makeMap = Effect.sync(() => makeContextMap())

/**
 * @tsplus type ContextMap
 * @tsplus companion ContextMap.Ops
 */
export class ContextMap extends Context.TagMakeId("effect-app/ContextMap", makeMap)<ContextMap>() {
}

export type PersistenceModelType<Encoded extends object> = Encoded & {
  _etag?: string | undefined
}

export interface StorageConfig {
  url: Secret.Secret
  prefix: string
  dbName: string
}
