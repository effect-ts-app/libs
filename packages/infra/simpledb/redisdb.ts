/* eslint-disable @typescript-eslint/no-explicit-any */
import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import * as EO from "@effect-ts-app/core/ext/EffectOption"
import { flow, pipe } from "@effect-ts-app/core/ext/Function"
import * as O from "@effect-ts-app/core/ext/Option"
import * as S from "@effect-ts-app/core/ext/Schema"
import { Lock } from "redlock"

import * as RED from "../redis-client"
import {
  CachedRecord,
  ConnectionException,
  CouldNotAquireDbLockException,
  DBRecord,
  getIndexName,
  getRecordName,
  Index,
} from "./shared"
import * as simpledb from "./simpledb"

const ttl = 10 * 1000

export function createContext<TKey extends string, EA, A extends DBRecord<TKey>>() {
  return <REncode, RDecode, EDecode>(
    type: string,
    encode: (record: A) => T.RIO<REncode, EA>,
    decode: (d: EA) => T.Effect<RDecode, EDecode, A>,
    schemaVersion: string,
    makeIndexKey: (r: A) => Index
  ) => {
    const getData = flow(encode, T.map(JSON.stringify))
    return {
      find: simpledb.find(find, decode, type),
      findByIndex: getIdx,
      save: simpledb.store(find, store, lockRedisRecord, type),
    }

    function find(id: string) {
      return pipe(
        RED.hmgetAll(getKey(id)),
        EO.chainEffect((v) =>
          pipe(
            RedisSerializedDBRecord.Parser["|>"](S.condemnFail)(v),
            T.map(({ data, version }) => ({ data: JSON.parse(data) as EA, version })),
            T.mapError((e) => new ConnectionException(new Error(e.toString())))
          )
        ),
        T.orDie
      )
    }
    function store(record: A, currentVersion: O.Option<string>) {
      const version = currentVersion["|>"](
        O.map((cv) => (parseInt(cv) + 1).toString())
      )["|>"](O.getOrElse(() => "1"))
      return O.fold_(
        currentVersion,
        () =>
          pipe(
            M.use_(lockIndex(record), () =>
              pipe(
                pipe(
                  getIndex(record),
                  EO.zipRight(
                    T.fail(() => new Error("Combination already exists, abort"))
                  )
                ),
                T.zipRight(getData(record)),
                // TODO: instead use MULTI & EXEC to make it in one command?
                T.chain((data) =>
                  hmSetRec(getKey(record.id), {
                    version,
                    timestamp: new Date(),
                    data,
                  })
                ),
                T.zipRight(setIndex(record)),
                T.orDie
              )
            ),
            T.map(() => ({ version, data: record } as CachedRecord<A>))
          ),
        () =>
          pipe(
            getData(record),
            T.chain((data) =>
              hmSetRec(getKey(record.id), {
                version,
                timestamp: new Date(),
                data,
              })
            ),
            T.orDie,
            T.map(() => ({ version, data: record } as CachedRecord<A>))
          )
      )
    }

    function getIndex(record: A) {
      const index = makeIndexKey(record)
      return getIdx(index)
    }

    function setIndex(record: A) {
      const index = makeIndexKey(record)
      return setIdx(index, record)
    }

    function lockIndex(record: A) {
      const index = makeIndexKey(record)
      return lockRedisIdx(index)
    }

    function getIdx(index: Index) {
      return pipe(
        RED.hget(getIdxKey(index), index.key),
        EO.map((i) => i as TKey)
      )
    }

    function setIdx(index: Index, r: A) {
      return RED.hset(getIdxKey(index), index.key, r.id)
    }

    function lockRedisIdx(index: Index) {
      const lockKey = getIdxLockKey(index)
      return M.make_(
        T.bimap_(
          // acquire
          T.chain_(RED.lock, (lock) =>
            T.tryPromise(() => lock.lock(lockKey, ttl) as any as Promise<Lock>)
          ),
          (err) => new CouldNotAquireDbLockException(type, lockKey, err as Error),
          // release
          (lock) => ({
            release: T.tryPromise(() => lock.unlock() as any as Promise<void>)["|>"](
              T.orDie
            ),
          })
        ),
        (l) => l.release
      )
    }

    function lockRedisRecord(id: string) {
      return M.make_(
        T.bimap_(
          // acquire
          T.chain_(RED.lock, (lock) =>
            T.tryPromise(() => lock.lock(getLockKey(id), ttl) as any as Promise<Lock>)
          ),
          (err) => new CouldNotAquireDbLockException(type, id, err as Error),
          // release
          (lock) => ({
            // TODO
            release: T.tryPromise(() => lock.unlock() as any as Promise<void>)["|>"](
              T.orDie
            ),
          })
        ),
        (l) => l.release
      )
    }

    function getKey(id: string) {
      return `v${schemaVersion}.${getRecordName(type, id)}`
    }

    function getLockKey(id: string) {
      return `v${schemaVersion}.locks.${getRecordName(type, id)}`
    }

    function getIdxKey(index: Index) {
      return `v${schemaVersion}.${getIndexName(type, index.doc)}`
    }
    function getIdxLockKey(index: Index) {
      return `v${schemaVersion}.locks.${getIndexName(type, index.doc)}_${index.key}`
    }
  }

  function hmSetRec(key: string, val: RedisSerializedDBRecord) {
    const enc = RedisSerializedDBRecord.Encoder(val)
    return T.chain_(RED.client, (client) =>
      T.uninterruptible(
        T.effectAsync<unknown, ConnectionException, void>((res) => {
          client.hmset(
            key,
            "version",
            enc.version,
            "timestamp",
            enc.timestamp,
            "data",
            enc.data,
            (err) =>
              err ? res(T.fail(new ConnectionException(err))) : res(T.succeed(void 0))
          )
        })
      )
    )
  }
}

export class RedisSerializedDBRecord extends S.Model<RedisSerializedDBRecord>()({
  version: S.prop(S.string),
  timestamp: S.prop(S.date),
  data: S.prop(S.string),
}) {}
