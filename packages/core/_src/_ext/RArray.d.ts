import type { Array as ImmutableArray } from "@effect-ts-app/core/Array";
/**
 * @tsplus operator ets/Array &
 * @tsplus fluent ets/Array concat
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare function concat_<A, B>(self: ImmutableArray<A>, that: ImmutableArray<B>): ImmutableArray<A | B>;
/**
 * Concatenates two ets/Array together
 * @tsplus operator ets/Array +
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare const concatOperator: <A>(self: ImmutableArray<A>, that: ImmutableArray<A>) => ImmutableArray<A>;
/**
 * Prepends `a` to ImmutableArray<A>
 * @tsplus operator ets/Array + 1.0
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare function prependOperatorStrict<A>(a: A, self: ImmutableArray<A>): ImmutableArray<A>;
/**
 * Prepends `a` to ImmutableArray<A>
 * @tsplus operator ets/Array >
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare function prependOperator<A, B>(a: A, self: ImmutableArray<B>): ImmutableArray<A | B>;
/**
 * Prepends `a` to ImmutableArray<A>
 * @tsplus fluent ets/Array prepend
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare function prepend_<A, B>(tail: ImmutableArray<A>, head: B): ImmutableArray<A | B>;
/**
 * Appends `a` to ImmutableArray<A>
 * @tsplus fluent ets/Array append
 * @tsplus operator ets/Array <
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare function append_<A, B>(init: ImmutableArray<A>, end: B): ImmutableArray<A | B>;
/**
 * @tsplus operator ets/Array + 1.0
 * @tsplus location "@effect-ts-app/prelude/_ext/RArray"
 */
export declare const appendOperator: <A>(self: ImmutableArray<A>, a: A) => ImmutableArray<A>;
