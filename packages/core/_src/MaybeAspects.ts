import * as O from "./MaybeBase.js"

export * from "@effect-ts/core/Option"

export function omitableToNullable<T>(om: O.Maybe<T> | undefined) {
  return om ?? O.fromNullable(om)
}

export const toBool = O.fold(
  () => false,
  () => true
)
