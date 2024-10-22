/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "@effect-app/infra/filter/types"
import type { FieldPath, FieldPathValue } from "@effect-app/infra/filter/types/path/eager"
import type { Ops } from "@effect-app/infra/services/Store/filterApi/query"
import type { Option, Pipeable, S } from "effect-app"
import { Data, flow } from "effect-app"
import type { NonNegativeInt } from "effect-app/Schema"
import type { Covariant } from "effect/Types"

import { pipeArguments } from "effect/Pipeable"

export type QAll<TFieldValues extends FieldValues, A = TFieldValues, R = never, TType extends "one" | "many" = "many"> =
  | Query<TFieldValues>
  | QueryWhere<TFieldValues>
  | QueryEnd<TFieldValues, TType>
  | QueryProjection<TFieldValues, A, R>

export const QId = Symbol()
export type QId = typeof QId

export interface QueryTogether<
  out TFieldValues extends FieldValues,
  out T extends "initial" | "where" | "end" | "projection" = "initial",
  out A = TFieldValues,
  out R = never,
  out TType extends "many" | "one" | "count" = "many"
> extends Pipeable.Pipeable {
  readonly [QId]: {
    readonly _TFieldValues: Covariant<TFieldValues>
    readonly _T: Covariant<T>
    readonly _A: Covariant<A>
    readonly _R: Covariant<R>
    readonly _TT: Covariant<TType>
  }
}

export type Query<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, "initial">
export type QueryWhere<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, "where">

export type QueryEnd<TFieldValues extends FieldValues, TType extends "many" | "one" | "count" = "many"> = QueryTogether<
  TFieldValues,
  "end",
  TFieldValues,
  never,
  TType
>

export type QueryProjection<
  TFieldValues extends FieldValues,
  A = TFieldValues,
  R = never,
  TType extends "many" | "one" | "count" = "many"
> = QueryTogether<
  TFieldValues,
  "projection",
  A,
  R,
  TType
>
export type Q<TFieldValues extends FieldValues> =
  | Initial<TFieldValues>
  | Where<TFieldValues>
  | And<TFieldValues>
  | Or<TFieldValues>
  | Order<TFieldValues, any>
  | Page<TFieldValues>
  | Project<any, TFieldValues, any>
  | One<TFieldValues>
  | Count<TFieldValues>

