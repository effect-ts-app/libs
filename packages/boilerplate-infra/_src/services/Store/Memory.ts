/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Filter, FilterJoinSelect, PersistenceModelType, Store, StoreConfig } from "./service.js"
import { StoreMaker } from "./service.js"
import { codeFilter, codeFilterJoinSelect, makeETag, makeUpdateETag } from "./utils.js"

export function memFilter<T extends { id: string }>(filter: Filter<T>, cursor?: { skip?: number; limit?: number }) {
  return ((c: Chunk<T>) => {
    const skip = cursor?.skip
    const limit = cursor?.limit
    if (!skip && limit === 1) {
      return c.findMap(codeFilter(filter)).map(Chunk.single).getOrElse(() => Chunk.empty())
    }
    let r: Collection<T> = c.collect(codeFilter(filter))
    if (skip) {
      r = r.skip(skip)
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
    existing?: Effect<never, never, ROMap<Id2, PM>>,
    _config?: StoreConfig<PM>
  ) =>
    Effect.gen(function*($) {
      const updateETag = makeUpdateETag(name)
      const items = yield* $(existing ?? Effect(ROMap.empty))
      const store = yield* $(
        Ref.make<ROMap<Id, PM>>(
          ROMap.make([...items.entries()].map(([id, e]) => [id, makeETag(e)]))
        )
      )
      const storeSet = store.set.bind(store)
      const semaphore = TSemaphore.unsafeMake(1)
      const values = store.get.map(s => s.values())
      const all = values.map(Chunk.from)
      const batchSet = <T extends Collection<PM>>(items: T) =>
        semaphore.withPermit(
          items.toArray
            .forEachEffect(i => s.find(i.id).flatMap(current => updateETag(i, current)))
            .map(c => c.toArray)
            .tap(items =>
              store.get
                .map(m => {
                  const mut = ROMap.toMutable(m)
                  items.forEach(e => mut.set(e.id, e))
                  return ROMap.fromMutable(mut)
                })
                .flatMap(storeSet)
            )
        )
      const s: Store<PM, Id> = {
        all,
        find: id => store.get.map(ROMap.lookup(id)),
        filter: (filter: Filter<PM>, cursor?: { skip?: number; limit?: number }) => all.map(memFilter(filter, cursor)),
        filterJoinSelect: <T extends object>(filter: FilterJoinSelect) =>
          all.map(c => c.flatMap(codeFilterJoinSelect<PM, T>(filter))),
        set: e =>
          semaphore.withPermit(
            s
              .find(e.id)
              .flatMap(current => updateETag(e, current))
              .tap(e => store.get.map(ROMap.insert(e.id, e)).flatMap(storeSet))
          ),
        batchSet,
        bulkSet: batchSet,
        remove: (e: PM) => semaphore.withPermit(store.get.map(ROMap.remove(e.id)).flatMap(storeSet))
      }
      return s
    })
})

export const MemoryStoreLive = Layer.fromValue(StoreMaker, makeMemoryStore())
