import * as O from "@effect-ts/core/Option"

export * from "@effect-ts/core/Option"

export function omitableToNullable<T>(om: O.Option<T> | undefined) {
  return om ?? O.fromNullable(om)
}

export const toBool = O.fold(
  () => false,
  () => true
)
