import { get } from "@effect-ts-app/boilerplate-prelude/utils"

import { OptimisticConcurrencyException } from "../../errors.js"

import type { Filter, FilterJoinSelect, PersistenceModelType } from "./service.js"

import objectHash from "object-hash"

export const makeETag = <E extends PersistenceModelType<Id>, Id extends string>(
  { _etag, ...e }: E
): E =>
  ({
    ...e,
    _etag: objectHash(e)
  }) as any
export const makeUpdateETag = (name: string) =>
  <E extends PersistenceModelType<Id>, Id extends string>(e: E, current: Maybe<E>) =>
    Effect.gen(function*($) {
      if (current.isSome() && current.value._etag !== e._etag) {
        return yield* $(
          Effect.fail(new OptimisticConcurrencyException(name, current.value.id, current.value._etag, e._etag))
        )
      }
      const newE = makeETag(e)
      return newE
    })

export function codeFilter<E extends { id: string }, NE extends E>(filter: Filter<NE>) {
  return (x: E) =>
    filter.type === "startsWith"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? lowercaseIfString((x as any)[filter.by]).startsWith(filter.value.toLowerCase())
        ? Maybe(x as unknown as NE)
        : Maybe.none
      : filter.type === "endsWith"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? lowercaseIfString((x as any)[filter.by]).endsWith(filter.value.toLowerCase())
        ? Maybe(x as unknown as NE)
        : Maybe.none
      : filter.type === "contains"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ? lowercaseIfString((x as any)[filter.by]).includes(filter.value.toLowerCase())
        ? Maybe(x as unknown as NE)
        : Maybe.none
      : filter.type === "join_find"
      ? filter.keys.some(k => {
          const value = get(x, k) as Record<string, unknown>[]
          // we mimic the behavior of cosmosdb; if the shape in db does not match what we're looking for, we imagine false hit
          return (
            value &&
            value.some(v => compareCaseInsensitive(v[filter.valueKey], filter.value))
          )
        })
        ? Maybe(x as unknown as NE)
        : Maybe.none
      : // TODO: support mixed or/and
        filter.mode === "or"
        ? filter.where
            .some(p =>
              p.t === "in"
                ? p.value.includes(get(x, p.key))
                : p.t === "not-in"
                ? !p.value.includes(get(x, p.key))
                : p.t === "not-eq"
                ? !compareCaseInsensitive(get(x, p.key), p.value)
                : compareCaseInsensitive(get(x, p.key), p.value)
            )
          ? Maybe(x as unknown as NE)
          : Maybe.none
        : filter.where
            .every(p =>
              p.t === "in"
                ? p.value.includes(get(x, p.key))
                : p.t === "not-in"
                ? !p.value.includes(get(x, p.key))
                : p.t === "not-eq"
                ? p.key.includes(".-1.")
                  ? (get(x, p.key.split(".-1.")[0]) as any[])
                    // TODO: or vs and
                    .every(_ => !compareCaseInsensitive(get(_, p.key.split(".-1.")[1]!), p.value))
                  : !compareCaseInsensitive(get(x, p.key), p.value)
                : p.key.includes(".-1.")
                ? (get(x, p.key.split(".-1.")[0]) as any[])
                  // TODO: or vs and
                  .some(_ => compareCaseInsensitive(get(_, p.key.split(".-1.")[1]!), p.value))
                : compareCaseInsensitive(get(x, p.key), p.value)
            )
        ? Maybe(x as unknown as NE)
        : Maybe.none
}

export function codeFilterJoinSelect<E extends { id: string }, NE>(
  filter: FilterJoinSelect
) {
  return (x: E) =>
    filter.keys.toChunk.collect(k => {
      const value = get(x, k)
      // we mimic the behavior of cosmosdb; if the shape in db does not match what we're looking for, we imagine false hit
      return value
        ? Maybe(
          (value as readonly NE[]).toChunk.collect(v =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            compareCaseInsensitive((v as any)[filter.valueKey], filter.value)
              ? Maybe({ ...v, _rootId: x.id })
              : Maybe.none
          )
        )
        : Maybe.none
    })
      .flatMap(_ => _)
}

function lowercaseIfString<T>(val: T) {
  if (typeof val === "string") {
    return val.toLowerCase()
  }
  return val
}

function compareCaseInsensitive(valA: unknown, valB: unknown) {
  return typeof valB === "string" && typeof valA === "string"
    ? valA.toLowerCase() === valB.toLowerCase()
    : valA === valB
}
