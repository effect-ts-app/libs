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
import { Any } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Any
 */
export const ext_Any = Any

import { Applicative } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Applicative
 */
export const ext_Applicative = Applicative

import { ApplyZip } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ApplyZip
 */
export const ext_ApplyZip = ApplyZip

import { AssociativeBothZip } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops AssociativeBothZip
 */
export const ext_AssociativeBothZip = AssociativeBothZip

import { AssociativeFlatten } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops AssociativeFlatten
 */
export const ext_AssociativeFlatten = AssociativeFlatten

import { BreadthFirstChainRec } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops BreadthFirstChainRec
 */
export const ext_BreadthFirstChainRec = BreadthFirstChainRec

import { breadthFirstChainRec } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops breadthFirstChainRec
 */
export const ext_breadthFirstChainRec = breadthFirstChainRec

import { builder } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops builder
 */
export const ext_builder = builder

import { Collection } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Collection
 */
export const ext_Collection = Collection

import { Compact } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Compact
 */
export const ext_Compact = Compact

import { compactF } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops compactF
 */
export const ext_compactF = compactF

import { compactWithIndexF } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops compactWithIndexF
 */
export const ext_compactWithIndexF = compactWithIndexF

import { Covariant } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Covariant
 */
export const ext_Covariant = Covariant

import { DepthFirstChainRec } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops DepthFirstChainRec
 */
export const ext_DepthFirstChainRec = DepthFirstChainRec

import { depthFirstChainRec } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops depthFirstChainRec
 */
export const ext_depthFirstChainRec = depthFirstChainRec

import { empty } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops empty
 */
export const ext_empty = empty

import { Extend } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Extend
 */
export const ext_Extend = Extend

import { fill } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops fill
 */
export const ext_fill = fill

import { Filter } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Filter
 */
export const ext_Filter = Filter

import { Filterable } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Filterable
 */
export const ext_Filterable = Filterable

import { FilterableWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FilterableWithIndex
 */
export const ext_FilterableWithIndex = FilterableWithIndex

import { FilterMap } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FilterMap
 */
export const ext_FilterMap = FilterMap

import { FilterMapWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FilterMapWithIndex
 */
export const ext_FilterMapWithIndex = FilterMapWithIndex

import { FilterWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FilterWithIndex
 */
export const ext_FilterWithIndex = FilterWithIndex

import { Foldable } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Foldable
 */
export const ext_Foldable = Foldable

import { FoldableWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FoldableWithIndex
 */
export const ext_FoldableWithIndex = FoldableWithIndex

import { FoldMap } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FoldMap
 */
export const ext_FoldMap = FoldMap

import { FoldMapWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops FoldMapWithIndex
 */
export const ext_FoldMapWithIndex = FoldMapWithIndex

import { ForEach } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ForEach
 */
export const ext_ForEach = ForEach

import { forEachF } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops forEachF
 */
export const ext_forEachF = forEachF

import { ForEachWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ForEachWithIndex
 */
export const ext_ForEachWithIndex = ForEachWithIndex

import { forEachWithIndexF } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops forEachWithIndexF
 */
export const ext_forEachWithIndexF = forEachWithIndexF

import { from } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops from
 */
export const ext_from = from

import { getEqual } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops getEqual
 */
export const ext_getEqual = getEqual

import { getIdentity } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops getIdentity
 */
export const ext_getIdentity = getIdentity

import { getOrd } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops getOrd
 */
export const ext_getOrd = getOrd

import { getShow } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops getShow
 */
export const ext_getShow = getShow

import { many } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops many
 */
export const ext_many = many

import { Monad } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Monad
 */
export const ext_Monad = Monad

import { Partition } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Partition
 */
export const ext_Partition = Partition

import { PartitionMap } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops PartitionMap
 */
export const ext_PartitionMap = PartitionMap

import { PartitionMapWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops PartitionMapWithIndex
 */
export const ext_PartitionMapWithIndex = PartitionMapWithIndex

import { PartitionWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops PartitionWithIndex
 */
export const ext_PartitionWithIndex = PartitionWithIndex

import { range } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops range
 */
export const ext_range = range

import { Reduce } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Reduce
 */
export const ext_Reduce = Reduce

import { ReduceRight } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ReduceRight
 */
export const ext_ReduceRight = ReduceRight

import { ReduceRightWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ReduceRightWithIndex
 */
export const ext_ReduceRightWithIndex = ReduceRightWithIndex

import { ReduceWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops ReduceWithIndex
 */
export const ext_ReduceWithIndex = ReduceWithIndex

import { Separate } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Separate
 */
export const ext_Separate = Separate

import { separateF } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops separateF
 */
export const ext_separateF = separateF

import { single } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops single
 */
export const ext_single = single

import { unfold_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops unfold
 */
export const ext_unfold_ = unfold_

import { unfoldM_ } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops unfoldM
 */
export const ext_unfoldM_ = unfoldM_

import { uniq } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops uniq
 */
export const ext_uniq = uniq

import { unit } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops unit
 */
export const ext_unit = unit

import { Wiltable } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Wiltable
 */
export const ext_Wiltable = Wiltable

import { WiltableWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops WiltableWithIndex
 */
export const ext_WiltableWithIndex = WiltableWithIndex

import { Witherable } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Witherable
 */
export const ext_Witherable = Witherable

import { WitherableWithIndex } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops WitherableWithIndex
 */
export const ext_WitherableWithIndex = WitherableWithIndex

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
