import type { FieldValues } from "./filter/types/fields.js"
import type { FieldPath, FieldPathValue } from "./filter/types/path/eager.js"
import type { SupportedValues, Where } from "./services/Store.js"

/**
 * the function defaults to "eq", but has additional properties for notEq, in and notIn
 */
export interface WhereFilter<TFieldValues extends FieldValues>
  extends ReturnType<typeof makeWhereFilter_<TFieldValues>>
{}
export function makeWhereFilter<TFieldValues extends FieldValues>() {
  const f = makeWhereFilter_<TFieldValues>()
  return f as WhereFilter<TFieldValues>
}

function makeHelpers<TFieldValues extends FieldValues>() {
  const helpers = makeHelpers_<TFieldValues>()
  return helpers as WhereHelpers<TFieldValues>
}

export interface WhereHelpers<TFieldValues extends FieldValues> extends ReturnType<typeof makeHelpers_<TFieldValues>> {}

function makeHelpers_<TFieldValues extends FieldValues>() {
  type Paths = FieldPath<TFieldValues>
  type Value<TFieldName extends Paths> = FieldPathValue<TFieldValues, TFieldName>

  return {
    in<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: readonly V[]
    ) {
      return { key: path, value, t: "in" as const }
    },
    notIn<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: readonly V[]
    ) {
      return { key: path, value, t: "not-in" as const }
    },
    includes<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "includes" as const }
    },
    notIncludes<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "not-includes" as const }
    },
    eq<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "eq" as const }
    },
    notEq<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "not-eq" as const }
    },
    gt<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "gt" as const }
    },
    gte<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "gte" as const }
    },
    lt<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "lt" as const }
    },
    lte<TFieldName extends Paths, V extends Value<TFieldName>>(
      this: void,
      path: TFieldName,
      value: V
    ) {
      return { key: path, value, t: "lte" as const }
    }
  } satisfies Record<string, (...args: any[]) => Where>
}

function makeWhereFilter_<TFieldValues extends FieldValues>() {
  const helpers = makeHelpers<TFieldValues>()
  const f = Object.assign(helpers.eq, helpers)
  return f
}

export type WhereValue<
  T extends
    | "eq"
    | "not-eq"
    | "lt"
    | "gt"
    | "lte"
    | "gte"
    | "starts-with"
    | "ends-with"
    | "contains"
    | "not-starts-with"
    | "not-ends-with"
    | "not-contains"
    | "in"
    | "not-in"
    | "includes"
    | "not-includes",
  A, // extends SupportedValues,
  V extends A = A
> = { t: T; v: V }

export type WhereIn<T extends "in" | "not-in", V, Values extends readonly V[] = readonly V[]> = {
  t: T
  v: Values
}

/**
 * @tsplus fluent string $in
 * @tsplus fluent boolean $in
 * @tsplus fluent number $in
 */
export function $in<A extends SupportedValues, Values extends readonly A[]>(
  _: A,
  ...v: Values
): WhereIn<"in", A, Values> {
  return $$in(v)
}

/**
 * @tsplus fluent string $notIn
 * @tsplus fluent boolean $notIn
 * @tsplus fluent number $notIn
 */
export function $notIn<A extends SupportedValues, Values extends readonly A[]>(
  _: A,
  ...v: Values
): WhereIn<"not-in", A, Values> {
  return $$notIn(v)
}

/**
 * @tsplus fluent string $is
 * @tsplus fluent Date $is
 * @tsplus fluent boolean $is
 * @tsplus fluent number $is
 * @tsplus fluent Object $is
 */
export function $is<A, V extends A>(_: A, v: V): WhereValue<"eq", A, V> {
  return $$is(v)
}

/**
 * @tsplus fluent ReadonlyArray $includes
 */
export function $includes<A extends readonly any[], V extends A[number]>(_: A, v: V): WhereValue<"includes", A, V> {
  return $$includes(v)
}

/**
 * @tsplus fluent ReadonlyArray $notIncludes
 */
export function $notIncludes<A extends readonly any[], V extends A[number]>(
  _: A,
  v: V
): WhereValue<"not-includes", A, V> {
  return $$notIncludes(v)
}
/**
 * @tsplus fluent string $isnt
 * @tsplus fluent Date $isnt
 * @tsplus fluent boolean $isnt
 * @tsplus fluent number $isnt
 * @tsplus fluent Object $isnt
 */
export function $isnt<A, V extends A>(_: A, v: V): WhereValue<"not-eq", A, V> {
  return $$isnt(v)
}

