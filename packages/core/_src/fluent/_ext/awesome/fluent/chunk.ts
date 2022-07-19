/* eslint-disable @typescript-eslint/no-namespace */

import {
  Any,
  append_,
  Applicative,
  ApplyZip,
  AssociativeBothZip,
  AssociativeFlatten,
  BreadthFirstChainRec,
  breadthFirstChainRec,
  buckets,
  builder,
  chain_,
  collect_,
  collectEffect_,
  Collection,
  collectWhileEffect_,
  Compact,
  compact,
  compactF,
  compactWithIndexF,
  concat_,
  corresponds_,
  Covariant,
  DepthFirstChainRec,
  depthFirstChainRec,
  difference_,
  drop_,
  dropWhile_,
  dropWhileEffect_,
  elem_,
  empty,
  equals,
  //every_,
  exists_,
  Extend,
  fill,
  Filter,
  filter_,
  Filterable,
  FilterableWithIndex,
  filterEffect_,
  FilterMap,
  FilterMapWithIndex,
  FilterWithIndex,
  find_,
  findEffect_,
  flatten,
  Foldable,
  FoldableWithIndex,
  FoldMap,
  foldMap_,
  FoldMapWithIndex,
  foldMapWithIndex_,
  ForEach,
  forEach_,
  forEachF,
  forEachF_,
  ForEachWithIndex,
  forEachWithIndexF,
  from,
  get_,
  getEqual,
  getIdentity,
  getOrd,
  getShow,
  grouped_,
  head,
  indexWhere_,
  indexWhereFrom_,
  intersection_,
  isEmpty,
  join_,
  last,
  map_,
  mapAccum_,
  mapAccumEffect_,
  mapEffect_,
  mapEffectPar_,
  //mapEffectParN_,
  mapEffectUnit_,
  mapEffectUnitPar_,
  mapEffectUnitParN_,
  Monad,
  Partition,
  partition_,
  PartitionMap,
  partitionMap_,
  PartitionMapWithIndex,
  partitionMapWithIndex_,
  PartitionWithIndex,
  partitionWithIndex_,
  prepend_,
  range,
  Reduce,
  reduce_,
  reduceEffect_,
  ReduceRight,
  reduceRight_,
  reduceRightEffect_,
  ReduceRightWithIndex,
  reduceWhile_,
  reduceWhileEffect_,
  ReduceWithIndex,
  reverse,
  reverseBuckets,
  Separate,
  separate,
  separateF,
  single,
  sort_,
  sortBy_,
  split_,
  splitAt_,
  splitWhere_,
  tail,
  take_,
  takeWhile_,
  takeWhileEffect_,
  toArray,
  toArrayLike,
  unfold,
  unfoldEffect,
  union_,
  uniq,
  uniq_,
  unit,
  unsafeGet_,
  unsafeHead,
  unsafeLast,
  unzip,
  Wiltable,
  WiltableWithIndex,
  Witherable,
  zip_,
  zipAll_,
  zipAllWith_,
  zipWith_,
  zipWithIndex,
  zipWithIndexOffset_,
} from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Chunk.Ops Any
 */
export const ext_Any = Any

/**
 * @tsplus static ets/Chunk.Ops Applicative
 */
export const ext_Applicative = Applicative

/**
 * @tsplus static ets/Chunk.Ops ApplyZip
 */
export const ext_ApplyZip = ApplyZip

/**
 * @tsplus static ets/Chunk.Ops AssociativeBothZip
 */
export const ext_AssociativeBothZip = AssociativeBothZip

/**
 * @tsplus static ets/Chunk.Ops AssociativeFlatten
 */
export const ext_AssociativeFlatten = AssociativeFlatten

/**
 * @tsplus static ets/Chunk.Ops BreadthFirstChainRec
 */
export const ext_BreadthFirstChainRec = BreadthFirstChainRec

/**
 * @tsplus static ets/Chunk.Ops breadthFirstChainRec
 */
export const ext_breadthFirstChainRec = breadthFirstChainRec

