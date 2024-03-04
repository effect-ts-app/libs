import { Effect, Equivalence, pipe, ReadonlyArray } from "effect-app"
import type { NonEmptyReadonlyArray } from "effect-app"
import { assertUnreachable } from "effect-app/utils"
import type { FilterR, FilterResult } from "../filterApi/query.js"
import type { StoreWhereFilter, SupportedValues } from "../service.js"

export function logQuery(q: {
  query: string
  parameters: {
    name: string
    value: SupportedValues | readonly SupportedValues[]
  }[]
}) {
  return Effect
    .logDebug("cosmos query")
    .pipe(Effect.annotateLogs({
      query: q.query,
      parameters: JSON.stringify(
        q.parameters.reduce((acc, v) => {
          acc[v.name] = v.value
          return acc
        }, {} as Record<string, SupportedValues | readonly SupportedValues[]>),
        undefined,
        2
      )
    }))
}

export function buildWhereCosmosQuery(
  filter: StoreWhereFilter,
  name: string,
  importedMarkerId: string,
  defaultValues: Record<string, unknown>,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""

  return {
    query: `
    SELECT f
    FROM ${name} f
    ${
      pipe(
        filter
          .where
          .filter((_) => _.key.includes(".-1."))
          .map((_) => _.key.split(".-1.")[0])
          .map((_) => `JOIN ${_} IN f.${_}`),
        ReadonlyArray.dedupeWith(Equivalence.string)
      )
        .join("\n")
    }
    WHERE f.id != @id AND ${
      filter
        .where
        .map((_) =>
          _.key.includes(".-1.")
            ? { ..._, f: _.key.split(".-1.")[0], key: _.key.split(".-1.")[1]! }
            : { ..._, f: "f" }
        )
        .map(
          (x, i) => {
            let k = `${x.f}.${x.key}`
            k = x.key in defaultValues ? `(${k} ?? ${JSON.stringify(defaultValues[x.key])})` : k
            const v = `@v${i}`

            switch (x.t) {
              case "in":
                return `ARRAY_CONTAINS(${v}, ${k})`
              case "not-in":
                return `(NOT ARRAY_CONTAINS(${v}, ${k}))`

              case "includes":
                return `ARRAY_CONTAINS(${k}, ${v})`
              case "not-includes":
                return `(NOT ARRAY_CONTAINS(${k}, ${v}))`
              case "contains":
                return `CONTAINS(${k}, ${v}, true)`
              case "starts-with":
                return `STARTSWITH(${k}, ${v}, true)`
              case "ends-with":
                return `ENDSWITH(${k}, ${v}, true)`
              case "not-contains":
                return `NOT(CONTAINS(${k}, ${v}, true))`
              case "not-starts-with":
                return `NOT(STARTSWITH(${k}, ${v}, true))`
              case "not-ends-with":
                return `NOT(ENDSWITH(${k}, ${v}, true))`
            }

            switch (x.t) {
              case "lt":
                return `${k} < ${v}`
              case "lte":
                return `${k} <= ${v}`
              case "gt":
                return `${k} > ${v}`
              case "gte":
                return `${k} >= ${v}`
              case "not-eq":
                return x.value === null
                  ? `IS_NULL(${k}) = false`
                  : `${k} <> ${v}`
              case undefined:
              case "eq":
                return x.value === null
                  ? `IS_NULL(${k}) = true`
                  : `${k} = ${v}`
            }
          }
        )
        .join(filter.mode === "or" ? " OR " : " AND ")
    }
    ${lm}`,
    parameters: [
      { name: "@id", value: importedMarkerId },
      ...filter
        .where
        .map((x, i) => ({
          name: `@v${i}`,
          value: x.value
        }))
    ]
  }
}

// function isArray(t: SupportedValues | readonly SupportedValues[]): t is readonly SupportedValues[] {
//   return Array.isArray(t)
// }

/** @deprecated use new-kid */
export function buildCosmosQuery(
  filter: StoreWhereFilter,
  name: string,
  importedMarkerId: string,
  defaultValues: Record<string, unknown>,
  skip?: number,
  limit?: number
) {
  return buildWhereCosmosQuery(filter, name, importedMarkerId, defaultValues, skip, limit)
}