/**
 * @tsplus fluent string $gt
 * @tsplus fluent Date $gt
 * @tsplus fluent boolean $gt
 * @tsplus fluent number $gt
 * @tsplus fluent Object $gt
 */
export function $gt<A, V extends A>(_: A, v: V): WhereValue<"gt", A, V> {
  return $$gt(v)
}

/**
 * @tsplus fluent string $gte
 * @tsplus fluent Date $gte
 * @tsplus fluent boolean $gte
 * @tsplus fluent number $gte
 * @tsplus fluent Object $gte
 */
export function $gte<A, V extends A>(_: A, v: V): WhereValue<"gte", A, V> {
  return $$gte(v)
}

/**
 * @tsplus fluent string $lt
 * @tsplus fluent Date $lt
 * @tsplus fluent boolean $lt
 * @tsplus fluent number $lt
 * @tsplus fluent Object $lt
 */
export function $lt<A, V extends A>(_: A, v: V): WhereValue<"lt", A, V> {
  return $$lt(v)
}

/**
 * @tsplus fluent string $lte
 * @tsplus fluent Date $lte
 * @tsplus fluent boolean $lte
 * @tsplus fluent number $lte
 * @tsplus fluent Object $lte
 */
export function $lte<A, V extends A>(_: A, v: V): WhereValue<"lte", A, V> {
  return $$lte(v)
}

function $is__<V extends A, A>(v: V) {
  return (_: A) => $is(_, v)
}

function $isnt__<V extends A, A>(v: V) {
  return (_: A) => $isnt(_, v)
}

function $includes__<V extends A[number], A extends readonly any[]>(v: V) {
  return (_: A) => $includes(_, v)
}

function $notIncludes__<V extends A[number], A extends readonly any[]>(v: V) {
  return (_: A) => $notIncludes(_, v)
}

function $lt__<V extends A, A>(v: V) {
  return (_: A) => $lt(_, v)
}

function $lte__<V extends A, A>(v: V) {
  return (_: A) => $lte(_, v)
}

function $gt__<V extends A, A>(v: V) {
  return (_: A) => $gt(_, v)
}

function $gte__<V extends A, A>(v: V) {
  return (_: A) => $gte(_, v)
}

function $in__<A extends SupportedValues, Values extends readonly A[]>(
  ...v: Values
) {
  return (_: A) => $in(_, ...v)
}

function $notIn__<A extends SupportedValues, Values extends readonly A[]>(
  ...v: Values
) {
  return (_: A) => $notIn(_, ...v)
}

function $startsWith__<V extends A, A extends string>(v: V) {
  return (_: A) => $startsWith(_, v)
}

function $endsWith__<V extends A, A extends string>(v: V) {
  return (_: A) => $endsWith(_, v)
}

function $contains__<V extends A, A extends string>(v: V) {
  return (_: A) => $contains(_, v)
}

export const Filters = {
  $is: $is__,
  $isnt: $isnt__,
  $in: $in__,
  $notIn: $notIn__,
  $gt: $gt__,
  $gte: $gte__,
  $lt: $lt__,
  $lte: $lte__,
  $contains: $contains__,
  $endsWith: $endsWith__,
  $startsWith: $startsWith__,
  $includes: $includes__,
  $notIncludes: $notIncludes__
}

/**
 * @tsplus fluent string $notStartsWith
 */
export function $notStartsWith<A extends string, V extends A>(_: A, v: V): WhereValue<"not-starts-with", A, V> {
  return $$notStartsWith(v)
}

/**
 * @tsplus fluent string $notEndsWith
 */
export function $notEndsWith<A extends string, V extends A>(_: A, v: V): WhereValue<"not-ends-with", A, V> {
  return $$notEndsWith(v)
}

/**
 * @tsplus fluent string $notContains
 */
export function $notContains<A extends string, V extends A>(_: A, v: V): WhereValue<"not-contains", A, V> {
  return $$notContains(v)
}

/**
 * @tsplus fluent string $startsWith
 */
export function $startsWith<A extends string, V extends A>(_: A, v: V): WhereValue<"starts-with", A, V> {
  return $$startsWith(v)
}

/**
 * @tsplus fluent string $endsWith
 */
export function $endsWith<A extends string, V extends A>(_: A, v: V): WhereValue<"ends-with", A, V> {
  return $$endsWith(v)
}

/**
 * @tsplus fluent string $contains
 */
export function $contains<A extends string, V extends A>(_: A, v: V): WhereValue<"contains", A, V> {
  return $$contains(v)
}