/**
 * @tsplus static ets/Chunk.Ops builder
 */
export const ext_builder = builder

/**
 * @tsplus static ets/Chunk.Ops Collection
 */
export const ext_Collection = Collection

/**
 * @tsplus static ets/Chunk.Ops Compact
 */
export const ext_Compact = Compact

/**
 * @tsplus static ets/Chunk.Ops compactF
 */
export const ext_compactF = compactF

/**
 * @tsplus static ets/Chunk.Ops compactWithIndexF
 */
export const ext_compactWithIndexF = compactWithIndexF

/**
 * @tsplus static ets/Chunk.Ops Covariant
 */
export const ext_Covariant = Covariant

/**
 * @tsplus static ets/Chunk.Ops DepthFirstChainRec
 */
export const ext_DepthFirstChainRec = DepthFirstChainRec

/**
 * @tsplus static ets/Chunk.Ops depthFirstChainRec
 */
export const ext_depthFirstChainRec = depthFirstChainRec

/**
 * @tsplus static ets/Chunk.Ops empty
 */
export const ext_empty = empty

/**
 * @tsplus static ets/Chunk.Ops Extend
 */
export const ext_Extend = Extend

/**
 * @tsplus static ets/Chunk.Ops fill
 */
export const ext_fill = fill

/**
 * @tsplus static ets/Chunk.Ops Filter
 */
export const ext_Filter = Filter

/**
 * @tsplus static ets/Chunk.Ops Filterable
 */
export const ext_Filterable = Filterable

/**
 * @tsplus static ets/Chunk.Ops FilterableWithIndex
 */
export const ext_FilterableWithIndex = FilterableWithIndex

/**
 * @tsplus static ets/Chunk.Ops FilterMap
 */
export const ext_FilterMap = FilterMap

/**
 * @tsplus static ets/Chunk.Ops FilterMapWithIndex
 */
export const ext_FilterMapWithIndex = FilterMapWithIndex

/**
 * @tsplus static ets/Chunk.Ops FilterWithIndex
 */
export const ext_FilterWithIndex = FilterWithIndex

/**
 * @tsplus static ets/Chunk.Ops Foldable
 */
export const ext_Foldable = Foldable

/**
 * @tsplus static ets/Chunk.Ops FoldableWithIndex
 */
export const ext_FoldableWithIndex = FoldableWithIndex

/**
 * @tsplus static ets/Chunk.Ops FoldMap
 */
export const ext_FoldMap = FoldMap

/**
 * @tsplus static ets/Chunk.Ops FoldMapWithIndex
 */
export const ext_FoldMapWithIndex = FoldMapWithIndex

/**
 * @tsplus static ets/Chunk.Ops ForEach
 */
export const ext_ForEach = ForEach

/**
 * @tsplus static ets/Chunk.Ops forEachF
 */
export const ext_forEachF = forEachF

/**
 * @tsplus static ets/Chunk.Ops ForEachWithIndex
 */
export const ext_ForEachWithIndex = ForEachWithIndex

/**
 * @tsplus static ets/Chunk.Ops forEachWithIndexF
 */
export const ext_forEachWithIndexF = forEachWithIndexF

/**
 * @tsplus static ets/Chunk.Ops from
 */
export const ext_from = from

/**
 * @tsplus static ets/Chunk.Ops getEqual
 */
export const ext_getEqual = getEqual

/**
 * @tsplus static ets/Chunk.Ops getIdentity
 */
export const ext_getIdentity = getIdentity

/**
 * @tsplus static ets/Chunk.Ops getOrd
 */
export const ext_getOrd = getOrd

/**
 * @tsplus static ets/Chunk.Ops getShow
 */
export const ext_getShow = getShow

// /**
//  * @tsplus static ets/Chunk.Ops many
//  */
// export const ext_many = many

/**
 * @tsplus static ets/Chunk.Ops Monad
 */
export const ext_Monad = Monad

/**
 * @tsplus static ets/Chunk.Ops Partition
 */
