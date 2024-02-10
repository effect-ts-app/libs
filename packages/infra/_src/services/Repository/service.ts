import type { RepositoryBaseC } from "../RepositoryBase.js"
import type { PersistenceModelType } from "../Store.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T extends { id: unknown },
  PM extends PersistenceModelType<string>,
  Evt,
  ItemType extends string
> extends RepositoryBaseC<T, PM, Evt, ItemType> {}
