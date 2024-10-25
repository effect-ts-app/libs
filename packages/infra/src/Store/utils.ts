import { Effect, Option } from "effect-app"
import objectHash from "object-hash"
import { OptimisticConcurrencyException } from "../errors.js"
import type { PersistenceModelType, SupportedValues2 } from "./service.js"

export const makeETag = <E extends PersistenceModelType<{}>>(
  { _etag, ...e }: E
): E => (({
  ...e,
  _etag: objectHash(e)
}) as any)
export const makeUpdateETag =
  (type: string) => <E extends PersistenceModelType<{ id: string }>>(e: E, current: Option<E>) =>
    Effect.gen(function*() {
      if (e._etag) {
        yield* Effect.mapError(
          current,
          () => new OptimisticConcurrencyException({ type, id: e.id, current: "", found: e._etag })
        )
      }
      if (Option.isSome(current) && current.value._etag !== e._etag) {
        return yield* new OptimisticConcurrencyException({
          type,
          id: current.value.id,
          current: current.value._etag,
          found: e._etag
        })
      }
      const newE = makeETag(e)
      return newE
    })

export function lowercaseIfString<T>(val: T) {
  if (typeof val === "string") {
    return val.toLowerCase()
  }
  return val
}

export function compare(valA: unknown, valB: unknown) {
  return valA === valB
}

export function lowerThan(valA: SupportedValues2, valB: SupportedValues2) {
  return valA < valB
}

export function lowerThanExclusive(valA: SupportedValues2, valB: SupportedValues2) {
  return valA <= valB
}

export function greaterThan(valA: SupportedValues2, valB: SupportedValues2) {
  return valA > valB
}

export function greaterThanExclusive(valA: SupportedValues2, valB: SupportedValues2) {
  return valA >= valB
}
