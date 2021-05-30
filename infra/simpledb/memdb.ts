import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Eq from "@effect-ts/core/Equal"
import * as O from "@effect-ts/core/Option"
import * as Sy from "@effect-ts/core/Sync"
import * as EO from "@effect-ts-app/core/ext/EffectOption"
import { flow, pipe } from "@effect-ts-app/core/ext/Function"
import * as S from "@effect-ts-app/core/ext/Schema"

import {
  CachedRecord,
  DBRecord,
  getRecordName,
  makeMap,
  SerializedDBRecord,
} from "./shared"
import * as simpledb from "./simpledb"
import { Version } from "./simpledb"

// When we are in-process, we want to share the same Storage
// Do not try this at home.
const storage = makeMap<string, string>()

const parseSDB = SerializedDBRecord.Parser["|>"](S.condemnFail)

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => T.RIO<REncode, EA>,
    decode: (d: EA) => T.Effect<RDecode, EDecode, A>
  ) => {
    return {
      find: simpledb.find(find, decode, type),
      findBy,
      save: simpledb.store(find, store, bogusLock, type),
    }

    function find(id: string) {
      return pipe(
        storage.find(getRecordName(type, id)),
        EO.map((s) => JSON.parse(s) as unknown),
        EO.chainEffect(parseSDB),
        EO.map(({ data, version }) => ({ data: JSON.parse(data) as EA, version }))
      )
    }

    function findBy<V extends Partial<A>>(keys: V, eq: Eq.Equal<V>) {
      // Naive implementation, fine for in memory testing purposes.
      return pipe(
        T.gen(function* ($) {
          for (const [, value] of storage) {
            const sdb_ = JSON.parse(value) as unknown
            const sdb = yield* $(parseSDB(sdb_))
            const cr = { data: JSON.parse(sdb.data) as EA, version: sdb.version }
            const r = yield* $(
              pipe(
                decode(cr.data),
                T.chain((d) =>
                  eq.equals(keys, d as unknown as V)
                    ? Sy.succeed(d)
                    : Sy.fail("not equals")
                ),
                T.result
              )
            )
            if (r._tag === "Success") {
              return r.value
            }
          }
          return null
        }),
        T.map(O.fromNullable)
      )
    }

    function store(record: A, currentVersion: O.Option<Version>) {
      const version = currentVersion["|>"](
        O.map((cv) => (parseInt(cv) + 1).toString())
      )["|>"](O.getOrElse(() => "1"))

      const getData = flow(
        encode,
        T.map(JSON.stringify),
        T.map((data) => JSON.stringify({ version, timestamp: new Date(), data }))
      )
      return pipe(
        getData(record),
        T.chain((serialised) =>
          storage.set(getRecordName(type, record.id), serialised)
        ),
        T.map(() => ({ version, data: record } as CachedRecord<A>))
      )
    }
  }
}

function bogusLock() {
  return M.make_(T.unit, () => T.unit)
}
