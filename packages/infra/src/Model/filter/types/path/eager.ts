/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "../fields.js"
import type { BrowserNativeObject, Primitive } from "../utils.js"

import type { ArrayKey, IsTuple, TupleKeys } from "./common.js"

/**
 * Helper type for recursively constructing paths through a type.
 * See {@link Path}
 */
type PathImpl<K extends string | number, V> = V extends
  | Primitive
  | BrowserNativeObject ? `${K}`
  : `${K}` | `${K}.${Path<V>}`

/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
export type Path<T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
      [K in TupleKeys<T>]-?: PathImpl<K & string, T[K]>
    }[TupleKeys<T>]
  : PathImpl<ArrayKey, V>
  : {
    [K in keyof T]-?: PathImpl<K & string, T[K]>
  }[keyof T]

/**
 * See {@link Path}
 */
export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T - deeply nested type which is indexed by the path
 * @typeParam P - path into the deeply nested type
 * @example
 * ```
 * PathValue<{foo: {bar: string}}, 'foo.bar'> = string
 * PathValue<[number, string], '1'> = string
 * ```
 */
/* dprint-ignore-start */
export type PathValue<T, P extends Path<T>> =
  T extends any
    ? P extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? R extends Path<T[K]>
          ? PathValue<T[K], R>
          : never
        : K extends `${ArrayKey}`
          ? T extends ReadonlyArray<infer V>
            ? PathValue<V, R & Path<V>>
            : never
          : never
      : P extends keyof T
        ? T[P]
        : P extends `${ArrayKey}`
          ? T extends ReadonlyArray<infer V>
            ? V
            : never
          : never
    : never
/* dprint-ignore-end */
/**
 * See {@link PathValue}
 */
export type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>
> = PathValue<TFieldValues, TFieldPath>

/**
 * Type to evaluate the type which the given paths point to.
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TPath        - paths into the deeply nested field values
 * @example
 * ```
 * FieldPathValues<{foo: {bar: string}}, ['foo', 'foo.bar']>
 *   = [{bar: string}, string]
 * ```
 */
export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[]
> =
  & {}
  & {
    [K in keyof TPath]: FieldPathValue<
      TFieldValues,
      TPath[K] & FieldPath<TFieldValues>
    >
  }

/**
 * Type which eagerly collects all paths through a fieldType that matches a give type
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TValue       - the value you want to match into each type
 * @example
 * ```typescript
 * FieldPathByValue<{foo: {bar: number}, baz: number, bar: string}, number>
 *   = 'foo.bar' | 'baz'
 * ```
 */
export type FieldPathByValue<TFieldValues extends FieldValues, TValue> = {
  [Key in FieldPath<TFieldValues>]: FieldPathValue<
    TFieldValues,
    Key
  > extends TValue ? Key
    : never
}[FieldPath<TFieldValues>]
