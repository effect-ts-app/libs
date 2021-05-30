/* eslint-disable @typescript-eslint/no-explicit-any */
import * as O from "@effect-ts-app/core/ext/Option"
import type { If } from "ts-toolbelt/out/Any/If"
import type { Key } from "ts-toolbelt/out/Any/Key"
import type { BuiltIn } from "ts-toolbelt/out/Misc/BuiltIn"
import type { Depth } from "ts-toolbelt/out/Object/_Internal"
import type { Has } from "ts-toolbelt/out/Union/Has"

type Prim = BuiltIn | string | number | boolean | O.None | O.Some<any>

// From ts-toolbelt, but leaves primitives properly in tact even when branded.
// eslint-disable-next-line @typescript-eslint/ban-types
export declare type ComputeRaw<A extends any> = A extends Function
  ? A
  : {
      [K in keyof A]: A[K]
    } &
      unknown
/**
 * @hidden
 */
declare type ComputeFlat<A extends any> = A extends BuiltIn
  ? A
  : A extends Array<any>
  ? A extends Array<Prim>
    ? A
    : A extends Array<Record<Key, any>>
    ? Array<
        {
          [K in keyof A[number]]: A[number][K]
        } &
          unknown
      >
    : A
  : A extends ReadonlyArray<any>
  ? A extends ReadonlyArray<Prim>
    ? A
    : A extends ReadonlyArray<Record<Key, any>>
    ? ReadonlyArray<
        {
          [K in keyof A[number]]: A[number][K]
        } &
          unknown
      >
    : A
  : {
      [K in keyof A]: A[K]
    } &
      unknown
/**
 * @hidden
 */
declare type ComputeDeep<A extends any, Seen = never> = A extends Prim
  ? A
  : If<
      Has<Seen, A>,
      A,
      A extends Array<any>
        ? A extends Array<Prim>
          ? A
          : A extends Array<Record<Key, any>>
          ? Array<
              {
                [K in keyof A[number]]: ComputeDeep<A[number][K], A | Seen>
              } &
                unknown
            >
          : A
        : A extends ReadonlyArray<any>
        ? A extends ReadonlyArray<Prim>
          ? A
          : A extends ReadonlyArray<Record<Key, any>>
          ? ReadonlyArray<
              {
                [K in keyof A[number]]: ComputeDeep<A[number][K], A | Seen>
              } &
                unknown
            >
          : A
        : {
            [K in keyof A]: ComputeDeep<A[K], A | Seen>
          } &
            unknown
    >
/**
 * Force TS to load a type that has not been computed (to resolve composed
 * types that TS haven't fully resolved, for display purposes mostly).
 * @param A to compute
 * @returns `A`
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Compute<{x: 'x'} & {y: 'y'}> // {x: 'x', y: 'y'}
 * ```
 */
export declare type Compute<A extends any, depth extends Depth = "flat"> = {
  // Deep destroys unions.

  flat: ComputeFlat<A>
  deep: ComputeDeep<A>
}[depth]
