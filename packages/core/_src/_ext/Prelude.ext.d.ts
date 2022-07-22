import { Chunk, Effect, EffectMaybe, Either, ImmutableSet, Managed, Maybe, NonEmptyArray, Sync } from "@effect-ts-app/prelude/Prelude";
import { pipe } from "./pipe.js";
/**
 * @tsplus type tsplus/LazyArgument
 */
export interface LazyArg<A> {
    (): A;
}
/**
 * @tsplus unify ets/Effect
 */
export declare function unifyEffect<X extends Effect<any, any, any>>(self: X): Effect<[
    X
] extends [{
    [Effect._R]: (_: infer R) => void;
}] ? R : never, [
    X
] extends [{
    [Effect._E]: () => infer E;
}] ? E : never, [
    X
] extends [{
    [Effect._A]: () => infer A;
}] ? A : never>;
/**
 * @tsplus unify ets/Sync
 */
export declare function unifySync<X extends Sync<any, any, any>>(self: X): Sync<[
    X
] extends [{
    [Effect._R]: (_: infer R) => void;
}] ? R : never, [
    X
] extends [{
    [Effect._E]: () => infer E;
}] ? E : never, [
    X
] extends [{
    [Effect._A]: () => infer A;
}] ? A : never>;
/**
 * @tsplus unify ets/Either
 * @tsplus unify ets/Either/Left
 * @tsplus unify ets/Either/Right
 */
export declare function unifyEither<X extends Either<any, any>>(self: X): Either<[
    X
] extends [Either<infer EX, any>] ? EX : never, [
    X
] extends [Either<any, infer AX>] ? AX : never>;
/**
 * @tsplus unify ets/Maybe
 * @tsplus unify ets/Maybe/Some
 * @tsplus unify ets/Maybe/None
 */
