import * as Eq from "@effect-ts/core/Equal"
import { flow } from "@effect-ts-app/core/Function"
import { Effect, Option } from "@effect-ts-app/prelude/Prelude"
import * as MO from "@effect-ts-app/schema"

import {
  CachedRecord,
  DBRecord,
  getRecordName,
  makeMap,
  SerializedDBRecord,
} from "./shared.js"
import * as simpledb from "./simpledb.js"
import { Version } from "./simpledb.js"

// When we are in-process, we want to share the same Storage
// Do not try this at home.
const storage = makeMap<string, string>()

const parseSDB = SerializedDBRecord.Parser >= MO.condemnFail

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect.RIO<REncode, EA>,
    decode: (d: EA) => Effect<RDecode, EDecode, A>
  ) => {
    return {
      find: simpledb.find(find, decode, type),
      findBy,
      save: simpledb.store(find, store, bogusLock, type),
    }

    function find(id: string) {
      return storage
        .find(getRecordName(type, id))
        .mapOption((s) => JSON.parse(s) as unknown)
        .chainOptionEffect(parseSDB)
        .mapOption(({ data, version }) => ({
          data: JSON.parse(data) as EA,
          version,
        }))
    }

    function findBy<V extends Partial<A>>(keys: V, eq: Eq.Equal<V>) {
      // Naive implementation, fine for in memory testing purposes.
      return Effect.gen(function* ($) {
        for (const [, value] of storage) {
          const sdb_ = JSON.parse(value) as unknown
          const sdb = yield* $(parseSDB(sdb_))
          const cr = { data: JSON.parse(sdb.data) as EA, version: sdb.version }
          const r = yield* $(
            decode(cr.data)
              .chain((d) =>
                eq.equals(keys, d as unknown as V)
                  ? Sync.succeed(d)
                  : Sync.fail("not equals")
              )
              .result()
          )
          if (r._tag === "Success") {
            return r.value
          }
        }
        return null
      }).map(Option.fromNullable)
    }

    function store(record: A, currentVersion: Option<Version>) {
      const version = currentVersion
        .map((cv) => (parseInt(cv) + 1).toString())
        .getOrElse(() => "1")

      const getData = flow(encode, (_) =>
        _.map(JSON.stringify).map((data) =>
          JSON.stringify({ version, timestamp: new Date(), data })
        )
      )
      return getData(record)
        .chain((serialised) => storage.set(getRecordName(type, record.id), serialised))
        .map(() => ({ version, data: record } as CachedRecord<A>))
    }
  }
}

function bogusLock() {
  return Managed.make_(Effect.unit, () => Effect.unit)
}
