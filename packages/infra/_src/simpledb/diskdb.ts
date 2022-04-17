import * as M from "@effect-ts/core/Effect/Managed"
import * as EO from "@effect-ts-app/core/EffectOption"
import { flow, pipe } from "@effect-ts-app/core/Function"
import fs from "fs"
import * as PLF from "proper-lockfile"

import * as fu from "./fileutil.js"
import {
  CachedRecord,
  ConnectionException,
  CouldNotAquireDbLockException,
  DBRecord,
  getIndexName,
  getRecordName,
  Index,
} from "./shared.js"
import * as simpledb from "./simpledb.js"
import { Version } from "./simpledb.js"

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => Effect.RIO<REncode, EA>,
    decode: (d: EA) => Effect<RDecode, EDecode, A>,
    schemaVersion: string,
    makeIndexKey: (r: A) => Index,
    dir = "./data.js"
  ) => {
    initialise(dir)
    const globalLock = "global.lock"
    const typeLockKey = getIdxName(type, globalLock)
    if (!fs.existsSync(typeLockKey)) {
      fs.writeFileSync(typeLockKey, "", "utf-8")
    }

    return {
      find: simpledb.find(find(type), decode, type),
      findByIndex: getIdx,
      save: simpledb.store(find(type), store, lockRecordOnDisk(type), type),
    }

    function store(record: A, currentVersion: Option<Version>) {
      const version = currentVersion
        .map((cv) => (parseInt(cv) + 1).toString())
        .getOrElse(() => "1")
      const getData = flow(
        encode,
        Effect.map((data) =>
          JSON.stringify({ version, timestamp: new Date(), data }, undefined, 2)
        )
      )

      const idx = makeIndexKey(record)
      return Option.isSome(currentVersion)
        ? pipe(
            M.use_(lockIndex(record), () =>
              pipe(
                readIndex(idx),
                Effect.chain((x) =>
                  x[record.id]
                    ? Effect.fail(() => new Error("Combination already exists, abort"))
                    : pipe(
                        getData(record),
                        Effect.chain((serialised) =>
                          fu.writeTextFile(getFilename(type, record.id), serialised)
                        ),
                        Effect.zipRight(writeIndex(idx, { ...x, [idx.key]: record.id }))
                      )
                ),
                Effect.orDie
              )
            ),
            Effect.map(() => ({ version, data: record } as CachedRecord<A>))
          )
        : pipe(
            getData(record),
            Effect.chain((serialised) =>
              fu.writeTextFile(getFilename(type, record.id), serialised)
            ),
            Effect.map(() => ({ version, data: record } as CachedRecord<A>))
          )
    }

    function lockIndex(record: A) {
      const index = makeIndexKey(record)
      return lockDiskIndex(index)
    }

    function lockDiskIndex(_: Index) {
      /*
    Disk index locks require a file to exist already, hence for now we use a global index lock.
    */
      //const lockKey = getIdxKey(index)
      const lockKey = globalLock
      return lockIndexOnDisk(type)(lockKey)
    }

    function lockRecordOnDisk(type: string) {
      return (id: string) =>
        M.make_(
          Effect.bimap_(
            lockFile(getFilename(type, id)),
            (err) => new CouldNotAquireDbLockException(type, id, err as Error),
            (release) => ({ release })
          ),
          (l) => l.release
        )
    }

    function lockIndexOnDisk(type: string) {
      return (id: string) =>
        M.make_(
          Effect.bimap_(
            lockFile(getIdxName(type, id)),
            (err) => new CouldNotAquireDbLockException(type, id, err as Error),
            (release) => ({ release })
          ),
          (l) => l.release
        )
    }

    function readFile(filePath: string) {
      return pipe(
        fu.readTextFile(filePath),
        Effect.catchAll((err) => Effect.die(new ConnectionException(err as Error)))
      )
    }

    function find(type: string) {
      return (id: string) => {
        return pipe(
          tryRead(getFilename(type, id)),
          EO.map((s) => JSON.parse(s) as CachedRecord<EA>)
        )
      }
    }

    function getIdx(index: Index) {
      return pipe(
        readIndex(index),
        Effect.map((idx) => Option.fromNullable(idx[index.key]))
      )
    }

    function readIndex(index: Index) {
      return pipe(
        tryRead(getIdxName(type, index.doc)),
        Effect.map(
          Option.fold(
            () => ({} as Record<string, TKey>),
            (x) => JSON.parse(x) as Record<string, TKey>
          )
        )
      )
    }

    function writeIndex(index: Index, content: Record<string, TKey>) {
      return pipe(JSON.stringify(content), (serialised) =>
        fu.writeTextFile(getIdxName(type, index.doc), serialised)
      )
    }

    function tryRead(filePath: string) {
      return pipe(
        fu.fileExists(filePath),
        Effect.chain((exists) =>
          !exists ? Effect.succeed(Option.none) : pipe(readFile(filePath), Effect.map(Option.some))
        )
      )
    }

    function getFilename(type: string, id: string) {
      return `${dir}/v${schemaVersion}.${getRecordName(type, id)}.json`
    }

    function getIdxName(type: string, id: string) {
      return `${dir}/v${schemaVersion}.${getIndexName(type, id)}.json`
    }
  }
}

function lockFile(fileName: string) {
  return Effect.tryPromise(() => PLF.lock(fileName).then(flow(Effect.tryPromise, Effect.orDie)))
}

// TODO: ugh.
let initialised = false
export function initialise(dir: string) {
  if (initialised) {
    return
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  initialised = true
}
