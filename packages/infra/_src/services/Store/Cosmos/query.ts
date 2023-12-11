import { assertUnreachable } from "@effect-app/prelude/utils"
import type { FilterR, FilterResult } from "../filterApi/query.js"
import type { FilterJoinSelect, JoinFindFilter, LegacyFilter, StoreWhereFilter, SupportedValues } from "../service.js"

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

/**
 * @deprecated: should build Select into Where query
 */
export function buildFilterJoinSelectCosmosQuery(
  filter: FilterJoinSelect,
  k: string,
  name: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
SELECT r, f.id as _rootId
FROM ${name} f
JOIN r IN f.${k}
WHERE LOWER(r.${filter.valueKey}) = LOWER(@value)
${lm}
`,
    parameters: [{ name: "@value", value: filter.value }]
  }
}

/**
 * @deprecated: is now part of Where query as k.-1.valueKey
 */
export function buildFindJoinCosmosQuery(
  filter: JoinFindFilter,
  k: string,
  name: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
SELECT DISTINCT VALUE f
FROM ${name} f
JOIN r IN f.${k}
WHERE LOWER(r.${filter.valueKey}) = LOWER(@value)
${lm}`,
    parameters: [{ name: "@value", value: filter.value }]
  }
}

/**
 * @deprecated: should build into Where query
 */
export function buildLegacyCosmosQuery<PM>(
  filter: LegacyFilter<PM>,
  name: string,
  importedMarkerId: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
    SELECT *
    FROM ${name} f
    WHERE f.id != @id AND f.${
      String(
        filter.by
      )
    } LIKE @filter
  ${lm}`,
    parameters: [
      { name: "@id", value: importedMarkerId },
      {
        name: "@filter",
        value: filter.type === "endsWith"
          ? `%${filter.value}`
          : filter.type === "contains"
          ? `%${filter.value}%`
          : `${filter.value}%`
      }
    ]
  }
}

export function buildWhereCosmosQuery(
  filter: StoreWhereFilter,
  name: string,
  importedMarkerId: string,
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""
  return {
    query: `
    SELECT *
    FROM ${name} f
    ${
      filter
        .where
        .filter((_) => _.key.includes(".-1."))
        .map((_) => _.key.split(".-1.")[0])
        .map((_) => `JOIN ${_} IN f.${_}`)
        .uniq(Equivalence.string)
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
            const k = `${x.f}.${x.key}`
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

            const lk = lowerIfNeeded(k, x.value)
            const lv = lowerIfNeeded(v, x.value)

            switch (x.t) {
              case "lt":
                return `${lk} < ${lv}`
              case "lte":
                return `${lk} <= ${lv}`
              case "gt":
                return `${lk} > ${lv}`
              case "gte":
                return `${lk} >= ${lv}`
              case "not-eq":
                return x.value === null
                  ? `IS_NULL(${k}) = false`
                  : `${lk} <> ${lv}`
              case undefined:
              case "eq":
                return x.value === null
                  ? `IS_NULL(${k}) = true`
                  : `${lk} = ${lv}`
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

function lowerIfNeeded(key: unknown, value: unknown) {
  return typeof value === "string" ? `LOWER(${key})` : `${key}`
}

export function buildCosmosQuery<PM>(
  filter: LegacyFilter<PM> | StoreWhereFilter,
  name: string,
  importedMarkerId: string,
  skip?: number,
  limit?: number
) {
  return filter.type === "startsWith"
      || filter.type === "endsWith"
      || filter.type === "contains"
    ? buildLegacyCosmosQuery(filter, name, importedMarkerId, skip, limit)
    : buildWhereCosmosQuery(filter, name, importedMarkerId, skip, limit)
}

export function buildWhereCosmosQuery3(
  filter: readonly FilterResult[],
  name: string,
  importedMarkerId: string,
  select?: readonly string[],
  skip?: number,
  limit?: number
) {
  const lm = skip !== undefined || limit !== undefined ? `OFFSET ${skip ?? 0} LIMIT ${limit ?? 999999}` : ""

  const statement = (x: FilterR, i: number) => {
    const k = x.path.includes(".-1.")
      ? `${x.path.split(".-1.")[0]}.${x.path.split(".-1.")[1]!}`
      : `f.${x.path}`

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

    const lk = lowerIfNeeded(k, x.value)
    const lv = lowerIfNeeded(v, x.value)

    switch (x.op) {
      case "lt":
        return `${lk} < ${lv}`
      case "lte":
        return `${lk} <= ${lv}`
      case "gt":
        return `${lk} > ${lv}`
      case "gte":
        return `${lk} >= ${lv}`
      case "neq":
        return x.value === null
          ? `IS_NULL(${k}) = false`
          : `${lk} <> ${lv}`
      case undefined:
      case "eq":
        return x.value === null
          ? `IS_NULL(${k}) = true`
          : `${lk} = ${lv}`
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
        ? `VALUE {\n${select.map((_) => `${_}: f.${_}`).join(",\n")}\n}`
        : "f"
    }
    FROM ${name} AS f

    ${
      values
        .filter((_) => _.path.includes(".-1."))
        .map((_) => _.path.split(".-1.")[0])
        .map((_) => `JOIN ${_} IN f.${_}`)
        .uniq(Equivalence.string)
        .join("\n")
    }

    WHERE f.id != @id ${filter.length ? `AND ${print(filter)}` : ""}
    ${lm}`,
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
