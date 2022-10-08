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
    encode: (record: A) => Effect<REncode, never, EA>,
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

    function store(record: A, currentVersion: Maybe<Version>) {
      const version = currentVersion
        .map((cv) => (parseInt(cv) + 1).toString())
        .getOrElse(() => "1")
      const getData = flow(encode, (_) =>
        _.map((data) =>
          JSON.stringify({ version, timestamp: new Date(), data }, undefined, 2)
        )
      )

      const idx = makeIndexKey(record)
      return currentVersion.isSome()
        ? lockIndex(record)
            .zipRight(
              readIndex(idx).flatMap((x) =>
                x[record.id]
                  ? Effect.fail(() => new Error("Combination already exists, abort"))
                  : getData(record)
                      .flatMap((serialised) =>
                        fu.writeTextFile(getFilename(type, record.id), serialised)
                      )
                      .zipRight(writeIndex(idx, { ...x, [idx.key]: record.id }))
              ).orDie
            )
            .scoped.map(() => ({ version, data: record } as CachedRecord<A>))
        : getData(record)
            .flatMap((serialised) =>
              fu.writeTextFile(getFilename(type, record.id), serialised)
            )
            .map(() => ({ version, data: record } as CachedRecord<A>))
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
        Effect.acquireRelease(
          lockFile(getFilename(type, id)).mapBoth(
            (err) => new CouldNotAquireDbLockException(type, id, err as Error),
            (release) => ({ release })
          ),
          (l) => l.release
        )
    }

    function lockIndexOnDisk(type: string) {
      return (id: string) =>
        Effect.acquireRelease(
          lockFile(getIdxName(type, id)).mapBoth(
            (err) => new CouldNotAquireDbLockException(type, id, err as Error),
            (release) => ({ release })
          ),
          (l) => l.release
        )
    }

    function readFile(filePath: string) {
      return fu
        .readTextFile(filePath)
        .catchAll((err) => Effect.die(new ConnectionException(err as Error)))
    }

    function find(type: string) {
      return (id: string) => {
        return tryRead(getFilename(type, id)).map(
          Maybe.$.map((s) => JSON.parse(s) as CachedRecord<EA>)
        )
      }
    }

    function getIdx(index: Index) {
      return readIndex(index).map((idx) => Maybe.fromNullable(idx[index.key]))
    }

    function readIndex(index: Index) {
      return tryRead(getIdxName(type, index.doc)).map(
        Maybe.$.fold(
          () => ({} as Record<string, TKey>),
          (x) => JSON.parse(x) as Record<string, TKey>
        )
      )
    }

    function writeIndex(index: Index, content: Record<string, TKey>) {
      return pipe(JSON.stringify(content), (serialised) =>
        fu.writeTextFile(getIdxName(type, index.doc), serialised)
      )
    }

    function tryRead(filePath: string) {
      return fu
        .fileExists(filePath)
        .flatMap((exists) =>
          !exists ? Effect.succeed(Maybe.none) : readFile(filePath).map(Maybe.some)
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
  return Effect.tryPromise(() =>
    PLF.lock(fileName).then(flow(Effect.tryPromise, (_) => _.orDie))
  )
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
