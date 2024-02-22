import type { FieldValues } from "../../../filter/types.js"
import type { QueryBuilder } from "./query.js"

export interface Query<TFieldValues extends FieldValues> {
  readonly _id: unique symbol
}
export interface QueryWhere<TFieldValues extends FieldValues> extends Query<TFieldValues> {
  readonly _id2: unique symbol
}

// export type All<TFieldValues extends FieldValues> = Value<TFieldValues> | Where<TFieldValues>

// export class Value<TFieldValues extends FieldValues> extends Data.TaggedClass("value")<{ value: TFieldValues }> {}

// export class Where<TFieldValues extends FieldValues> extends Data.TaggedClass("where")<{}> {}

export declare const where: <TFieldValues extends FieldValues>() => (
  current: Query<TFieldValues>
) => QueryWhere<TFieldValues>

export declare const and: <TFieldValues extends FieldValues>() => (
  current: Query<TFieldValues>
) => QueryWhere<TFieldValues>

export declare const or: <TFieldValues extends FieldValues>() => (
  current: Query<TFieldValues>
) => QueryWhere<TFieldValues>

export declare const value: <TFieldValues extends FieldValues>() => Query<TFieldValues>

export interface A {
  a: string
  b: number
  c: boolean
}

declare const filter: ReturnType<typeof QueryBuilder.make<A>>
filter((where) => where())

const p = pipe(
  value<A>(),
  where()
)
