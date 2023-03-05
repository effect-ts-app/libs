/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible.
 * https://github.com/microsoft/TypeScript/issues/52644
 */

import type { TagTypeId as TagTypeIdOriginal } from "@effect/data/Context"

export const ServiceTag = Symbol()
export type ServiceTag = typeof ServiceTag

export abstract class PhantomTypeParameter<Identifier extends keyof any, InstantiatedType> {
  protected abstract readonly [ServiceTag]: {
    readonly [NameP in Identifier]: (_: InstantiatedType) => InstantiatedType
  }
}

/**
 * @tsplus type ServiceTagged
 */
export abstract class ServiceTagged<ServiceKey> extends PhantomTypeParameter<string, ServiceKey> {}

/**
 * @tsplus static ServiceTagged make
 */
export function makeService<T extends ServiceTagged<any>>(_: Omit<T, ServiceTag>) {
  return _ as T
}

/**
 * @tsplus fluent effect/data/Context/Tag make
 */
export function make<T extends ServiceTagged<any>>(_: Tag<T>, t: Omit<T, ServiceTag>) {
  return t as T
}

export const TagTypeId: TagTypeIdOriginal = Symbol.for("@effect/data/Context/Tag") as unknown as TagTypeIdOriginal
export type TagTypeId = typeof TagTypeId

export function assignTag<Service>() {
  return <S extends object>(cls: S) => {
    const tag = Tag<Service>()
    return Object.assign(cls, {
      _S: tag._S,
      _id: tag._id
    }) as any as S & Tag<Service>
  }
}
export function TagClass<Service>() {
  abstract class TagClass {}

  return assignTag<Service>()(TagClass)
}

export function ServiceTaggedClass<Service>(): <Key extends PropertyKey>(
  _: Key
) => Tag<Service> & {
  tag(): Tag<Service>
  make: (t: Omit<Service, Key>) => Service
  access(): Effect<Service, never, Service>
  accessWith<B>(f: (a: Service) => B): Effect<Service, never, B>
  accessWithEffect<R, E, B>(f: (a: Service) => Effect<R, E, B>): Effect<Service, E, B>
  makeLayer(resource: Service): Layer<never, never, Service>
  new(): {}
} {
  return <Key extends PropertyKey>(_: Key) => {
    abstract class ServiceTaggedClassC {
      static make(t: Omit<Service, Key>) {
        return t as Service
      }
    }

    return assignTag<Service>()(ServiceTaggedClassC) as any
  }
}