function $$in<L extends readonly any[]>(v: L) {
  return { t: "in" as const, v }
}

function $$notIn<L extends readonly any[]>(v: L) {
  return { t: "not-in" as const, v }
}
function $$is<A>(v: A) {
  return { t: "eq" as const, v }
}
function $$isnt<A>(v: A) {
  return { t: "not-eq" as const, v }
}
function $$includes<A>(v: A) {
  return { t: "includes" as const, v }
}
function $$notIncludes<A>(v: A) {
  return { t: "not-includes" as const, v }
}

function $$lt<A>(v: A) {
  return { t: "lt" as const, v }
}

function $$lte<A>(v: A) {
  return { t: "lte" as const, v }
}
function $$gt<A>(v: A) {
  return { t: "gt" as const, v }
}

function $$gte<A>(v: A) {
  return { t: "gte" as const, v }
}

function $$contains<A extends string>(v: A) {
  return { t: "contains" as const, v }
}
function $$startsWith<A extends string>(v: A) {
  return { t: "starts-with" as const, v }
}
function $$endsWith<A extends string>(v: A) {
  return { t: "ends-with" as const, v }
}

function $$notContains<A extends string>(v: A) {
  return { t: "not-contains" as const, v }
}
function $$notStartsWith<A extends string>(v: A) {
  return { t: "not-starts-with" as const, v }
}
function $$notEndsWith<A extends string>(v: A) {
  return { t: "not-ends-with" as const, v }
}

type ValueType<V> = {
  t: "in" | "not-in"
  v: readonly V[]
} | { t: "eq" | "not-eq"; v: V }

type TType<T> = T extends ValueType<any> ? T["t"] : never
type VType<T> = T extends ValueType<any> ? T["v"] : never

function f(p: string, b: any) {
  if (typeof b === "function") b = b(undefined)
  const obj = typeof b === "object" && b !== null
  return makeFilter(p, obj ? b.v : b, obj ? b.t ?? "eq" : "eq")
}

function makeFilter<T extends "in" | "not-in" | "eq" | "not-eq">(path: string, value: any, t: T) {
  return { key: path, t, value }
}

type FIL<S, K extends string, T extends "in" | "not-in" | "eq" | "not-eq", V> = {
  key: K
  t: T
  value: V
  readonly S: S
}

export function makeFilters<T extends FieldValues>() {
  type Paths = FieldPath<T>
  type Value<TFieldName extends Paths> = FieldPathValue<T, TFieldName>

  function test<
    TFieldName extends Paths,
    A extends Value<TFieldName>,
    Val
  >(
    path: TFieldName,
    value: (v: A) => Val
  ): FIL<T, string, TType<Val>, VType<Val>>
  function test<
    TFieldName extends Paths,
    A extends Value<TFieldName>
  >(
    path: TFieldName,
    value: A
  ): FIL<T, string, "eq", A>
  function test(p: string, v: any) {
    return f(p, v) as any
  }
  return test
}

// export function makeFilter<TFieldValues extends FieldValues>() {
//   const f = makeFilter_<TFieldValues>()
//   return f as WhereFilterHelper<TFieldValues>
// }

// export interface WhereFilterHelper<TFieldValues extends FieldValues> extends ReturnType<typeof makeFilter_<TFieldValues>> {}

// function makeFilter_<TFieldValues extends FieldValues>() {
//   function eq<TFieldName extends FieldPath<TFieldValues>, V extends FieldPathValue<TFieldValues, TFieldName>>(
//     path: TFieldName,
//     value: V
//   ) {
//     return { key: path, value, t: "eq" as const }
//   }
//   const f = Object.assign(eq satisfies (...args: any[]) => Where, {
//     in<TFieldName extends FieldPath<TFieldValues>, V extends FieldPathValue<TFieldValues, TFieldName>>(
//       path: TFieldName,
//       value: readonly V[]
//     ) {
//       return { key: path, value, t: "in" as const }
//     },
//     notIn<TFieldName extends FieldPath<TFieldValues>, V extends FieldPathValue<TFieldValues, TFieldName>>(
//       path: TFieldName,
//       value: readonly V[]
//     ) {
//       return { key: path, value, t: "not-in" as const }
//     },
//     eq,
//     notEq<TFieldName extends FieldPath<TFieldValues>, V extends FieldPathValue<TFieldValues, TFieldName>>(
//       path: TFieldName,
//       value: V
//     ) {
//       return { key: path, value, t: "not-eq" as const }
//     }
//   } satisfies Record<string, (...args: any[]) => Where>)
//   return f
// }
