/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Filter, FilterJoinSelect, PersistenceModelType, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilter, codeFilterJoinSelect, makeETag, makeUpdateETag } from "./utils.js"

export function memFilter<T extends { id: string }>(filter: Filter<T>, cursor?: { skip?: number; limit?: number }) {
  return ((c: Chunk<T>): Chunk<T> => {
    const skip = cursor?.skip
    const limit = cursor?.limit
    if (!skip && limit === 1) {
      return c.findFirstMap(codeFilter(filter)).map(Chunk.make).getOrElse(() => Chunk.empty())
    }
    let r = c.filterMap(codeFilter(filter))
    if (skip) {
      r = r.drop(skip)
    }
    if (limit !== undefined) {
      r = r.take(limit)
    }
    return r.toChunk
  })
}

export const makeMemoryStore = () => ({
  make: <Id extends string, Id2 extends Id, PM extends PersistenceModelType<Id>>(
    name: string,
    existing?: Effect<never, never, ReadonlyMap<Id2, PM>>,
    _config?: StoreConfig<PM>
  ) =>
    Effect.gen(function*($) {
      const updateETag = makeUpdateETag(name)
      const items = yield* $(existing ?? Effect(new Map()))
      const store = yield* $(
        Ref.make<ReadonlyMap<Id, PM>>(
          new Map([...items.entries()].map(([id, e]) => [id, makeETag(e)]))
        )
      )
      const sem = Semaphore.unsafeMake(1)
      const withPermit = sem.withPermits(1)
      const values = store.get.map(s => s.values())
      const all = values.map(Chunk.fromIterable)
      const batchSet = (items: NonEmptyReadonlyArray<PM>) =>
        items
          .forEachEffect(i => s.find(i.id).flatMap(current => updateETag(i, current)))
          .tap(items =>
            store.get
              .map(m => {
                const mut = m as Map<Id, PM>
                items.forEach(e => mut.set(e.id, e))
                return mut
              })
              .flatMap(_ => store.set(_))
          )
          .map(_ => _.toReadonlyArray() as NonEmptyReadonlyArray<PM>)
          .apply(withPermit)
      const s: Store<PM, Id> = {
        all,
        find: id => store.get.map(_ => Opt.fromNullable(_.get(id))),
        filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) => all.map(memFilter(filter, cursor)),
        filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
          all.map(c => c.flatMap(codeFilterJoinSelect<PM, T>(filter))),
        set: e =>
          s
            .find(e.id)
            .flatMap(current => updateETag(e, current))
            .tap(e => store.get.map(_ => new Map([..._, [e.id, e]])).flatMap(_ => store.set(_)))
            .apply(withPermit),
        batchSet,
        bulkSet: batchSet,
        remove: (e: PM) =>
          store.get.map(_ => new Map([..._].filter(([_]) => _ !== e.id)))
            .flatMap(_ => store.set(_)).apply(withPermit)
      }
      return s
    })
})

export const MemoryStoreLive = StoreMaker.makeLayer(makeMemoryStore())