export declare function unifyMaybe<X extends Maybe<any>>(self: X): Maybe<[X] extends [Maybe<infer A>] ? A : never>;
/**
 * @tsplus fluent ets/Effect flatMap
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const flatMapEffect: typeof Effect.chain_;
/**
 * @tsplus fluent ets/Effect map
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const mapEffect: typeof Effect.map_;
/**
 * @tsplus fluent ets/Sync flatMap
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const flatMapSync: <R, E, A, R1, E1, B>(self: Sync.Sync<R, E, A>, f: (a: A) => Sync.Sync<R1, E1, B>) => Sync.Sync<R & R1, E | E1, B>;
/**
 * @tsplus fluent ets/Sync map
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const mapSync: <R, E, A, B>(self: Sync.Sync<R, E, A>, f: (a: A) => B) => Sync.Sync<R, E, B>;
/**
 * @tsplus fluent ets/Maybe flatMap
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const flatMapMaybe: typeof Maybe.chain_;
/**
 * @tsplus fluent ets/Maybe map
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const mapMaybe: typeof Maybe.map_;
/**
 * @tsplus fluent ets/Either flatMap
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const flatMapEither: typeof Either.chain_;
/**
 * @tsplus fluent ets/Either map
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const mapEither: typeof Either.map_;
/**
 * @tsplus operator ets/Effect >=
 * @tsplus fluent ets/Effect apply
 * @tsplus fluent ets/Effect __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeEffect: typeof pipe;
/**
 * @tsplus operator ets/XPure >=
 * @tsplus fluent ets/XPure apply
 * @tsplus fluent ets/XPure __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeXPure: typeof pipe;
/**
 * @tsplus operator ets/NESet >=
 * @tsplus fluent ets/NESet apply
 * @tsplus fluent ets/NESet __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeNESet: typeof pipe;
/**
 * @tsplus operator ets/Set >=
 * @tsplus fluent ets/Set apply
 * @tsplus fluent ets/Set __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSet: typeof pipe;
/**
 * @tsplus operator ets/Array >=
 * @tsplus fluent ets/Array apply
 * @tsplus fluent ets/Array __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeArray: typeof pipe;
/**
 * @tsplus operator ets/Maybe >=
 * @tsplus fluent ets/Maybe apply
 * @tsplus fluent ets/Maybe __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeMaybe: typeof pipe;
/**
 * @tsplus operator ets/Either >=
 * @tsplus fluent ets/Either apply
 * @tsplus fluent ets/Either __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeEither: typeof pipe;
/**
 * @tsplus operator ets/Sync >=
 * @tsplus fluent ets/Sync apply
 * @tsplus fluent ets/Sync __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSync: typeof pipe;
/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 * @tsplus fluent ets/Effect zipRight
 * @tsplus operator ets/Effect >
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare function effectZipRight_<R, E, A, R2, E2, A2>(a: Effect<R, E, A>, b: Effect<R2, E2, A2>, __trace?: string): Effect<R & R2, E | E2, A2>;
/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 * @tsplus fluent ets/Sync zipRight
 * @tsplus operator ets/Sync >
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare function syncZipRight_<R, E, A, R2, E2, A2>(a: Sync<R, E, A>, b: Sync<R2, E2, A2>): Sync<R & R2, E | E2, A2>;
/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 * @tsplus fluent ets/Managed zipRight
 * @tsplus operator ets/Managed >
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare function managedZipRight_<R, E, A, R2, E2, A2>(a: Managed<R, E, A>, b: Managed<R2, E2, A2>): Managed<R & R2, E | E2, A2>;
/**
 * @tsplus fluent ets/Effect tapMaybe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const tapEffectMaybe: <R, E, A, R2, E2>(inner: EffectMaybe.EffectMaybe<R, E, A>, bind: EffectMaybe.FunctionN<[A], Effect.Effect<R2, E2, unknown>>) => EffectMaybe.EffectMaybe<R & R2, E | E2, A>;
/**
 * @tsplus fluent ets/Maybe encaseInEither
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const optionEncaseEither: typeof Either.fromOption_;
/**
 * @tsplus fluent ets/Either mapLeft
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const eitherMapLeft: typeof Either.mapLeft_;
/**
 * @tsplus static ets/Maybe __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const optionSome: typeof Maybe.some;
/**
 * @tsplus static ets/Either __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const eitherRight: typeof Either.right;
/**
 * @tsplus static ets/EffectMaybe __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const effectMaybeSome: <A>(a: A) => EffectMaybe.UIO<A>;
/**
 * @tsplus static ets/Effect __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const effectSucceed: typeof Effect.succeed;
/**
 * @tsplus static ets/Sync __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const syncSucceed: <A>(a: A) => Sync.Sync<unknown, never, A>;
/**
 * @tsplus static ets/NonEmptyArray __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const naSucceed: typeof NonEmptyArray.fromArray;
/**
 * @tsplus static ets/Set __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const setSucceed: typeof ImmutableSet.fromArray;
/**
 * @tsplus static ets/Chunk __call
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const chunkSucceed: <A>(array: Iterable<A>) => Chunk.Chunk<A>;
/**
 * @tsplus operator ets/Schema/Schema >=
 * @tsplus fluent ets/Schema/Schema apply
 * @tsplus fluent ets/Schema/Schema __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSchema: typeof pipe;
/**
 * @tsplus operator ets/Schema/Property >=
 * @tsplus fluent ets/Schema/Property apply
 * @tsplus fluent ets/Schema/Property __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSchemaProperty: typeof pipe;
/**
 * @tsplus operator ets/Schema/Constructor >=
 * @tsplus fluent ets/Schema/Constructor apply
 * @tsplus fluent ets/Schema/Constructor __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSchemaConstructor: typeof pipe;
/**
 * @tsplus operator ets/Schema/Parser >=
 * @tsplus fluent ets/Schema/Parser apply
 * @tsplus fluent ets/Schema/Parser __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSchemaParser: typeof pipe;
/**
 * @tsplus operator ets/Schema/These >=
 * @tsplus fluent ets/Schema/These apply
 * @tsplus fluent ets/Schema/These __call
 * @tsplus macro pipe
 * @tsplus location "@effect-ts-app/prelude/_ext/Prelude.ext"
 */
export declare const pipeSchemaThese: typeof pipe;