export const ext_Partition = Partition

/**
 * @tsplus static ets/Chunk.Ops PartitionMap
 */
export const ext_PartitionMap = PartitionMap

/**
 * @tsplus static ets/Chunk.Ops PartitionMapWithIndex
 */
export const ext_PartitionMapWithIndex = PartitionMapWithIndex

/**
 * @tsplus static ets/Chunk.Ops PartitionWithIndex
 */
export const ext_PartitionWithIndex = PartitionWithIndex

/**
 * @tsplus static ets/Chunk.Ops range
 */
export const ext_range = range

/**
 * @tsplus static ets/Chunk.Ops Reduce
 */
export const ext_Reduce = Reduce

/**
 * @tsplus static ets/Chunk.Ops ReduceRight
 */
export const ext_ReduceRight = ReduceRight

/**
 * @tsplus static ets/Chunk.Ops ReduceRightWithIndex
 */
export const ext_ReduceRightWithIndex = ReduceRightWithIndex

/**
 * @tsplus static ets/Chunk.Ops ReduceWithIndex
 */
export const ext_ReduceWithIndex = ReduceWithIndex

/**
 * @tsplus static ets/Chunk.Ops Separate
 */
export const ext_Separate = Separate

/**
 * @tsplus static ets/Chunk.Ops separateF
 */
export const ext_separateF = separateF

/**
 * @tsplus static ets/Chunk.Ops single
 */
export const ext_single = single

/**
 * @tsplus static ets/Chunk.Ops unfold
 */
export const ext_unfold_ = unfold

/**
 * @tsplus static ets/Chunk.Ops unfoldEffect
 */
export const ext_unfoldEffect = unfoldEffect

/**
 * @tsplus static ets/Chunk.Ops uniq
 */
export const ext_uniq = uniq

/**
 * @tsplus static ets/Chunk.Ops unit
 */
export const ext_unit = unit

/**
 * @tsplus static ets/Chunk.Ops Wiltable
 */
export const ext_Wiltable = Wiltable

/**
 * @tsplus static ets/Chunk.Ops WiltableWithIndex
 */
export const ext_WiltableWithIndex = WiltableWithIndex

/**
 * @tsplus static ets/Chunk.Ops Witherable
 */
export const ext_Witherable = Witherable

/**
 * @tsplus fluent ets/Chunk append
 */
export const ext_append_ = append_

/**
 * @tsplus fluent ets/Chunk buckets
 */
export const ext_buckets = buckets

/**
 * @tsplus fluent ets/Chunk flatMap
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Chunk collectEffect
 */
export const ext_collectEffect_ = collectEffect_

/**
 * @tsplus fluent ets/Chunk collectWhileEffect
 */
export const ext_collectWhileEffect_ = collectWhileEffect_

/**
 * @tsplus fluent ets/Chunk compact
 */
export const ext_compact = compact

/**
 * @tsplus fluent ets/Chunk concat
 */
export const ext_concat_ = concat_

/**
 * @tsplus fluent ets/Chunk corresponds
 */
export const ext_corresponds_ = corresponds_

/**
 * @tsplus fluent ets/Chunk difference
 */
export const ext_difference_ = difference_

/**
 * @tsplus fluent ets/Chunk drop
 */
export const ext_drop_ = drop_

/**
 * @tsplus fluent ets/Chunk dropWhile
 */
export const ext_dropWhile_ = dropWhile_

/**
 * @tsplus fluent ets/Chunk dropWhileEffect_
 */
export const ext_dropWhileEffect_ = dropWhileEffect_

/**
 * @tsplus fluent ets/Chunk elem
 */
export const ext_elem_ = elem_

/**
 * @tsplus fluent ets/Chunk equals
 */
export const ext_equals = equals

// /**
//  * @tsplus fluent ets/Chunk every
//  */
// export const ext_every_ = every_

/**
 * @tsplus fluent ets/Chunk exists
 */
export const ext_exists_ = exists_

