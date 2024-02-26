/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toNonEmptyArray } from "@effect-app/core/Array"
import type { FieldValues } from "@effect-app/infra/filter/types"
import type { FieldPath, FieldPathValue } from "@effect-app/infra/filter/types/path/eager"
import type { Repository } from "@effect-app/infra/services/Repository"
import type { PersistenceModelType } from "@effect-app/infra/services/Store"
import type { Ops } from "@effect-app/infra/services/Store/filterApi/proxy"
import type { FilterResult, QueryBuilder } from "@effect-app/infra/services/Store/filterApi/query"
import { Data, Effect, Match, Option, pipe, S, Unify } from "effect-app"
import type { Covariant, NoInfer } from "effect/Types"

export type QAll<TFieldValues extends FieldValues, A = TFieldValues, R = never> =
  | Query<TFieldValues>
  | QueryWhere<TFieldValues>
  | QueryEnd<TFieldValues>
  | QueryProjection<TFieldValues, A, R>

export const QId = Symbol()
export type QId = typeof QId

export interface QueryTogether<
  out TFieldValues extends FieldValues,
  out T extends "initial" | "where" | "end" | "projection" = "initial",
  out A = TFieldValues,
  out R = never
> {
  readonly [QId]: {
    readonly _TFieldValues: Covariant<TFieldValues>
    readonly _T: Covariant<T>
    readonly _A: Covariant<A>
    readonly _R: Covariant<R>
  }
}

export type Query<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, "initial">
export type QueryWhere<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, "where">

export type QueryEnd<TFieldValues extends FieldValues> = QueryTogether<TFieldValues, "end">

export type QueryProjection<TFieldValues extends FieldValues, A = TFieldValues, R = never> = QueryTogether<
  TFieldValues,
  "projection",
  A,
  R
>

export type Q<TFieldValues extends FieldValues> =
  | Initial<TFieldValues>
  | Where<TFieldValues>
  | And<TFieldValues>
  | Or<TFieldValues>
  | Order<TFieldValues, any>
  | Page<TFieldValues>
  | Project<any, TFieldValues, any>

export class Initial<TFieldValues extends FieldValues> extends Data.TaggedClass("value")<{ value: "initial" }>
  implements Query<TFieldValues>
{
  readonly [QId]!: any
  constructor() {
    super({ value: "initial" as const })
  }
}

export class Where<TFieldValues extends FieldValues> extends Data.TaggedClass("where")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any]
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
}

export class And<TFieldValues extends FieldValues> extends Data.TaggedClass("and")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
}

export class Or<TFieldValues extends FieldValues> extends Data.TaggedClass("or")<{
  current: Query<TFieldValues>
  operation: [string, Ops, any] | [string, any] | ((q: Query<TFieldValues>) => QueryWhere<TFieldValues>)
}> implements QueryWhere<TFieldValues> {
  readonly [QId]!: any
}

export class Page<TFieldValues extends FieldValues> extends Data.TaggedClass("page")<{
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
  limit?: number | undefined
  skip?: number | undefined
}> implements QueryEnd<TFieldValues> {
  readonly [QId]!: any
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
}

export class Project<A, TFieldValues extends FieldValues, R> extends Data.TaggedClass("project")<{
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
  schema: S.Schema<A, TFieldValues, R>
}> implements QueryProjection<TFieldValues, A, R> {
  readonly [QId]!: any
}

export const where: FilterWhere = (...operation: any[]) => (current: any) => new Where({ current, operation } as any)

export const and: FilterContinuation = (...operation: any[]) => (current: any) =>
  new And({ current, operation: typeof operation[0] === "function" ? operation[0] : operation } as any)

export const or: FilterContinuation = (...operation: any[]) => (current: any) =>
  new Or({ current, operation: typeof operation[0] === "function" ? operation[0] : operation } as any)

export const order: <TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>(
  field: TFieldName,
  desc?: boolean
) => (current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>) => QueryEnd<TFieldValues> =
  (field, desc) => (current) => new Order({ current, field, direction: desc ? "DESC" : "ASC" })

export const page: <TFieldValues extends FieldValues>(
  page: { limit?: number; skip?: number }
) => (current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>) => QueryEnd<TFieldValues> =
  ({ limit, skip }) => (current) =>
    new Page({
      current,
      limit,
      skip
    })

