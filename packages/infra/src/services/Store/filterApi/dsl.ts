import type { FieldValues } from "../../../filter/types.js"
import type { FieldPath, FieldPathValue } from "../../../filter/types/path/eager.js"
import type { Ops } from "./proxy.js"
import type { QueryBuilder } from "./query.js"

export interface Query<TFieldValues extends FieldValues> {
  readonly _id: unique symbol
}
export interface QueryWhere<TFieldValues extends FieldValues> extends Query<TFieldValues> {
  readonly _id2: unique symbol
}

// Impl, later
export type Q<TFieldValues extends FieldValues> = Value<TFieldValues> | Where<TFieldValues>

export class Value<TFieldValues extends FieldValues> extends Data.TaggedClass("value")<{ value: TFieldValues }> {}

export class Where<TFieldValues extends FieldValues> extends Data.TaggedClass("where")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any]
}> implements QueryWhere<TFieldValues> {
  _id2!: any
  _id: any
}

export class And<TFieldValues extends FieldValues> extends Data.TaggedClass("and")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | (() => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  _id2!: any
  _id: any
}

export class Or<TFieldValues extends FieldValues> extends Data.TaggedClass("or")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | (() => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  _id2!: any
  _id: any
}

export const where: FilterWhere = (...operation) => (current) => new Where({ current, operation })

export const and: FilterContinuation = (...operation: any[]) => (current: any) => new And({ current, operation })

export const or: FilterContinuation = (...operation: any[]) => (current: any) => new Or({ current, operation })

// TODO: able to switch to Order and Limit/Take, which are "enders"
export type FilterWheres = {
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    value: V
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "neq",
    value: V
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "gt" | "gte" | "lt" | "lte",
    value: V // only numbers?
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
    value: V // only strings?
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "in" | "notIn",
    value: readonly V[]
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
}

export type FilterWhere = {
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(f: {
    path: TFieldName
    op: Ops
    value: V
  }): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
} & FilterWheres

export type FilterContinuations = {
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    value: V
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "neq",
    value: V
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "gt" | "gte" | "lt" | "lte",
    value: V // only numbers?
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
    value: V // only strings?
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "in" | "notIn",
    value: readonly V[]
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
}

export type FilterContinuation = {
  <TFieldValues extends FieldValues>(
    fb: () => (
      current: Query<TFieldValues>
    ) => QueryWhere<TFieldValues>
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(f: {
    path: TFieldName
    op: Ops
    value: V
  }): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
} & FilterContinuations

export declare const value: <TFieldValues extends FieldValues>() => Query<TFieldValues>

export interface A {
  a: string
  b: number
  c: boolean
}

declare const filter: ReturnType<typeof QueryBuilder.make<A>>
filter((where) =>
  where("a", "in", ["a"])
    .and("b", "gt", 1)
    .or((where) => where("a", "b")) // able to create scope
)

const q = pipe(
  value<A>(),
  where("b", "neq", 1),
  and("b", "gt", 1),
  and("a", "neq", "b"),
  or(() => where("b", 2))
)