/**
 * @tsplus fluent ets/Chunk filter
 */
export const ext_filter_ = filter_

// /**
//  * @tsplus fluent ets/Chunk filter
//  */
// export const ext_filter_ = filter_

/**
 * @tsplus fluent ets/Chunk filterEffect
 */
export const ext_filterEffect_ = filterEffect_

/**
 * @tsplus fluent ets/Chunk filterEffectap
 */
export const ext_collect_ = collect_

/**
 * @tsplus fluent ets/Chunk find
 */
export const ext_find_ = find_

// /**
//  * @tsplus fluent ets/Chunk find
//  */
// export const ext_find_ = find_

/**
 * @tsplus fluent ets/Chunk findEffect
 */
export const ext_findEffect_ = findEffect_

/**
 * @tsplus fluent ets/Chunk flatten
 */
export const ext_flatten = flatten

/**
 * @tsplus fluent ets/Chunk forEach
 */
export const ext_forEach_ = forEach_

/**
 * @tsplus fluent ets/Chunk foldMap
 */
export const ext_foldMap_ = foldMap_

/**
 * @tsplus fluent ets/Chunk foldMapWithIndex_
 */
export const ext_foldMapWithIndex_ = foldMapWithIndex_

/**
 * @tsplus fluent ets/Chunk forEachF
 */
export const ext_forEachF_ = forEachF_

/**
 * @tsplus fluent ets/Chunk get
 */
export const ext_get_ = get_

/**
 * @tsplus fluent ets/Chunk grouped
 */
export const ext_grouped_ = grouped_

/**
 * @tsplus fluent ets/Chunk head
 */
export const ext_head = head

/**
 * @tsplus fluent ets/Chunk indexWhere
 */
export const ext_indexWhere_ = indexWhere_

/**
 * @tsplus fluent ets/Chunk indexWhereFrom_
 */
export const ext_indexWhereFrom_ = indexWhereFrom_

/**
 * @tsplus fluent ets/Chunk intersection
 */
export const ext_intersection_ = intersection_

/**
 * @tsplus fluent ets/Chunk isEmpty
 */
export const ext_isEmpty = isEmpty

/**
 * @tsplus fluent ets/Chunk join
 */
export const ext_join_ = join_

/**
 * @tsplus fluent ets/Chunk last
 */
export const ext_last = last

/**
 * @tsplus fluent ets/Chunk map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Chunk mapAccum
 */
export const ext_mapAccum_ = mapAccum_

/**
 * @tsplus fluent ets/Chunk mapAccumEffect
 */
export const ext_mapAccumEffect_ = mapAccumEffect_

/**
 * @tsplus fluent ets/Chunk mapEffect
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/Chunk mapEffectPar
 */
export const ext_mapEffectPar_ = mapEffectPar_

// /**
//  * @tsplus fluent ets/Chunk mapEffectParN
//  */
// export const ext_mapEffectParN_ = mapEffectParN_

/**
 * @tsplus fluent ets/Chunk mapEffectUnit
 */
export const ext_mapEffectUnit_ = mapEffectUnit_

/**
 * @tsplus fluent ets/Chunk mapEffectUnitPar
 */
export const ext_mapEffectUnitPar_ = mapEffectUnitPar_

/**
 * @tsplus fluent ets/Chunk mapEffectUnitParN
 */
export const ext_mapEffectUnitParN_ = mapEffectUnitParN_

/**
 * @tsplus fluent ets/Chunk partition
 */
export const ext_partition_ = partition_

/**
 * @tsplus fluent ets/Chunk partitionMap
 */
export const ext_partitionMap_ = partitionMap_

/**
 * @tsplus fluent ets/Chunk partitionMapWithIndex
 */
export const ext_partitionMapWithIndex_ = partitionMapWithIndex_

/**
 * @tsplus fluent ets/Chunk partitionWithIndex
 */
export const ext_partitionWithIndex_ = partitionWithIndex_

/**
 * @tsplus fluent ets/Chunk prepend
 */
