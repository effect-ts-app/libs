/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
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

let i = 0
const randomId = () => "unknown-service-" + i++

export function assignTag<Id, Service = Id>(key?: string) {
  return <S extends object>(cls: S): S & Tag<Id, Service> => {
    const tag = GenericTag<Id, Service>(key ?? randomId())
    const t = Object.assign(cls, Object.getPrototypeOf(tag), tag)
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 4 // TODO
    const creationError = new Error()
    Error.stackTraceLimit = limit
    // the stack is used to get the location of the tag definition, if a service is not found in the registry
    Object.defineProperty(t, "stack", {
      get() {
        // remove one line as assignTag is generally used inside a class constructor function
        return creationError.stack?.split("\n").slice(1).join("\n")
      }
    })
    return t
  }
}

export function TagClass<Id, ServiceImpl, Service = Id>(key?: string) {
  const c: { new(service: ServiceImpl): Readonly<ServiceImpl> } = class {
    constructor(service: ServiceImpl) {
      Object.assign(this, service)
    }
    // static readonly Id: Id
  } as any

  return assignTag<Id, Service>(key)(c)
}

export const TagClassMake = <Id, Service = Id>() =>
<ServiceImpl, R, E>(
  make: Effect<ServiceImpl, E, R>,
  key?: string
) => {
  const c: {
    new(service: ServiceImpl): Readonly<ServiceImpl>
    toLayer: () => Layer<Service, E, R>
    toLayerScoped: () => Layer<Service, E, Exclude<R, Scope>>
  } = class {
    constructor(service: ServiceImpl) {
      Object.assign(this, service)
    }
    // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
    static toLayer() {
      return make.toLayer(this as any)
    }

    static toLayerScoped() {
      return make.toLayerScoped(this as any)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return assignTag<Id, Service>(key)(c)
}

export function TagClassLegacy<Id, Service = Id>(key?: string) {
  abstract class TagClassLegacy {}

  return assignTag<Id, Service>(key)(TagClassLegacy)
}

/** @deprecated use `Id` of TagClass for unique id */
export function ServiceTaggedClass<Id, Service = Id>() {
  return <Key extends PropertyKey>(_: Key) => {
    abstract class ServiceTaggedClassC {
      static make = (t: Omit<Service, Key>) => {
        return t as Service
      }
    }

    return assignTag<Id, Service>()(ServiceTaggedClassC)
  }
}
