/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "@effect-app/infra/filter/types"
import type { FieldPath, FieldPathValue } from "@effect-app/infra/filter/types/path/eager"
import type { Ops } from "@effect-app/infra/services/Store/filterApi/query"
import type { Option, S } from "effect-app"
import { Data, flow, Pipeable } from "effect-app"
import type { NonNegativeInt } from "effect-app/Schema"
import type { Covariant } from "effect/Types"

export type QAll<
  TFieldValues extends FieldValues,
  TFieldValuesRefined extends TFieldValues = TFieldValues,
  A = TFieldValues,
  R = never,
  TType extends "one" | "many" = "many"
> =
  | Query<TFieldValues>
  | QueryWhere<TFieldValues, TFieldValuesRefined>
  | QueryEnd<TFieldValues, TType>
  | QueryProjection<TFieldValues, A, R>

export const QId = Symbol()
export type QId = typeof QId

export interface QueryTogether<
  out TFieldValues extends FieldValues,
  out TFieldValuesRefined extends TFieldValues = TFieldValues,
  out T extends "initial" | "where" | "end" | "projection" = "initial",
  out A = TFieldValues,
  out R = never,
  out TType extends "many" | "one" | "count" = "many"
> extends Pipeable.Pipeable {
  readonly [QId]: {
    readonly _TFieldValues: Covariant<TFieldValues>
    readonly _T: Covariant<T>
    readonly _TFieldValuesRefined: Covariant<TFieldValuesRefined>
    readonly _A: Covariant<A>
    readonly _R: Covariant<R>
    readonly _TT: Covariant<TType>
  }
}

export type Query<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, TFieldValues, "initial">
export type QueryWhere<TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues> =
  QueryTogether<
    TFieldValues,
    TFieldValuesRefined,
    "where"
  >

