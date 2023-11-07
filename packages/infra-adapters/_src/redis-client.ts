import type { RedisClient as Client } from "redis"
import Redlock from "redlock"

export class ConnectionException extends Data.TaggedError("ConnectionException")<{ cause: Error; message: string }> {
  constructor(cause: Error) {
    super({ message: "A connection error ocurred", cause })
  }
}

export const makeRedisClient = (makeClient: () => Client) =>
  Effect
    .sync(() => {
      const client = createClient(makeClient)
      const lock = new Redlock([client])

      function get(key: string) {
        return Effect
          .async<never, ConnectionException, Option<string>>((res) => {
            client.get(key, (err, v) =>
              err
                ? res(new ConnectionException(err))
                : res(Effect.sync(() => Option.fromNullable(v))))
          })
          .uninterruptible
      }

      function set(key: string, val: string) {
        return Effect
          .async<never, ConnectionException, void>((res) => {
            client.set(key, val, (err) =>
              err
                ? res(new ConnectionException(err))
                : res(Effect.sync(() => void 0)))
          })
          .uninterruptible
      }

      function hset(key: string, field: string, value: string) {
        return Effect
          .async<never, ConnectionException, void>((res) => {
            client.hset(key, field, value, (err) =>
              err
                ? res(new ConnectionException(err))
                : res(Effect.sync(() => void 0)))
          })
          .uninterruptible
      }

      function hget(key: string, field: string) {
        return Effect
          .async<never, ConnectionException, Option<string>>((res) => {
            client.hget(key, field, (err, v) =>
              err
                ? res(new ConnectionException(err))
                : res(Effect.sync(() => Option.fromNullable(v))))
          })
          .uninterruptible
      }
      function hmgetAll(key: string) {
        return Effect
          .async<never, ConnectionException, Option<{ [key: string]: string }>>(
            (res) => {
              client.hgetall(key, (err, v) =>
                err
                  ? res(new ConnectionException(err))
                  : res(Effect.sync(() => Option.fromNullable(v))))
            }
          )
          .uninterruptible
      }

      return {
        client,
        lock,

        get,
        hget,
        hset,
        hmgetAll,
        set
      }
    })
    .acquireRelease(
      (cl) =>
        Effect
          .async<never, Error, void>((res) => {
            cl.client.quit((err) => res(err ? Effect.fail(err) : Effect.unit))
          })
          .uninterruptible
          .orDie
    )

export interface RedisClient extends Effect.Success<ReturnType<typeof makeRedisClient>> {}

export const RedisClient = Tag<RedisClient>()

export const RedisClientLive = (makeClient: () => Client) => makeRedisClient(makeClient).toLayerScoped(RedisClient)

function createClient(makeClient: () => Client) {
  const client = makeClient()
  client.on("error", (error) => {
    console.error(error)
  })
  return client
}
