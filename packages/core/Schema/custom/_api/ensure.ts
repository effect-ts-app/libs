import type { Schema } from "../_schema"

export function ensureShape<A>() {
  return <Self extends Schema<any, any, A, any, any, any, any>>(self: Self) => self
}
