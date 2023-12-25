import type { Data } from "effect"
import type { Simplify } from "effect/Types"
import type { ToStruct, ToStructConstructor } from "./index.js"
import { S } from "./schema.js"

export const ExtendedClass: <SelfFrom, Self>() => <Fields extends S.StructFields>(fields: Fields) => S.Class<
  SelfFrom,
  Simplify<ToStruct<Fields>>,
  Simplify<ToStructConstructor<Fields>>,
  Self,
  Data.Case
> = S.Class as any

export const ExtendedTaggedClass: <SelfFrom, Self>() => <Tag extends string, Fields extends S.StructFields>(
  tag: Tag,
  fields: Fields
) => S.Class<
  SelfFrom,
  Simplify<ToStruct<Fields>>,
  Simplify<ToStructConstructor<Fields>>,
  Self,
  Data.Case
> = S.TaggedClass as any
