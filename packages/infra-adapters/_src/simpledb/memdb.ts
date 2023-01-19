import { flow } from "@effect-app/core/Function"
import * as MO from "@effect-app/schema"
import type * as Eq from "@effect-ts/core/Equal"

import type { CachedRecord, DBRecord } from "./shared.js"
import { getRecordName, makeMap, SerializedDBRecord } from "./shared.js"
import * as simpledb from "./simpledb.js"
import type { Version } from "./simpledb.js"

// When we are in-process, we want to share the same Storage
// Do not try this at home.
const storage = makeMap<string, string>()

const parseSDB = SerializedDBRecord.Parser >= MO.condemnFail

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect<REncode, never, EA>,
    decode: (d: EA) => Effect<RDecode, EDecode, A>
  ) => {
    return {
      find: simpledb.find(find, decode, type),
      findBy,
      save: simpledb.store(find, store, bogusLock, type)
    }

    function find(id: string) {
      return storage
        .find(getRecordName(type, id))
        .map(_ => _.map(s => JSON.parse(s) as unknown))
        .flatMapOpt(parseSDB)
        .mapOpt(({ data, version }) => ({
          data: JSON.parse(data) as EA,
          version
        }))
    }

    function findBy<V extends Partial<A>>(keys: V, eq: Eq.Equal<V>) {
      // Naive implementation, fine for in memory testing purposes.
      return Effect.gen(function*($) {
        for (const [, value] of storage) {
          const sdb_ = JSON.parse(value) as unknown
          const sdb = yield* $(parseSDB(sdb_))
          const cr = { data: JSON.parse(sdb.data) as EA, version: sdb.version }
          const r = yield* $(
            decode(cr.data).flatMap(d =>
              eq.equals(keys, d as unknown as V)
                ? Effect(d)
                : Effect.fail("not equals")
            ).exit
          )
          if (r.isSuccess()) {
            return r.value
          }
        }
        return null
      }).map(Opt.fromNullable)
    }

    function store(record: A, currentVersion: Opt<Version>) {
      const version = currentVersion
        .map(cv => (parseInt(cv) + 1).toString())
        .getOrElse(() => "1")

      const getData = flow(
        encode,
        _ => _.map(JSON.stringify).map(data => JSON.stringify({ version, timestamp: new Date(), data }))
      )
      return getData(record)
        .flatMap(serialised => storage.set(getRecordName(type, record.id), serialised))
        .map(() => ({ version, data: record } as CachedRecord<A>))
    }
  }
}

function bogusLock() {
  return Effect.unit.acquireRelease(() => Effect.unit)
}
