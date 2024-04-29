export type InOps =
  | "in"
  | "notIn"

export type OtherOps =
  | "endsWith"
  | "startsWith"
  | "notEndsWith"
  | "notStartsWith"
  | "contains"
  | "notContains"
  | "includes"
  | "notIncludes"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"

// TODO: includes | notIncludes
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
