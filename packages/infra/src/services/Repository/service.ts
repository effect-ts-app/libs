import type { RepositoryBaseC } from "../RepositoryBase.js"

/**
 * @tsplus type Repository
 */
export interface Repository<
  T,
  Encoded extends { id: string },
  Evt,
  ItemType extends string,
  IdKey extends keyof T
> extends RepositoryBaseC<T, Encoded, Evt, ItemType, IdKey> {}
