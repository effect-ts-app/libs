import type { RepositoryBaseC } from "../RepositoryBase.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T extends { id: unknown },
  Encoded extends { id: string },
  Evt,
  ItemType extends string
> extends RepositoryBaseC<T, Encoded, Evt, ItemType> {}
