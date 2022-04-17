import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/Function"
import { RedisClient as Client } from "redis"
import Redlock from "redlock"

import { ConnectionException } from "./simpledb/shared.js"

const makeRedisClient = (makeClient: () => Client) =>
  Managed.make_(
    Effect.succeedWith(() => {
      const client = createClient(makeClient)
      const lock = new Redlock([client])
      return {
        client,
        lock,
      }
    }),
    (cl) =>
      pipe(
        Effect.uninterruptible(
          Effect.effectAsync<unknown, Error, void>((res) => {
            cl.client.quit((err) => res(err ? Effect.fail(err) : Effect.unit))
          })
        ),
        Effect.orDie
      )
  )

export interface RedisClient extends _A<ReturnType<typeof makeRedisClient>> {}

export const RedisClient = Has.tag<RedisClient>()

export const { client, lock } = Effect.deriveLifted(RedisClient)(
  [],
  [],
  ["client", "lock"]
)

export const RedisClientLive = (makeClient: () => Client) =>
  Layer.fromManaged(RedisClient)(makeRedisClient(makeClient))

function createClient(makeClient: () => Client) {
  const client = makeClient()
  client.on("error", (error) => {
    console.error(error)
  })
  return client
}

export function get(key: string) {
  return Effect.chain_(client, (client) =>
    Effect.uninterruptible(
      Effect.effectAsync<unknown, ConnectionException, Option<string>>((res) => {
        client.get(key, (err, v) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect.succeed(Option.fromNullable(v)))
        )
      })
    )
  )
}

export function set(key: string, val: string) {
  return Effect.chain_(client, (client) =>
    Effect.uninterruptible(
      Effect.effectAsync<unknown, ConnectionException, void>((res) => {
        client.set(key, val, (err) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect.succeed(void 0))
        )
      })
    )
  )
}

export function hset(key: string, field: string, value: string) {
  return Effect.chain_(client, (client) =>
    Effect.uninterruptible(
      Effect.effectAsync<unknown, ConnectionException, void>((res) => {
        client.hset(key, field, value, (err) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect.succeed(void 0))
        )
      })
    )
  )
}

export function hget(key: string, field: string) {
  return Effect.chain_(client, (client) =>
    Effect.uninterruptible(
      Effect.effectAsync<unknown, ConnectionException, Option<string>>((res) => {
        client.hget(key, field, (err, v) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect.succeed(Option.fromNullable(v)))
        )
      })
    )
  )
}
export function hmgetAll(key: string) {
  return Effect.chain_(client, (client) =>
    Effect.uninterruptible(
      Effect.effectAsync<
        unknown,
        ConnectionException,
        Option<{ [key: string]: string }>
      >((res) => {
        client.hgetall(key, (err, v) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect.succeed(Option.fromNullable(v)))
        )
      })
    )
  )
}
