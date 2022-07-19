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
import { append_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk append
 */
export const ext_append_ = append_

import { buckets } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk buckets
 */
export const ext_buckets = buckets

import { chain_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk chain
 */
export const ext_chain_ = chain_

import { collectM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk collectM
 */
export const ext_collectM_ = collectM_

import { collectWhileM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk collectWhileM
 */
export const ext_collectWhileM_ = collectWhileM_

import { compact } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk compact
 */
export const ext_compact = compact

import { concat_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk concat
 */
export const ext_concat_ = concat_

import { corresponds_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk corresponds
 */
export const ext_corresponds_ = corresponds_

import { difference_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk difference
 */
export const ext_difference_ = difference_

import { drop_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk drop
 */
export const ext_drop_ = drop_

import { dropWhile_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk dropWhile
 */
export const ext_dropWhile_ = dropWhile_

import { dropWhileM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk dropWhileM_
 */
export const ext_dropWhileM_ = dropWhileM_

import { elem_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk elem
 */
export const ext_elem_ = elem_

import { equals } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk equals
 */
export const ext_equals = equals

import { every_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk every
 */
export const ext_every_ = every_

import { exists_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk exists
 */
export const ext_exists_ = exists_

import { filter_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk filter
 */
export const ext_filter_ = filter_

import { filter_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk filter
 */
export const ext_filter_ = filter_

import { filterM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk filterM
 */
export const ext_filterM_ = filterM_

import { filterMap_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk filterMap
 */
export const ext_filterMap_ = filterMap_

import { find_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk find
 */
export const ext_find_ = find_

import { find_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk find
 */
export const ext_find_ = find_

import { findM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk findM
 */
export const ext_findM_ = findM_

import { flatten } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk flatten
 */
export const ext_flatten = flatten

import { forEach_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk forEach
 */
export const ext_forEach_ = forEach_

import { foldMap_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk foldMap
 */
export const ext_foldMap_ = foldMap_

import { foldMapWithIndex_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk foldMapWithIndex_
 */
export const ext_foldMapWithIndex_ = foldMapWithIndex_

import { forEachF_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk forEachF
 */
export const ext_forEachF_ = forEachF_

import { get_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk get
 */
export const ext_get_ = get_

import { grouped_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk grouped
 */
export const ext_grouped_ = grouped_

import { head } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk head
 */
export const ext_head = head

import { indexWhere_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk indexWhere
 */
export const ext_indexWhere_ = indexWhere_

import { indexWhereFrom_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk indexWhereFrom_
 */
export const ext_indexWhereFrom_ = indexWhereFrom_

import { intersection_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk intersection
 */
export const ext_intersection_ = intersection_

import { isEmpty } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk isEmpty
 */
export const ext_isEmpty = isEmpty

import { join_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk join
 */
export const ext_join_ = join_

import { last } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk last
 */
export const ext_last = last

import { map_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk map
 */
export const ext_map_ = map_

import { mapAccum_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapAccum
 */
export const ext_mapAccum_ = mapAccum_

import { mapAccumM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapAccumM
 */
export const ext_mapAccumM_ = mapAccumM_

import { mapM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapM
 */
export const ext_mapM_ = mapM_

import { mapMPar_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapMPar
 */
export const ext_mapMPar_ = mapMPar_

import { mapMParN_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapMParN
 */
export const ext_mapMParN_ = mapMParN_

import { mapMUnit_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapMUnit
 */
export const ext_mapMUnit_ = mapMUnit_

import { mapMUnitPar_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapMUnitPar
 */
export const ext_mapMUnitPar_ = mapMUnitPar_

import { mapMUnitParN_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk mapMUnitParN
 */
export const ext_mapMUnitParN_ = mapMUnitParN_

import { partition_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk partition
 */
export const ext_partition_ = partition_

import { partitionMap_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk partitionMap
 */
export const ext_partitionMap_ = partitionMap_

import { partitionMapWithIndex_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk partitionMapWithIndex
 */
export const ext_partitionMapWithIndex_ = partitionMapWithIndex_

import { partitionWithIndex_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk partitionWithIndex
 */
export const ext_partitionWithIndex_ = partitionWithIndex_

import { prepend_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk prepend
 */
export const ext_prepend_ = prepend_

import { reduce_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduce
 */
export const ext_reduce_ = reduce_

import { reduceM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduceM
 */
export const ext_reduceM_ = reduceM_

import { reduceRight_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduceRight
 */
export const ext_reduceRight_ = reduceRight_

import { reduceRightM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduceRightM
 */
export const ext_reduceRightM_ = reduceRightM_

import { reduceWhile_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduceWhile
 */
export const ext_reduceWhile_ = reduceWhile_

import { reduceWhileM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reduceWhileM
 */
export const ext_reduceWhileM_ = reduceWhileM_

import { reverse } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reverse
 */
export const ext_reverse = reverse

import { reverseBuckets } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk reverseBuckets
 */
export const ext_reverseBuckets = reverseBuckets

import { separate } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk separate
 */
export const ext_separate = separate

    // TODO separateF/separateWithIndexF
import { sort_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk sort
 */
export const ext_sort_ = sort_

import { sortBy_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk sortBy
 */
export const ext_sortBy_ = sortBy_

import { split_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk split
 */
export const ext_split_ = split_

import { splitAt_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk splitAt
 */
export const ext_splitAt_ = splitAt_

import { splitWhere_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk splitWhere
 */
export const ext_splitWhere_ = splitWhere_

import { tail } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk tail
 */
export const ext_tail = tail

import { take_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk take
 */
export const ext_take_ = take_

import { takeWhile_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk takeWhile
 */
export const ext_takeWhile_ = takeWhile_

import { takeWhileM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk takeWhileM
 */
export const ext_takeWhileM_ = takeWhileM_

import { toArray } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk toArray
 */
export const ext_toArray = toArray

import { toArrayLike } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk toArrayLike
 */
export const ext_toArrayLike = toArrayLike

import { union_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk union
 */
export const ext_union_ = union_

import { uniq_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk uniq
 */
export const ext_uniq_ = uniq_

import { unsafeGet_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk unsafeGet
 */
export const ext_unsafeGet_ = unsafeGet_

import { unsafeHead } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk unsafeHead
 */
export const ext_unsafeHead = unsafeHead

import { unsafeLast } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk unsafeLast
 */
export const ext_unsafeLast = unsafeLast

import { unsafeLast } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk unsafeTail
 */
export const ext_unsafeLast = unsafeLast

import { unzip } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk unzip
 */
export const ext_unzip = unzip

import { zip_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zip
 */
export const ext_zip_ = zip_

import { zipAll_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zipAll
 */
export const ext_zipAll_ = zipAll_

import { zipAllWith_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zipAllWith
 */
export const ext_zipAllWith_ = zipAllWith_

import { zipWith_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zipWith
 */
export const ext_zipWith_ = zipWith_

import { zipWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zipWithIndex
 */
export const ext_zipWithIndex = zipWithIndex

import { zipWithIndexOffset_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk zipWithIndexOffset
 */
export const ext_zipWithIndexOffset_ = zipWithIndexOffset_
