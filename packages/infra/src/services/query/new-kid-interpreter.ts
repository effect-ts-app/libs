/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toNonEmptyArray } from "@effect-app/core/Array"
import { Effect, Match, Option, pipe, S, Unify } from "effect-app"
import type { NoInfer } from "effect/Types"
import type { FieldValues } from "../../filter/types.js"
import type { FieldPath } from "../../filter/types/path/eager.js"
import { make, type Q, type QAll, type QueryProjection } from "../query.js"
import type { Repository } from "../Repository.js"
import type { PersistenceModelType } from "../Store.js"
import type { FilterResult, QueryBuilder } from "../Store/filterApi/query.js"

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
  return Effect.flatMap(
    repo.utils.filter({
      limit: a.limit,
      skip: a.skip,
      select: Option.getOrUndefined(toNonEmptyArray(select)),
      filter: a.filter.length
        ? {
          type: "new-kid" as const,
          build: () => a.filter
        } as QueryBuilder<any>
        : undefined
    }),
    (_) =>
      Unify.unify(
        schema
          ? repo.utils.parseMany2(_, schema as any)
          : repo.utils.parseMany(_)
      )
  )
}) as any
