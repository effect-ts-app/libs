/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible.
 * https://github.com/microsoft/TypeScript/issues/52644
 */

import type { TagTypeId as TagTypeIdOriginal } from "effect/Context"

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

export const TagTypeId: TagTypeIdOriginal = Symbol.for("effect/Context/Tag") as unknown as TagTypeIdOriginal
export type TagTypeId = typeof TagTypeId

export function assignTag<Id, Service = Id>(key?: unknown) {
  return <S extends object>(cls: S): S & Tag<Id, Service> => {
    const tag = Tag<Id, Service>(key)
    const t = Object.assign(cls, Object.getPrototypeOf(tag), tag)
    // TODO: this is probably useless, as we need to get it at the source instead of here
    Object.defineProperty(t, "stack", {
      get() {
        return tag.stack
      }
    })
    return t
  }
}

export const TagClassBase = <Id, Service = Id>() => {
  abstract class TagClassBase {
    static readonly andThen = (f: any): any => {
      return Effect.andThen(this as Service as Tag<Service, Service>, f)
    }
    static readonly map = <B>(f: (a: Service) => B): Effect<Service, never, B> => {
      return Effect.map(this as Service as Tag<Service, Service>, f)
    }
    static readonly makeLayer = (svc: Service) => {
      return Layer.succeed(this as Service as Tag<Service, Service>, svc)
    }
  }
  return TagClassBase
}
export function TagClass<Id, Service = Id>(key?: unknown) {
  abstract class TagClass extends TagClassBase<Id, Service>() {}

  return assignTag<Id, Service>(key)(TagClass)
}

/** @deprecated use `Id` of TagClass for unique id */
export function ServiceTaggedClass<Id, Service = Id>() {
  return <Key extends PropertyKey>(_: Key) => {
    abstract class ServiceTaggedClassC extends TagClassBase() {
      static make = (t: Omit<Service, Key>) => {
        return t as Service
      }
    }

    return assignTag<Id, Service>()(ServiceTaggedClassC)
  }
}
