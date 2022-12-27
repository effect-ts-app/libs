/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static fp-ts/data/Chunk.Ops findFirstMap
 * @tsplus pipeable fp-ts/data/Chunk findFirstMap
 */
export function findFirstMap<A, B>(f: (a: A) => Opt<B>): (self: Chunk<A>) => Opt<B> {
  return (self: Chunk<A>): Opt<B> => self.findFirst((a): a is B => f(a).isSome())
}