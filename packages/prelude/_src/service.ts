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
export function make<T extends ServiceTagged<any>, I = T>(_: Tag<I, T>, t: Omit<T, ServiceTag>) {
  return t as T
}

export const TagTypeId: TagTypeIdOriginal = Symbol.for("@effect/data/Context/Tag") as unknown as TagTypeIdOriginal
export type TagTypeId = typeof TagTypeId

export function assignTag<Service>() {
  return <S extends object>(cls: S) => {
    const tag = Tag<Service>()
    return Object.assign(cls, tag)
  }
}
export function TagClass<Service>() {
  abstract class TagClass {
    static flatMap<R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>): Effect<Service | R1, E1, B> {
      return Effect.flatMap(this as unknown as Tag<Service, Service>, f)
    }
    static map<B>(f: (a: Service) => B): Effect<Service, never, B> {
      return Effect.map(this as unknown as Tag<Service, Service>, f)
    }
    static makeLayer(svc: Service) {
      return Layer.succeed(this as unknown as Tag<Service, Service>, svc)
    }
  }

  return assignTag<Service>()(TagClass)
}

export function ServiceTaggedClass<Service>() {
  return <Key extends PropertyKey>(_: Key) => {
    abstract class ServiceTaggedClassC {
      static make(t: Omit<Service, Key>) {
        return t as Service
      }
      static flatMap<R1, E1, B>(f: (a: Service) => Effect<R1, E1, B>): Effect<Service | R1, E1, B> {
        return Effect.flatMap(this as unknown as Tag<Service, Service>, f)
      }
      static map<B>(f: (a: Service) => B): Effect<Service, never, B> {
        return Effect.map(this as unknown as Tag<Service, Service>, f)
      }
      static makeLayer(svc: Service) {
        return Layer.succeed(this as unknown as Tag<Service, Service>, svc)
      }
    }

    return assignTag<Service>()(ServiceTaggedClassC)
  }
}
