import type { BuiltInObject } from "@effect-ts/core/Utils"

import type { Primitive } from "./Widen.type.js"

// Get rid of Date | string, and replace with Date | null
export type Inputify<T> = Date extends T ? string extends T ? Date | null
: Date | null
  : [T] extends [BuiltInObject] | [Primitive] ? T
  : [T] extends [Array<unknown>] ? { [K in keyof T]: Inputify<T[K]> }
  : [T] extends [ReadonlyArray<unknown>] ? { [K in keyof T]: Inputify<T[K]> }
  : // eslint-disable-next-line @typescript-eslint/ban-types
  [T] extends [object] ? { [K in keyof T]: Inputify<T[K]> }
  : T
