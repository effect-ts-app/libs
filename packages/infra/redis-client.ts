import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Has from "@effect-ts/core/Has"
import * as O from "@effect-ts/core/Option"
import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/ext/Function"
import { createClient as createRedisClient } from "redis"
import Redlock from "redlock"

import { ConnectionException } from "./simpledb/shared"

const makeRedisClient = (redisUrl: string) =>
  M.make_(
    T.succeedWith(() => {
      const client = createClient(redisUrl)
      const lock = new Redlock([client])
      return {
        client,
        lock,
      }
    }),
    (cl) =>
      pipe(
        T.uninterruptible(
          T.effectAsync<unknown, Error, void>((res) => {
            cl.client.quit((err) => res(err ? T.fail(err) : T.unit))
          })
        ),
        T.orDie
      )
  )

export interface RedisClient extends _A<ReturnType<typeof makeRedisClient>> {}

export const RedisClient = Has.tag<RedisClient>()

export const { client, lock } = T.deriveLifted(RedisClient)([], [], ["client", "lock"])

export const RedisClientLive = (redisUrl: string) =>
  L.fromManaged(RedisClient)(makeRedisClient(redisUrl))

function createClient(url: string) {
  const client = createRedisClient(url)
  client.on("error", (error) => {
    console.error(error)
  })
  return client
}

export function get(key: string) {
  return T.chain_(client, (client) =>
    T.uninterruptible(
      T.effectAsync<unknown, ConnectionException, O.Option<string>>((res) => {
        client.get(key, (err, v) =>
          err
            ? res(T.fail(new ConnectionException(err)))
            : res(T.succeed(O.fromNullable(v)))
        )
      })
    )
  )
}

export function set(key: string, val: string) {
  return T.chain_(client, (client) =>
    T.uninterruptible(
      T.effectAsync<unknown, ConnectionException, void>((res) => {
        client.set(key, val, (err) =>
          err ? res(T.fail(new ConnectionException(err))) : res(T.succeed(void 0))
        )
      })
    )
  )
}

export function hset(key: string, field: string, value: string) {
  return T.chain_(client, (client) =>
    T.uninterruptible(
      T.effectAsync<unknown, ConnectionException, void>((res) => {
        client.hset(key, field, value, (err) =>
          err ? res(T.fail(new ConnectionException(err))) : res(T.succeed(void 0))
        )
      })
    )
  )
}

export function hget(key: string, field: string) {
  return T.chain_(client, (client) =>
    T.uninterruptible(
      T.effectAsync<unknown, ConnectionException, O.Option<string>>((res) => {
        client.hget(key, field, (err, v) =>
          err
            ? res(T.fail(new ConnectionException(err)))
            : res(T.succeed(O.fromNullable(v)))
        )
      })
    )
  )
}
export function hmgetAll(key: string) {
  return T.chain_(client, (client) =>
    T.uninterruptible(
      T.effectAsync<unknown, ConnectionException, O.Option<{ [key: string]: string }>>(
        (res) => {
          client.hgetall(key, (err, v) =>
            err
              ? res(T.fail(new ConnectionException(err)))
              : res(T.succeed(O.fromNullable(v)))
          )
        }
      )
    )
  )
}