export function buildWhereCosmosQuery3(
  filter: readonly FilterResult[],
  name: string,
  importedMarkerId: string,
  defaultValues: Record<string, unknown>,
  select?: NonEmptyReadonlyArray<string>,
  order?: NonEmptyReadonlyArray<{ key: string; direction: "ASC" | "DESC" }>,
  skip?: number,
  limit?: number
) {
  const statement = (x: FilterR, i: number) => {
    let k = x.path.includes(".-1.")
      ? `${x.path.split(".-1.")[0]}.${x.path.split(".-1.")[1]!}`
      : `f.${x.path}`

    k = x.path in defaultValues ? `(${k} ?? ${JSON.stringify(defaultValues[x.path])})` : k

    const v = "@v" + i

    switch (x.op) {
      case "in":
        return `ARRAY_CONTAINS(${v}, ${k})`
      case "notIn":
        return `(NOT ARRAY_CONTAINS(${v}, ${k}))`

      case "includes":
        return `ARRAY_CONTAINS(${k}, ${v})`
      case "notIncludes":
        return `(NOT ARRAY_CONTAINS(${k}, ${v}))`
      case "contains":
        return `CONTAINS(${k}, ${v}, true)`

      case "startsWith":
        return `STARTSWITH(${k}, ${v}, true)`
      case "endsWith":
        return `ENDSWITH(${k}, ${v}, true)`
      case "notContains":
        return `NOT(CONTAINS(${k}, ${v}, true))`
      case "notStartsWith":
        return `NOT(STARTSWITH(${k}, ${v}, true))`
      case "notEndsWith":
        return `NOT(ENDSWITH(${k}, ${v}, true))`
    }

    switch (x.op) {
      case "lt":
        return `${k} < ${v}`
      case "lte":
        return `${k} <= ${v}`
      case "gt":
        return `${k} > ${v}`
      case "gte":
        return `${k} >= ${v}`
      case "neq":
        return x.value === null
          ? `IS_NULL(${k}) = false`
          : `${k} <> ${v}`
      case undefined:
      case "eq":
        return x.value === null
          ? `IS_NULL(${k}) = true`
          : `${k} = ${v}`
      default: {
        return assertUnreachable(x.op)
      }
    }
  }

  let i = 0

  const print = (state: readonly FilterResult[]) => {
    let s = ""
    let l = 0
    const printN = (n: number) => {
      return n === 0 ? "" : ReadonlyArray.range(1, n).map(() => "  ").join("")
    }
    for (const e of state) {
      switch (e.t) {
        case "where":
          s += statement(e, i++)
          break
        case "or":
          s += ` OR ${statement(e, i++)}`
          break
        case "and":
          s += ` AND ${statement(e, i++)}`
          break
        case "or-scope": {
          ;++l
          s += ` OR (\n${printN(l + 1)}${print(e.result)}\n${printN(l)})`
          ;--l
          break
        }
        case "and-scope": {
          ;++l
          s += ` AND (\n${printN(l + 1)}${print(e.result)}\n${printN(l)})`
          ;--l
          break
        }
        case "where-scope": {
          // ;++l
          s += `(\n${printN(l + 1)}${print(e.result)}\n)`
          // ;--l
          break
        }
      }
    }
    return s
  }

  // const fff = (filter: readonly FilterR[], mode: "AND" | "OR") =>
  //   "(" + filter
  //     .map((_) =>
  //       _.path.includes(".-1.")
  //         ? { ..._, f: _.path.split(".-1.")[0], key: _.path.split(".-1.")[1]! }
  //         : { ..._, f: "f" }
  //     )
  //     .map(
  //       (x, i) => {
  //         const k = `${x.f}.${x.path}`
  //         const v = `@v${i}`

  //         return statement(x, k, v)
  //       }
  //     )
  //     .join(mode === "OR" ? " OR " : " AND ") + ")"
  const getValues = (filter: readonly FilterResult[]): FilterR[] =>
    filter
      .flatMap((_) =>
        _.t === "and-scope" || _.t === "or-scope" || _.t === "where-scope"
          ? getValues(_.result)
          : [_]
      )
  const values = getValues(filter)
  return {
    query: `
    SELECT ${
      select
        ? `${select.map((_) => `f.${_}`).join(", ")}`
        : "f"
    }
    FROM ${name} f

    ${
      pipe(
        values
          .filter((_) => _.path.includes(".-1."))
          .map((_) => _.path.split(".-1.")[0])
          .map((_) => `JOIN ${_} IN f.${_}`),
        ReadonlyArray.dedupeWith(Equivalence.string)
      )
        .join("\n")
    }

    WHERE f.id != @id ${filter.length ? `AND ${print(filter)}` : ""}
    ${order ? `ORDER BY ${order.map((_) => `f.${_.key} ${_.direction}`).join(", ")}` : ""}
    ${skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""}`,
    parameters: [
      { name: "@id", value: importedMarkerId },
      ...values
        .map((x, i) => ({
          name: `@v${i}`,
          value: x.value
        }))
    ]
  }
}
