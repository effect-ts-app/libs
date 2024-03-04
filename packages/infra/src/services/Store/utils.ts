import { Effect, Option } from "effect-app"
import { get } from "effect-app/utils"
import objectHash from "object-hash"
import { OptimisticConcurrencyException } from "../../errors.js"
import { codeFilter3_ } from "./codeFilter.js"
import type { Filter, PersistenceModelType, SupportedValues2 } from "./service.js"

export const makeETag = <E extends PersistenceModelType<Id>, Id extends string>(
  { _etag, ...e }: E
): E => (({
  ...e,
  _etag: objectHash(e)
}) as any)
export const makeUpdateETag =
  (type: string) => <E extends PersistenceModelType<Id>, Id extends string>(e: E, current: Option<E>) =>
    Effect.gen(function*($) {
      if (e._etag) {
        yield* $(
          Effect.mapError(
            current,
            () => new OptimisticConcurrencyException({ type, id: e.id, current: "", found: e._etag })
          )
        )
      }
      if (Option.isSome(current) && current.value._etag !== e._etag) {
        return yield* $(
          new OptimisticConcurrencyException({
            type,
            id: current.value.id,
            current: current.value._etag,
            found: e._etag
          })
        )
      }
      const newE = makeETag(e)
      return newE
    })

export function codeFilter<E extends { id: string }, NE extends E>(filter: Filter<NE>) {
  return (x: E) =>
    filter.type === "new-kid"
      ? codeFilter3_(filter.build(), x) ? Option.some(x as unknown as NE) : Option.none()
      : filter.mode === "or"
      ? filter
          .where
          .some((p) => {
            const k = get(x, p.key)
            switch (p.t) {
              case "in":
                return p.value.includes(k)
              case "not-in":
                return !p.value.includes(k)
              case "lt":
                return lowerThan(k, p.value)
              case "lte":
                return lowerThanExclusive(k, p.value)
              case "gt":
                return greaterThan(k, p.value)
              case "gte":
                return greaterThanExclusive(k, p.value)
              case "includes":
                return (k as Array<string>).includes(p.value)
              case "not-includes":
                return !(k as Array<string>).includes(p.value)
              case "contains":
                return (k as string).toLowerCase().includes(p.value.toLowerCase())
              case "ends-with":
                return (k as string).toLowerCase().endsWith(p.value.toLowerCase())
              case "starts-with":
                return (k as string).toLowerCase().startsWith(p.value.toLowerCase())
              case "not-contains":
                return !(k as string).toLowerCase().includes(p.value.toLowerCase())
              case "not-ends-with":
                return !(k as string).toLowerCase().endsWith(p.value.toLowerCase())
              case "not-starts-with":
                return !(k as string).toLowerCase().startsWith(p.value.toLowerCase())
              case "not-eq":
                return !compare(k, p.value)
              case "eq":
              case undefined:
                return compare(k, p.value)
            }
          })
        ? Option.some(x as unknown as NE)
        : Option.none()
      : filter
          .where
          .every((p) => {
            const k = get(x, p.key)
            switch (p.t) {
              case "in":
                return p.value.includes(k)
              case "not-in":
                return !p.value.includes(k)
              case "lt":
                return lowerThan(k, p.value)
              case "lte":
                return lowerThanExclusive(k, p.value)
              case "gt":
                return greaterThan(k, p.value)
              case "gte":
                return greaterThanExclusive(k, p.value)
              case "includes":
                return (k as Array<string>).includes(p.value)
              case "not-includes":
                return !(k as Array<string>).includes(p.value)
              case "contains":
                return (k as string).toLowerCase().includes(p.value.toLowerCase())
              case "ends-with":
                return (k as string).toLowerCase().endsWith(p.value.toLowerCase())
              case "starts-with":
                return (k as string).toLowerCase().startsWith(p.value.toLowerCase())
              case "not-contains":
                return !(k as string).toLowerCase().includes(p.value.toLowerCase())
              case "not-ends-with":
                return !(k as string).toLowerCase().endsWith(p.value.toLowerCase())
              case "not-starts-with":
                return !(k as string).toLowerCase().startsWith(p.value.toLowerCase())
              case "not-eq":
                return p.key.includes(".-1.")
                  ? (get(x, p.key.split(".-1.")[0]) as any[])
                    // TODO: or vs and
                    .every((_) => !compare(get(_, p.key.split(".-1.")[1]!), p.value))
                  : !compare(k, p.value)
              case "eq":
              case undefined:
                return p.key.includes(".-1.")
                  ? (get(x, p.key.split(".-1.")[0]) as any[])
                    // TODO: or vs and
                    .some((_) => compare(get(_, p.key.split(".-1.")[1]!), p.value))
                  : compare(k, p.value)
            }
          })
      ? Option.some(x as unknown as NE)
      : Option.none()
}

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
