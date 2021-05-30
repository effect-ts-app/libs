import * as D from "@effect-ts/core/Collections/Immutable/Dictionary"

export const { collect, collect_ } = D

export const map_ = <TIn, TOut, T extends D.Dictionary<TIn>>(
  fa: T & D.Dictionary<TIn>,
  f: (a: TIn) => TOut
) => D.map_(fa, f) as { [P in keyof T]: TOut }
export const mapWithIndex_ = <TIn, TOut, T extends D.Dictionary<TIn>>(
  fa: T & D.Dictionary<TIn>,
  f: (i: keyof T, a: TIn) => TOut
) => D.mapWithIndex_(fa, f) as { [P in keyof T]: TOut }

export const map =
  <TIn, TOut, T extends D.Dictionary<TIn>>(f: (a: TIn) => TOut) =>
  (fa: T & D.Dictionary<TIn>) =>
    map_<TIn, TOut, T>(fa, f)

export const mapWithIndex =
  <TIn, TOut, T extends D.Dictionary<TIn>>(f: (i: keyof T, a: TIn) => TOut) =>
  (fa: T & D.Dictionary<TIn>) =>
    mapWithIndex_<TIn, TOut, T>(fa, f)
