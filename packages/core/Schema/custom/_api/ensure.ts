import type { Schema } from "../_schema"

export function ensureShape<A>() {
  return <Self extends Schema<any, A, any, any, any>>(self: Self) => self
}
