/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static fp-ts/data/Chunk.Ops findFirstMap
 * @tsplus pipeable fp-ts/data/Chunk findFirstMap
 */
export function findFirstMap<A, B>(
  f: (a: A) => Opt<B>
) {
  return (as: Chunk<A>) => {
    const ass = as.toReadonlyArray()
    const len = ass.length
    for (let i = 0; i < len; i++) {
      const v = f(ass[i]!)
      if (v.isSome()) {
        return v
      }
    }
    return Opt.none
  }
}

/**
 * @tsplus getter fp-ts/data/Chunk toArray
 */
export function toArray<T>(c: Chunk<T>) {
  return c.toReadonlyArray()
}