export type QueryEnd<TFieldValues extends FieldValues, TType extends "many" | "one" | "count" = "many"> = QueryTogether<
  TFieldValues,
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
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Where<TFieldValues extends FieldValues> extends Data.TaggedClass("where")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any

  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class And<TFieldValues extends FieldValues> extends Data.TaggedClass("and")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Or<TFieldValues extends FieldValues> extends Data.TaggedClass("or")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Page<TFieldValues extends FieldValues> extends Data.TaggedClass("page")<{
  current: Query<TFieldValues> | QueryWhere<any, TFieldValues> | QueryEnd<TFieldValues>
  take?: number | undefined
  skip?: number | undefined
}> implements QueryEnd<TFieldValues> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class One<TFieldValues extends FieldValues> extends Data.TaggedClass("one")<{
  current: Query<TFieldValues> | QueryWhere<any, TFieldValues> | QueryEnd<TFieldValues>
}> implements QueryEnd<TFieldValues, "one"> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Count<TFieldValues extends FieldValues> extends Data.TaggedClass("count")<{
  current: Query<TFieldValues> | QueryWhere<any, TFieldValues> | QueryEnd<TFieldValues>
}> implements QueryEnd<TFieldValues, "count"> {
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Order<TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>
  extends Data.TaggedClass("order")<{
    current: Query<TFieldValues> | QueryWhere<any, TFieldValues> | QueryEnd<TFieldValues>
    field: TFieldName
    direction: "ASC" | "DESC"
  }>
  implements QueryEnd<TFieldValues>
{
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

export class Project<A, TFieldValues extends FieldValues, R, TType extends "one" | "many" = "many">
  extends Data.TaggedClass("project")<{
    current: Query<TFieldValues> | QueryWhere<any, TFieldValues> | QueryEnd<TFieldValues, TType>
    schema: S.Schema<A, TFieldValues, R>
    mode: "collect" | "project" | "transform"
  }>
  implements QueryProjection<TFieldValues, A, R>
{
  readonly [QId]!: any
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

type ExtractFieldValues<T> = T extends QueryTogether<infer TFieldValues, any, any, any, any, any> ? TFieldValues : never
type ExtractFieldValuesRefined<T> = T extends QueryTogether<any, infer TFieldValuesRefined, any, any, any, any>
  ? TFieldValuesRefined
  : never

export const make: <TFieldValues extends FieldValues>() => Query<TFieldValues> = () => new Initial()

export const where: FilterWhere = (...operation: any[]) => (current: any) =>
  new Where({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const and: FilterContinuationAnd = (...operation: any[]) => (current: any) =>
  new And({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const or: FilterContinuation = (...operation: any[]) => (current: any) =>
  new Or({ current, operation: typeof operation[0] === "function" ? flow(...operation as [any]) : operation } as any)

export const order: {
  <
    Q extends Query<any> | QueryWhere<any, any> | QueryEnd<any>
  >(
    field: FieldPath<ExtractFieldValuesRefined<Q>>,
    direction?: "ASC" | "DESC"
  ): (
    current: Q
  ) => QueryEnd<ExtractFieldValuesRefined<Q>>
} = (field, direction = "ASC") => (current) => new Order({ current, field: field as any, direction })

export const page: {
  (
    page: { skip?: number; take?: number }
  ): <Q extends Query<any> | QueryWhere<any, any> | QueryEnd<any>>(
    current: Q
  ) => QueryEnd<ExtractFieldValuesRefined<Q>>
} = ({ skip, take }) => (current) =>
  new Page({
    current,
    take,
    skip
  })

export const one: {
  <Q extends Query<any> | QueryWhere<any, any> | QueryEnd<any>>(
    current: Q
  ): QueryEnd<ExtractFieldValuesRefined<Q>, "one">
} = (current) =>
  new One({
    current
  })

// TODO: implement count like one instead? or should we change schema projection to work with arrays, so we can count the elements?
// no it's better to implement a distinct count so that the implementation can be optimised per adapter.
export const count: {
  <
    Q extends Query<any> | QueryWhere<any, any> | QueryEnd<any>
  >(
    current: Q
  ): QueryProjection<ExtractFieldValuesRefined<Q>, NonNegativeInt, never, "count">
} = (current) =>
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
    TFieldValuesRefined extends TFieldValues = TFieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<Option<A>, TFieldValues, R>,
    mode: "collect"
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues, TFieldValuesRefined> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValuesRefined, A, R, TType>

  <
    TFieldValues extends FieldValues,
    TFieldValuesRefined extends TFieldValues = TFieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<A, TFieldValues, R>,
    mode: "project"
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues, TFieldValuesRefined> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValuesRefined, A, R, TType>
  <
    TFieldValues extends FieldValues,
    TFieldValuesRefined extends TFieldValues = TFieldValues,
    A = FieldValues,
    R = never,
    TType extends "one" | "many" = "many"
  >(
    schema: S.Schema<A, TFieldValues, R>
  ): (
    current: Query<TFieldValues> | QueryWhere<TFieldValues, TFieldValuesRefined> | QueryEnd<TFieldValues, TType>
  ) => QueryProjection<TFieldValuesRefined, A, R, TType>
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
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>

    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>

    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>

    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>

    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      ff: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fm: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
      fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fm: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
      fn: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
    ): (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
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
    V extends FieldPathValue<TFieldValues, TFieldName>,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    value: V
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
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
    V extends FieldPathValue<TFieldValues, TFieldName>,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    op: "gt" | "gte" | "lt" | "lte" | "neq",
    value: V // only numbers?
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends string,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    op: "startsWith" | "endsWith" | "contains" | "notContains" | "notStartsWith" | "notEndsWith",
    value: V
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    op:
      | "in"
      | "notIn",
    value: readonly V[]
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    op:
      | "includes"
      | "notIncludes",
    value: GetArV<V>
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <
    TFieldValues extends FieldValues,
    TFieldName extends FieldPath<TFieldValues>,
    V extends FieldPathValue<TFieldValues, TFieldName>,
    TFieldValuesRefined extends TFieldValues = TFieldValues
  >(
    path: TFieldName,
    op:
      | "includes-any"
      | "notIncludes-any"
      | "includes-all"
      | "notIncludes-all",
    value: readonly GetArV<V>[]
  ): (
    current: QueryWhere<TFieldValues, TFieldValuesRefined>
  ) => QueryWhere<TFieldValues, TFieldValuesRefined>
}

type GetArV<T> = T extends readonly (infer R)[] ? R : never

export type FilterContinuationClosure = {
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>

  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>

  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>

  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>

  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    ff: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fm: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  <TFieldValues extends FieldValues, TFieldValuesRefined extends TFieldValues = TFieldValues>(
    fb: (current: Query<TFieldValues>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fc: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fd: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fe: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fg: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fh: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fi: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fj: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fk: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fl: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fm: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>,
    fn: (query: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
  ): (current: QueryWhere<TFieldValues, TFieldValuesRefined>) => QueryWhere<TFieldValues, TFieldValuesRefined>
}

export type FilterContinuation =
  & FilterContinuationClosure
  & {
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      V extends FieldPathValue<TFieldValues, TFieldName>,
      TFieldValuesRefined extends TFieldValues = TFieldValues
    >(f: {
      path: TFieldName
      op: Ops
      value: V
    }): (
      current: QueryWhere<TFieldValues, TFieldValuesRefined>
    ) => QueryWhere<TFieldValues, TFieldValuesRefined>
  }
  & FilterContinuations

export type FilterContinuationAnd =
  & {
    <
      TFieldValues extends FieldValues,
      TFieldName extends FieldPath<TFieldValues>,
      const V extends FieldPathValue<TFieldValues, TFieldName>
    >(
      path: TFieldName,
      value: V
    ): (
      current: QueryWhere<TFieldValues>
    ) => QueryWhere<TFieldValues, TFieldName extends "_tag" ? Extract<TFieldValues, { _tag: V }> : TFieldValues>
  }
  & FilterContinuation
