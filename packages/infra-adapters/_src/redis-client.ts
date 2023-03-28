import type { RedisClient as Client } from "redis"
import Redlock from "redlock"

export class ConnectionException extends Error {
  readonly _errorTag = "ConnectionException"
  constructor(readonly error: Error) {
    super("A connection error ocurred")
  }
}

export const makeRedisClient = (makeClient: () => Client) =>
  Effect.sync(() => {
    const client = createClient(makeClient)
    const lock = new Redlock([client])
    return {
      client,
      lock
    }
  }).acquireRelease(
    cl =>
      Effect.async<never, Error, void>(res => {
        cl.client.quit(err => res(err ? Effect.fail(err) : Effect.unit))
      }).uninterruptible.orDie
  )

export interface RedisClient extends Effect.Success<ReturnType<typeof makeRedisClient>> {}

export const RedisClient = Tag<RedisClient>()

export const client = RedisClient.map(_ => _.client)
export const lock = RedisClient.map(_ => _.lock)

export const RedisClientLive = (makeClient: () => Client) => makeRedisClient(makeClient).toLayerScoped(RedisClient)

function createClient(makeClient: () => Client) {
  const client = makeClient()
  client.on("error", error => {
    console.error(error)
  })
  return client
}

export function get(key: string) {
  return client.flatMap(
    client =>
      Effect.async<never, ConnectionException, Option<string>>(res => {
        client.get(key, (err, v) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect(Option.fromNullable(v))))
      }).uninterruptible
  )
}

export function set(key: string, val: string) {
  return client.flatMap(
    client =>
      Effect.async<never, ConnectionException, void>(res => {
        client.set(key, val, err =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect(void 0)))
      }).uninterruptible
  )
}

export function hset(key: string, field: string, value: string) {
  return client.flatMap(
    client =>
      Effect.async<never, ConnectionException, void>(res => {
        client.hset(key, field, value, err =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect(void 0)))
      }).uninterruptible
  )
}

export function hget(key: string, field: string) {
  return client.flatMap(
    client =>
      Effect.async<never, ConnectionException, Option<string>>(res => {
        client.hget(key, field, (err, v) =>
          err
            ? res(Effect.fail(new ConnectionException(err)))
            : res(Effect(Option.fromNullable(v))))
      }).uninterruptible
  )
}
export function hmgetAll(key: string) {
  return client.flatMap(
    client =>
      Effect.async<never, ConnectionException, Option<{ [key: string]: string }>>(
        res => {
          client.hgetall(key, (err, v) =>
            err
              ? res(Effect.fail(new ConnectionException(err)))
              : res(Effect(Option.fromNullable(v))))
        }
      ).uninterruptible
  )
}