export const project: <TFieldValues extends FieldValues, A = FieldValues, R = never>(
  schema: S.Schema<A, TFieldValues, R>
) => (
  current: Query<TFieldValues> | QueryWhere<TFieldValues> | QueryEnd<TFieldValues>
) => QueryProjection<TFieldValues, A, R> = (schema) => (current) => new Project({ current, schema })

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
    fb: (
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

export const make: <TFieldValues extends FieldValues>() => Query<TFieldValues> = () => new Initial()
export interface A {
  a: string
  b: number
  c: boolean
}

const interpret = <TFieldValues extends FieldValues, A = TFieldValues, R = never>(_: QAll<TFieldValues, A, R>) => {
  const values: FilterResult[] = []
  const a = _ as Q<TFieldValues>

  let schema: S.Schema<A, TFieldValues, R> | undefined = undefined as any
  let limit: number | undefined = undefined as any
  let skip: number | undefined = undefined as any
  const order: { field: FieldPath<TFieldValues>; direction: "ASC" | "DESC" }[] = []

  const upd = (v: { schema: any; limit: any; skip: any; filter: readonly FilterResult[]; order: any[] }) => {
    values.push(...v.filter)
    order.push(...v.order)
    limit = v.limit
    skip = v.skip
    schema = v.schema
  }

  pipe(
    a,
    Match.valueTags({
      value: () => {
        // values.push(value)
      },
      where: ({ current, operation }) => {
        upd(interpret(current))
        values.push(
          {
            t: "where",
            path: operation[0],
            op: operation.length === 2 ? "eq" : operation[1],
            value: operation.length === 2 ? operation[1] : operation[2]
          }
        )
      },
      and: ({ current, operation }) => {
        upd(interpret(current))
        if (typeof operation === "function") {
          values.push(
            { t: "and-scope", result: interpret(operation(make())).filter }
          )
        } else {
          values.push(
            {
              t: "and",
              path: operation[0],
              op: operation.length === 2 ? "eq" : operation[1],
              value: operation.length === 2 ? operation[1] : operation[2]
            }
          )
        }
      },
      or: ({ current, operation }) => {
        upd(interpret(current))
        if (typeof operation === "function") {
          values.push(
            { t: "or-scope", result: interpret(operation(make())).filter }
          )
        } else {
          values.push(
            {
              t: "or",
              path: operation[0],
              op: operation.length === 2 ? "eq" : operation[1],
              value: operation.length === 2 ? operation[1] : operation[2]
            }
          )
        }
      },
      order: ({ current }) => {
        upd(interpret(current))
      },
      page: (v) => {
        upd(interpret(v.current))
        limit = v.limit
        skip = v.skip
      },
      project: (v) => {
        upd(interpret(v.current))
        schema = v.schema
      }
    })
  )

  return {
    filter: values,
    limit,
    skip,
    schema,
    order
  }
}

export const query: {
  <
    T extends { id: unknown },
    PM extends PersistenceModelType<string>,
    Evt,
    ItemType extends string,
    A,
    R,
    From extends FieldValues
  >(
    repo: Repository<T, PM, Evt, ItemType>,
    q: QueryProjection<PM extends From ? From : never, A, R>
  ): Effect.Effect<readonly A[], S.ParseResult.ParseError, R>
  <
    T extends { id: unknown },
    PM extends PersistenceModelType<string>,
    Evt,
    ItemType extends string,
    A,
    R
  >(
    repo: Repository<T, PM, Evt, ItemType>,
    q: QAll<NoInfer<PM>, A, R>
  ): Effect.Effect<readonly T[], never, R>
} = (<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string,
  A,
  R
>(repo: Repository<T, PM, Evt, ItemType>, q: QAll<PM, A, R>) => {
  // TODO: Native interpreter for each db adapter, instead of the intermediate "new-kid" format
  const a = interpret(q)
  const schema = a.schema
  let select: (keyof PM)[] = []
  if (schema) {
    let t = schema.ast
    if (S.AST.isTransform(t)) {
      t = t.from
    }
    if (S.AST.isTypeLiteral(t)) {
      select = t.propertySignatures.map((_) => _.name) as any
    }
  }
  return pipe(
    a.filter.length === 0
      ? repo.utils.all
      : repo.utils.filter({
        limit: a.limit,
        skip: a.skip,
        select: Option.getOrUndefined(toNonEmptyArray(select)),
        filter: a.filter.length
          ? {
            type: "new-kid" as const,
            build: () => a.filter
          } as any as QueryBuilder<any>
          : undefined
      }),
    Effect.flatMap((_) =>
      Unify.unify(
        schema
          ? repo.utils.parseMany2(_, schema as any)
          : repo.utils.parseMany(_)
      )
    )
  )
}) as any
