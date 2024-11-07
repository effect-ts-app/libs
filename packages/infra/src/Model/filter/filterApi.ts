export type InOps =
  | "in"
  | "notIn"

export type OtherOps =
export type OtherOps =
  | "endsWith"
  | "endsWith"
  | "startsWith"
  | "startsWith"
  | "notEndsWith"
  | "notEndsWith"
  | "notStartsWith"
  | "notStartsWith"
  | "includes"
  | "includes"
  | "notIncludes"
  | "notIncludes"
  | "includes-any"
  | "includes-any"
  | "notIncludes-any"
  | "notIncludes-any"
  | "includes-all"
  | "includes-all"
  | "notIncludes-all"
  | "notIncludes-all"
  | "eq"
  | "eq"
  | "neq"
  | "neq"
  | "gt"
  | "gt"
  | "gte"
  | "gte"
  | "lt"
  | "lt"
  | "lte"
  | "lte"

export type Ops = OtherOps | InOps

export type FilterScopes = {
  t: "or-scope"
  result: FilterResult[]
} | {
  t: "and-scope"
  result: FilterResult[]
} | {
  t: "where-scope"
  result: FilterResult[]
}

export type FilterR = {
  op: Ops

  path: string
  value: string // ToDO: Value[]
}

export type FilterResult =
  | {
    t: "where"
  } & FilterR
  | {
    t: "or"
  } & FilterR
  | {
    t: "and"
  } & FilterR
  | FilterScopes
