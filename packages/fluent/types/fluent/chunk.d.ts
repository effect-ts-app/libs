/* eslint-disable @typescript-eslint/no-namespace */

import type * as A from "@effect-ts/core/Collections/Immutable/Array"
import type * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type * as T from "@effect-ts/core/Effect"
import type { Equal } from "@effect-ts/core/Equal"
import type * as F from "@effect-ts/core/Function"
import type { Identity } from "@effect-ts/core/Identity"
import type { Option } from "@effect-ts/core/Option"
import type * as HKT from "@effect-ts/core/Prelude"
import type { PredicateWithIndex, Separated } from "@effect-ts/core/Utils"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import type { Either } from "@effect-ts/system/Either"
import type { Ord } from "@effect-ts/system/Ord"

declare module "@effect-ts/system/Collections/Immutable/Chunk" {
  const Chunk: ChunkStaticOps

  interface ChunkStaticOps {
    /**
     * @ets_rewrite_static Any from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Any: typeof C.Any

    /**
     * @ets_rewrite_static Applicative from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Applicative: typeof C.Applicative

    /**
     * @ets_rewrite_static ApplyZip from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ApplyZip: typeof C.ApplyZip

    /**
     * @ets_rewrite_static AssociativeBothZip from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    AssociativeBothZip: typeof C.AssociativeBothZip

    /**
     * @ets_rewrite_static AssociativeFlatten from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    AssociativeFlatten: typeof C.AssociativeFlatten

    /**
     * @ets_rewrite_static BreadthFirstChainRec from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    BreadthFirstChainRec: typeof C.BreadthFirstChainRec

    /**
     * @ets_rewrite_static breadthFirstChainRec from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    breadthFirstChainRec: typeof C.breadthFirstChainRec

    /**
     * @ets_rewrite_static builder from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    builder: typeof C.builder

    /**
     * @ets_rewrite_static Collection from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Collection: typeof C.Collection

    /**
     * @ets_rewrite_static Compact from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Compact: typeof C.Compact

    /**
     * @ets_rewrite_static compactF from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    compactF: typeof C.compactF

    /**
     * @ets_rewrite_static compactWithIndexF from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    compactWithIndexF: typeof C.compactWithIndexF

    /**
     * @ets_rewrite_static Covariant from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Covariant: typeof C.Covariant

    /**
     * @ets_rewrite_static DepthFirstChainRec from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    DepthFirstChainRec: typeof C.DepthFirstChainRec

    /**
     * @ets_rewrite_static depthFirstChainRec from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    depthFirstChainRec: typeof C.depthFirstChainRec

    /**
     * @ets_rewrite_static empty from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    empty: typeof C.empty

    /**
     * @ets_rewrite_static Extend from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Extend: typeof C.Extend

    /**
     * @ets_rewrite_static fill from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    fill: typeof C.fill

    /**
     * @ets_rewrite_static Filter from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Filter: typeof C.Filter

    /**
     * @ets_rewrite_static Filterable from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Filterable: typeof C.Filterable

    /**
     * @ets_rewrite_static FilterableWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FilterableWithIndex: typeof C.FilterableWithIndex

    /**
     * @ets_rewrite_static FilterMap from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FilterMap: typeof C.FilterMap

    /**
     * @ets_rewrite_static FilterMapWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FilterMapWithIndex: typeof C.FilterMapWithIndex

    /**
     * @ets_rewrite_static FilterWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FilterWithIndex: typeof C.FilterWithIndex

    /**
     * @ets_rewrite_static Foldable from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Foldable: typeof C.Foldable

    /**
     * @ets_rewrite_static FoldableWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FoldableWithIndex: typeof C.FoldableWithIndex

    /**
     * @ets_rewrite_static FoldMap from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FoldMap: typeof C.FoldMap

    /**
     * @ets_rewrite_static FoldMapWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    FoldMapWithIndex: typeof C.FoldMapWithIndex

    /**
     * @ets_rewrite_static ForEach from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ForEach: typeof C.ForEach

    /**
     * @ets_rewrite_static forEachF from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    forEachF: typeof C.forEachF

    /**
     * @ets_rewrite_static ForEachWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ForEachWithIndex: typeof C.ForEachWithIndex

    /**
     * @ets_rewrite_static forEachWithIndexF from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    forEachWithIndexF: typeof C.forEachWithIndexF

    /**
     * @ets_rewrite_static from from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    from: typeof C.from

    /**
     * @ets_rewrite_static getEqual from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    getEqual: typeof C.getEqual

    /**
     * @ets_rewrite_static getIdentity from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    getIdentity: typeof C.getIdentity

    /**
     * @ets_rewrite_static getOrd from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    getOrd: typeof C.getOrd

    /**
     * @ets_rewrite_static getShow from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    getShow: typeof C.getShow

    /**
     * @ets_rewrite_static many from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    many: typeof C.many

    /**
     * @ets_rewrite_static Monad from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Monad: typeof C.Monad

    /**
     * @ets_rewrite_static Partition from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Partition: typeof C.Partition

    /**
     * @ets_rewrite_static PartitionMap from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    PartitionMap: typeof C.PartitionMap

    /**
     * @ets_rewrite_static PartitionMapWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    PartitionMapWithIndex: typeof C.PartitionMapWithIndex

    /**
     * @ets_rewrite_static PartitionWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    PartitionWithIndex: typeof C.PartitionWithIndex

    /**
     * @ets_rewrite_static range from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    range: typeof C.range

    /**
     * @ets_rewrite_static Reduce from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Reduce: typeof C.Reduce

    /**
     * @ets_rewrite_static ReduceRight from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ReduceRight: typeof C.ReduceRight

    /**
     * @ets_rewrite_static ReduceRightWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ReduceRightWithIndex: typeof C.ReduceRightWithIndex

    /**
     * @ets_rewrite_static ReduceWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    ReduceWithIndex: typeof C.ReduceWithIndex

    /**
     * @ets_rewrite_static Separate from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Separate: typeof C.Separate

    /**
     * @ets_rewrite_static separateF from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    separateF: typeof C.separateF

    /**
     * @ets_rewrite_static single from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    single: typeof C.single

    /**
     * @ets_rewrite_static unfold_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unfold: typeof C.unfold

    /**
     * @ets_rewrite_static unfoldM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unfoldM: typeof C.unfoldM

    /**
     * @ets_rewrite_static uniq from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    uniq: typeof C.uniq

    /**
     * @ets_rewrite_static unit from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unit: typeof C.unit

    /**
     * @ets_rewrite_static Wiltable from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Wiltable: typeof C.Wiltable

    /**
     * @ets_rewrite_static WiltableWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    WiltableWithIndex: typeof C.WiltableWithIndex

    /**
     * @ets_rewrite_static Witherable from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    Witherable: typeof C.Witherable

    /**
     * @ets_rewrite_static WitherableWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    WitherableWithIndex: typeof C.WitherableWithIndex
  }

  interface Chunk<A> extends ChunkOps {}

  interface ChunkOps {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method append_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    append<A, A1>(this: Chunk<A>, a: A1): Chunk<A | A1>

    /**
     * @ets_rewrite_method buckets from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    buckets<A>(this: Chunk<A>): Iterable<ArrayLike<A>>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    chain<A, B>(this: Chunk<A>, f: (a: A) => Chunk<B>): Chunk<B>

    /**
     * @ets_rewrite_method collectM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    collectM<A, R, E, B>(
      this: Chunk<A>,
      f: (a: A) => Option<T.Effect<R, E, B>>
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_method collectWhileM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    collectWhileM<A, R, E, B>(
      this: Chunk<A>,
      f: (a: A) => Option<T.Effect<R, E, B>>
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_method compact from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    compact<A>(fa: Chunk<Option<A>>): Chunk<A>

    /**
     * @ets_rewrite_method concat_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    concat<A, A1>(this: Chunk<A>, that: Chunk<A1>): Chunk<A | A1>

    /**
     * @ets_rewrite_method corresponds_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    corresponds<A, B>(
      this: Chunk<A>,
      that: Chunk<B>,
      f: (a: A, b: B) => boolean
    ): boolean

    /**
     * @ets_rewrite_method difference_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    difference<A>(this: Chunk<A>, E: Equal<A>, ys: Chunk<A>): Chunk<A>

    /**
     * @ets_rewrite_method drop_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    drop<A>(this: Chunk<A>, n: number): Chunk<A>

    /**
     * @ets_rewrite_method dropWhile_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    dropWhile<A>(this: Chunk<A>, f: (a: A) => boolean): Chunk<A>

    /**
     * @ets_rewrite_method dropWhileM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    dropWhileM_<R, E, A>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, boolean>
    ): T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_method elem_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    elem<A>(this: Chunk<A>, E: Equal<A>, a: A): boolean

    /**
     * @ets_rewrite_method equals from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    equals<A, B>(this: Chunk<A>, that: Chunk<B>): boolean

    /**
     * @ets_rewrite_method every_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    every<A>(this: Chunk<A>, f: (a: A) => boolean): boolean

    /**
     * @ets_rewrite_method exists_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    exists<A>(this: Chunk<A>, f: (a: A) => boolean): boolean

    /**
     * @ets_rewrite_method filter_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    filter<A, B extends A>(this: Chunk<A>, f: F.Refinement<A, B>): Chunk<B>

    /**
     * @ets_rewrite_method filter_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    filter<A>(this: Chunk<A>, f: F.Predicate<A>): Chunk<A>

    /**
     * @ets_rewrite_method filterM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    filterM<R, E, A>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, boolean>
    ): T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_method filterMap_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    filterMap<A, B>(this: Chunk<A>, f: (a: A) => Option<B>): Chunk<B>

    /**
     * @ets_rewrite_method find_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    find<A, B extends A>(this: Chunk<A>, f: F.Refinement<A, B>): Option<B>

    /**
     * @ets_rewrite_method find_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    find<A>(this: Chunk<A>, f: F.Predicate<A>): Option<A>

    /**
     * @ets_rewrite_method findM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    findM<R, E, A>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, boolean>
    ): T.Effect<R, E, Option<A>>

    /**
     * @ets_rewrite_method flatten from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    flatten<A>(this: Chunk<Chunk<A>>): Chunk<A>

    /**
     * @ets_rewrite_method forEach_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    forEach<A, U>(this: Chunk<A>, f: (a: A) => U): void

    /**
     * @ets_rewrite_method foldMap_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    foldMap<M, A>(this: Chunk<A>, M: Identity<M>, f: (a: A) => M): M

    /**
     * @ets_rewrite_method foldMapWithIndex_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    foldMapWithIndex_<M, A>(
      this: Chunk<A>,
      M: Identity<M>,
      f: (i: number, a: A) => M
    ): M

    /**
     * @ets_rewrite_method forEachF_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    forEachF<A, G extends HKT.URIS, GC, GK>(
      this: Chunk<A>,
      G: HKT.IdentityBoth<G, GC> & HKT.Covariant<G, GC>
    ): <GQ, GW, GX, GI, GS, GR, GE, B>(
      f: (a: A) => HKT.Kind<G, GC, GK, GQ, GW, GX, GI, GS, GR, GE, B>
    ) => HKT.Kind<G, GC, GK, GQ, GW, GX, GI, GS, GR, GE, Chunk<B>>

    /**
     * @ets_rewrite_method get_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    get<A>(this: Chunk<A>, n: number): Option<A>

    /**
     * @ets_rewrite_method grouped_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    grouped<A>(this: Chunk<A>, n: number): Chunk<Chunk<A>>

    /**
     * @ets_rewrite_method head from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    head<A>(this: Chunk<A>): Option<A>

    /**
     * @ets_rewrite_method indexWhere_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    indexWhere<A>(this: Chunk<A>, f: (a: A) => boolean): number

    /**
     * @ets_rewrite_method indexWhereFrom_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    indexWhereFrom_<A>(this: Chunk<A>, from: number, f: (a: A) => boolean): number

    /**
     * @ets_rewrite_method intersection_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    intersection<A>(this: Chunk<A>, E: Equal<A>, ys: Chunk<A>): Chunk<A>

    /**
     * @ets_rewrite_method isEmpty from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    isEmpty<A>(this: Chunk<A>): boolean

    /**
     * @ets_rewrite_method join_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    join(this: Chunk<string>, sep: string): string

    /**
     * @ets_rewrite_method last from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    last<A>(this: Chunk<A>): Option<A>

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    map<A, B>(this: Chunk<A>, f: (a: A) => B): Chunk<B>

    /**
     * @ets_rewrite_method mapAccum_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapAccum<A, B, S>(
      this: Chunk<A>,
      s: S,
      f: (s: S, a: A) => Tuple<[S, B]>
    ): Tuple<[S, Chunk<B>]>

    /**
     * @ets_rewrite_method mapAccumM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapAccumM<A, B, R, E, S>(
      this: Chunk<A>,
      s: S,
      f: (s: S, a: A) => T.Effect<R, E, Tuple<[S, B]>>
    ): T.Effect<R, E, Tuple<[S, Chunk<B>]>>

    /**
     * @ets_rewrite_method mapM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapM<R, E, A, B>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_method mapMPar_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapMPar<R, E, A, B>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_method mapMParN_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapMParN<A, R, E, B>(
      this: Chunk<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, Chunk<B>>

    /**
     * @ets_rewrite_method mapMUnit_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapMUnit<A, R, E, B>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method mapMUnitPar_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapMUnitPar<A, R, E, B>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method mapMUnitParN_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    mapMUnitParN<A, R, E, B>(
      this: Chunk<A>,
      n: number,
      f: (a: A) => T.Effect<R, E, B>
    ): T.Effect<R, E, void>

    /**
     * @ets_rewrite_method partition_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    partition<A>(
      this: Chunk<A>,
      predicate: F.Predicate<A>
    ): Separated<Chunk<A>, Chunk<A>>

    /**
     * @ets_rewrite_method partitionMap_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    partitionMap<A, B, C>(
      this: Chunk<A>,
      f: (a: A) => Either<B, C>
    ): Separated<Chunk<B>, Chunk<C>>

    /**
     * @ets_rewrite_method partitionMapWithIndex_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    partitionMapWithIndex<A, B, C>(
      this: Chunk<A>,
      f: (i: number, a: A) => Either<B, C>
    ): Separated<Chunk<B>, Chunk<C>>

    /**
     * @ets_rewrite_method partitionWithIndex_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    partitionWithIndex<A>(
      this: Chunk<A>,
      predicateWithIndex: PredicateWithIndex<number, A>
    ): Separated<Chunk<A>, Chunk<A>>

    /**
     * @ets_rewrite_method prepend_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    prepend<A, A1>(this: Chunk<A>, a: A1): Chunk<A | A1>

    /**
     * @ets_rewrite_method reduce_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduce<A, S>(this: Chunk<A>, s: S, f: (s: S, a: A) => S): S

    /**
     * @ets_rewrite_method reduceM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduceM<A, R, E, S>(
      this: Chunk<A>,
      s: S,
      f: (s: S, a: A) => T.Effect<R, E, S>
    ): T.Effect<R, E, S>

    /**
     * @ets_rewrite_method reduceRight_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduceRight<A, S>(this: Chunk<A>, s: S, f: (a: A, s: S) => S): S

    /**
     * @ets_rewrite_method reduceRightM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduceRightM<A, R, E, S>(
      this: Chunk<A>,
      s: S,
      f: (a: A, s: S) => T.Effect<R, E, S>
    ): T.Effect<R, E, S>

    /**
     * @ets_rewrite_method reduceWhile_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduceWhile<A, S>(
      this: Chunk<A>,
      s: S,
      pred: (s: S) => boolean,
      f: (s: S, a: A) => S
    ): S

    /**
     * @ets_rewrite_method reduceWhileM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reduceWhileM<A, R, E, S>(
      this: Chunk<A>,
      s: S,
      pred: (s: S) => boolean,
      f: (s: S, a: A) => T.Effect<R, E, S>
    ): T.Effect<R, E, S>

    /**
     * @ets_rewrite_method reverse from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reverse<A>(this: Chunk<A>): Iterable<A>

    /**
     * @ets_rewrite_method reverseBuckets from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    reverseBuckets<A>(this: Chunk<A>): Iterable<ArrayLike<A>>

    /**
     * @ets_rewrite_method separate from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    separate<B, C>(this: Chunk<Either<B, C>>): Separated<Chunk<B>, Chunk<C>>

    // TODO separateF/separateWithIndexF

    /**
     * @ets_rewrite_method sort_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    sort<A>(this: Chunk<A>, O: Ord<A>): Chunk<A>

    /**
     * @ets_rewrite_method sortBy_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    sortBy<A>(this: Chunk<A>, ords: Array<Ord<A>>): Chunk<A>

    /**
     * @ets_rewrite_method split_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    split<A>(this: Chunk<A>, n: number): Chunk<Chunk<A>>

    /**
     * @ets_rewrite_method splitAt_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    splitAt<A>(this: Chunk<A>, n: number): Tuple<[Chunk<A>, Chunk<A>]>

    /**
     * @ets_rewrite_method splitWhere_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    splitWhere<A>(this: Chunk<A>, f: (a: A) => boolean): Tuple<[Chunk<A>, Chunk<A>]>

    /**
     * @ets_rewrite_method tail from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    tail<A>(this: Chunk<A>): Option<Chunk<A>>

    /**
     * @ets_rewrite_method take_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    take<A>(this: Chunk<A>, n: number): Chunk<A>

    /**
     * @ets_rewrite_method takeWhile_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    takeWhile<A>(this: Chunk<A>, f: (a: A) => boolean): Chunk<A>

    /**
     * @ets_rewrite_method takeWhileM_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    takeWhileM<R, E, A>(
      this: Chunk<A>,
      f: (a: A) => T.Effect<R, E, boolean>
    ): T.Effect<R, E, Chunk<A>>

    /**
     * @ets_rewrite_method toArray from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    toArray<A>(this: Chunk<A>): A.Array<A>

    /**
     * @ets_rewrite_method toArrayLike from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    toArrayLike<A>(this: Chunk<A>): ArrayLike<A>

    /**
     * @ets_rewrite_method union_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    union<A>(this: Chunk<A>, E: Equal<A>, ys: Chunk<A>): Chunk<A>

    /**
     * @ets_rewrite_method uniq_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    uniq<A>(this: Chunk<A>, E: Equal<A>): Chunk<A>

    /**
     * @ets_rewrite_method unsafeGet_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unsafeGet<A>(this: Chunk<A>, n: number): A

    /**
     * @ets_rewrite_method unsafeHead from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unsafeHead<A>(this: Chunk<A>): A

    /**
     * @ets_rewrite_method unsafeLast from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unsafeLast<A>(this: Chunk<A>): A

    /**
     * @ets_rewrite_method unsafeLast from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unsafeTail<A>(this: Chunk<A>): Chunk<A>

    /**
     * @ets_rewrite_method unzip from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    unzip<A, B>(this: Chunk<Tuple<[A, B]>>): Tuple<[Chunk<A>, Chunk<B>]>

    /**
     * @ets_rewrite_method zip_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zip<A, B>(this: Chunk<A>, that: Chunk<B>): Chunk<Tuple<[A, B]>>

    /**
     * @ets_rewrite_method zipAll_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zipAll<A, B>(this: Chunk<A>, that: Chunk<B>): Chunk<Tuple<[Option<A>, Option<B>]>>

    /**
     * @ets_rewrite_method zipAllWith_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zipAllWith<A, B, C, D, E>(
      this: Chunk<A>,
      that: Chunk<B>,
      f: (a: A, b: B) => C,
      left: (a: A) => D,
      right: (b: B) => E
    ): Chunk<C | D | E>

    /**
     * @ets_rewrite_method zipWith_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zipWith<A, B, C>(this: Chunk<A>, that: Chunk<B>, f: (a: A, b: B) => C): Chunk<C>

    /**
     * @ets_rewrite_method zipWithIndex from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zipWithIndex<A>(this: Chunk<A>): Chunk<Tuple<[A, number]>>

    /**
     * @ets_rewrite_method zipWithIndexOffset_ from "@effect-ts/core/Collections/Immutable/Chunk"
     */
    zipWithIndexOffset<A>(this: Chunk<A>, offset: number): Chunk<Tuple<[A, number]>>
  }
}