export const ext_prepend_ = prepend_

/**
 * @tsplus fluent ets/Chunk reduce
 */
export const ext_reduce_ = reduce_

/**
 * @tsplus fluent ets/Chunk reduceEffect
 */
export const ext_reduceEffect_ = reduceEffect_

/**
 * @tsplus fluent ets/Chunk reduceRight
 */
export const ext_reduceRight_ = reduceRight_

/**
 * @tsplus fluent ets/Chunk reduceRightEffect
 */
export const ext_reduceRightEffect_ = reduceRightEffect_

/**
 * @tsplus fluent ets/Chunk reduceWhile
 */
export const ext_reduceWhile_ = reduceWhile_

/**
 * @tsplus fluent ets/Chunk reduceWhileEffect
 */
export const ext_reduceWhileEffect_ = reduceWhileEffect_

/**
 * @tsplus fluent ets/Chunk reverse
 */
export const ext_reverse = reverse

/**
 * @tsplus fluent ets/Chunk reverseBuckets
 */
export const ext_reverseBuckets = reverseBuckets

/**
 * @tsplus fluent ets/Chunk separate
 */
export const ext_separate = separate

/**
 * @tsplus fluent ets/Chunk sort
 */
export const ext_sort_ = sort_

/**
 * @tsplus fluent ets/Chunk sortBy
 */
export const ext_sortBy_ = sortBy_

/**
 * @tsplus fluent ets/Chunk split
 */
export const ext_split_ = split_

/**
 * @tsplus fluent ets/Chunk splitAt
 */
export const ext_splitAt_ = splitAt_

/**
 * @tsplus fluent ets/Chunk splitWhere
 */
export const ext_splitWhere_ = splitWhere_

/**
 * @tsplus fluent ets/Chunk tail
 */
export const ext_tail = tail

/**
 * @tsplus fluent ets/Chunk take
 */
export const ext_take_ = take_

/**
 * @tsplus fluent ets/Chunk takeWhile
 */
export const ext_takeWhile_ = takeWhile_

/**
 * @tsplus fluent ets/Chunk takeWhileEffect
 */
export const ext_takeWhileEffect_ = takeWhileEffect_

/**
 * @tsplus fluent ets/Chunk toArray
 */
export const ext_toArray = toArray

/**
 * @tsplus fluent ets/Chunk toArrayLike
 */
export const ext_toArrayLike = toArrayLike

/**
 * @tsplus fluent ets/Chunk union
 */
export const ext_union_ = union_

/**
 * @tsplus fluent ets/Chunk uniq
 */
export const ext_uniq_ = uniq_

/**
 * @tsplus fluent ets/Chunk unsafeGet
 */
export const ext_unsafeGet_ = unsafeGet_

/**
 * @tsplus fluent ets/Chunk unsafeHead
 */
export const ext_unsafeHead = unsafeHead

// /**
//  * @tsplus fluent ets/Chunk unsafeLast
//  */
// export const ext_unsafeLast = unsafeLast

/**
 * @tsplus fluent ets/Chunk unsafeTail
 */
export const ext_unsafeLast = unsafeLast

/**
 * @tsplus fluent ets/Chunk unzip
 */
export const ext_unzip = unzip

/**
 * @tsplus fluent ets/Chunk zip
 */
export const ext_zip_ = zip_

/**
 * @tsplus fluent ets/Chunk zipAll
 */
export const ext_zipAll_ = zipAll_

/**
 * @tsplus fluent ets/Chunk zipAllWith
 */
export const ext_zipAllWith_ = zipAllWith_

/**
 * @tsplus fluent ets/Chunk zipWith
 */
export const ext_zipWith_ = zipWith_

/**
 * @tsplus fluent ets/Chunk zipWithIndex
 */
export const ext_zipWithIndex = zipWithIndex

/**
 * @tsplus fluent ets/Chunk zipWithIndexOffset
 */
export const ext_zipWithIndexOffset_ = zipWithIndexOffset_