export class Initial<TFieldValues extends FieldValues> extends Data.TaggedClass("value")<{ value: "initial" }>
  implements Query<TFieldValues>
{
  readonly [QId]!: any
  constructor() {
    super({ value: "initial" as const })
  }
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Where<TFieldValues extends FieldValues> extends Data.TaggedClass("where")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any

  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class And<TFieldValues extends FieldValues> extends Data.TaggedClass("and")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Or<TFieldValues extends FieldValues> extends Data.TaggedClass("or")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Page<TFieldValues extends FieldValues> extends Data.TaggedClass("page")<{
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
  take?: number | undefined
  skip?: number | undefined
}> implements QueryEnd<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class One<TFieldValues extends FieldValues> extends Data.TaggedClass("one")<{
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
}> implements QueryEnd<TFieldValues, "one"> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Count<TFieldValues extends FieldValues> extends Data.TaggedClass("count")<{
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
}> implements QueryEnd<TFieldValues, "count"> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Order<TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>
  extends Data.TaggedClass("order")<{
    current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
    field: TFieldName
    direction: "ASC" | "DESC"
  }>
  implements QueryEnd<TFieldValues>
{
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export class Project<A, TFieldValues extends FieldValues, R, TType extends "one" | "many" = "many">
  extends Data.TaggedClass("project")<{
    current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues, TType>
    schema: S.Schema<A, TFieldValues, R>
    mode: "collect" | "project" | "transform"
  }>
  implements QueryProjection<TFieldValues, A, R>
{
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return pipeArguments(this, arguments)
  }
}

export const make: <TFieldValues extends FieldValues>() => Query<TFieldValues> = () => new Initial()

export const where: FilterWhere = (...operation: any[]) => (current: any) =>
  new Where({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const and: FilterContinuation = (...operation: any[]) => (current: any) =>
  new And({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const or: FilterContinuation = (...operation: any[]) => (current: any) =>
  new Or({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const order: <TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>(
  field: TFieldName,
  direction?: "ASC" | "DESC"
) => (current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>) => QueryEnd<TFieldValues> =
  (field, direction = "ASC") => (current) => new Order({ current, field, direction })

export const page: <TFieldValues extends FieldValues>(
  page: { skip?: number; take?: number }
) => (current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>) => QueryEnd<TFieldValues> =
  ({ skip, take }) => (current) =>
    new Page({
      current,
      take,
      skip
    })

export const one: <TFieldValues extends FieldValues>(
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
) => QueryEnd<TFieldValues, "one"> = (current) =>
  new One({
    current
  })

// TODO: implement count like one instead? or should we change schema projection to work with arrays, so we can count the elements?
// no it's better to implement a distinct count so that the implementation can be optimised per adapter.
export const count: <
  TFieldValues extends FieldValues
>(
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues, "many">
) => QueryProjection<TFieldValues, NonNegativeInt, never, "count"> = (current) =>
  // new Project({ current: current as any, /* TODO: why */ schema: S.Struct({ id: S.unknown }) })
  new Count({ current })

/*
.andThen(flow(
        toNonEmptyArray,
        Effect.mapError(() => new NotFoundError<"User">({ id: auth0Id, type: "User" })),
        Effect.map((_) => _[0])
      ))
*/

export const project: {
  <
    TFieldValues extends FieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<Option<A>, TFieldValues, R>,
    mode: "collect"
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValues, A, R, TType>
  <
    TFieldValues extends FieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<A, TFieldValues, R>,
    mode: "project"
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValues, A, R, TType>
  <
    TFieldValues extends FieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<A, TFieldValues, R>
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValues, A, R, TType>
} = (schema: any, mode = "transform") => (current: any) => new Project({ current, /* TODO: why */ schema, mode } as any)

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
    V extends string
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
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
    op:
      | "in"
      | "notIn",
    value: readonly V[]
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op:
      | "includes"
      | "notIncludes",
    value: GetArV<V>
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op:
      | "includes-any"
      | "notIncludes-any"
      | "includes-all"
      | "notIncludes-all",
    value: readonly GetArV<V>[]
  ): (
    current: Query<TFieldValues>
  ) => QueryWhere<TFieldValues>
}

export type FilterWhere =
  & {
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>

    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>

    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>

    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>

    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      ff: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fm: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
    <TFieldValues extends FieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
      fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fm: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
      fn: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
  }
  & {
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
  }
  & FilterWheres
  & {
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
    // breaks flow pipe type inference
    // <
    //   TFieldValues extends FieldValues,
    //   TFieldName extends FieldPath<TFieldValues>,
    //   V extends FieldPathValue<TFieldValues, TFieldName>
    // >(
    //   path: TFieldName,
    //   op: "neq",
    //   value: V
    // ): (
    //   current: Query<TFieldValues>
    // ) => QueryWhere<TFieldValues>
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      V extends FieldPathValue<TFieldValues, TFieldName>
    >(
      path: TFieldName,
      op: "gt" | "gte" | "lt" | "lte" | "neq",
      value: V // only numbers?
    ): (
      current: Query<TFieldValues>
    ) => QueryWhere<TFieldValues>
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      V extends string
    >(
      path: TFieldName,
      op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
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
      op:
        | "in"
        | "notIn",
      value: readonly V[]
    ): (
      current: Query<TFieldValues>
    ) => QueryWhere<TFieldValues>
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      V extends FieldPathValue<TFieldValues, TFieldName>
    >(
      path: TFieldName,
      op:
        | "includes"
        | "notIncludes",
      value: GetArV<V>
    ): (
      current: Query<TFieldValues>
    ) => QueryWhere<TFieldValues>
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      V extends FieldPathValue<TFieldValues, TFieldName>
    >(
      path: TFieldName,
      op:
        | "includes-any"
        | "notIncludes-any"
        | "includes-all"
        | "notIncludes-all",
      value: readonly GetArV<V>[]
    ): (
      current: Query<TFieldValues>
    ) => QueryWhere<TFieldValues>
  }

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
  // breaks flow pipe type inference
  // <
  //   TFieldValues extends FieldValues,
  //   TFieldName extends FieldPath<TFieldValues>,
  //   V extends FieldPathValue<TFieldValues, TFieldName>
  // >(
  //   path: TFieldName,
  //   op: "neq",
  //   value: V
  // ): (
  //   current: QueryWhere<TFieldValues>
  // ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op: "gt" | "gte" | "lt" | "lte" | "neq",
    value: V // only numbers?
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends string
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
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
    op:
      | "in"
      | "notIn",
    value: readonly V[]
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op:
      | "includes"
      | "notIncludes",
    value: GetArV<V>
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>
  >(
    path: TFieldName,
    op:
      | "includes-any"
      | "notIncludes-any"
      | "includes-all"
      | "notIncludes-all",
    value: readonly GetArV<V>[]
  ): (
    current: QueryWhere<TFieldValues>
  ) => QueryWhere<TFieldValues>
}

type GetArV<T> = T extends readonly (infer R)[] ? R : never

export type FilterContinuationClosure = {
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>

  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>

  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>

  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>

  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    ff: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fm: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  <TFieldValues extends FieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues>,
    fc: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fd: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fe: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fg: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fh: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fi: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fj: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fk: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fl: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fm: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>,
    fn: (query: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
  ): (current: QueryWhere<TFieldValues>) => QueryWhere<TFieldValues>
}

export type FilterContinuation =
  & FilterContinuationClosure
  & {
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
  }
  & FilterContinuations
