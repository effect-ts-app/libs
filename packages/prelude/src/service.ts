/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible.
 * https://github.com/microsoft/TypeScript/issues/52644
 */

import type { Effect, Scope } from "@effect-app/core"
import { Context, Layer } from "@effect-app/core"

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
export function make<T extends ServiceTagged<any>, I = T>(_: Context.Tag<I, T>, t: Omit<T, ServiceTag>) {
  return t as T
}

let i = 0
const randomId = () => "unknown-service-" + i++

export function assignTag<Id, Service = Id>(key?: string, creationError?: Error) {
  return <S extends object>(cls: S): S & Context.Tag<Id, Service> => {
    const tag = Context.GenericTag<Id, Service>(key ?? randomId())
    let fields = tag
    if (Reflect.ownKeys(cls).includes("key")) {
      const { key, ...rest } = tag
      fields = rest as any
    }
    const t = Object.assign(cls, Object.getPrototypeOf(tag), fields)
    if (!creationError) {
      const limit = Error.stackTraceLimit
      Error.stackTraceLimit = 2
      creationError = new Error()
      Error.stackTraceLimit = limit
    }
    // the stack is used to get the location of the tag definition, if a service is not found in the registry
    Object.defineProperty(t, "stack", {
      get() {
        return creationError!.stack
      }
    })
    return t
  }
}

export const TagMake = <ServiceImpl, R, E, const Key extends string>(
  key: Key,
  make: Effect<ServiceImpl, E, R>
) =>
<Id>() => {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  const creationError = new Error()
  Error.stackTraceLimit = limit
  const c: {
    new(): Context.TagClassShape<Key, ServiceImpl>
    toLayer: () => Layer<Id, E, R>
    toLayerScoped: () => Layer<Id, E, Exclude<R, Scope>>
  } = class {
    static toLayer = () => {
      return make.toLayer(this as any)
    }

    static toLayerScoped = () => {
      return make.toLayerScoped(this as any)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return assignTag<Id, ServiceImpl>(key, creationError)(c)
}

export function TagClass<Id, ServiceImpl, Service = Id>(key?: string) {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  const creationError = new Error()
  Error.stackTraceLimit = limit
  const c: {
    new(service: ServiceImpl): Readonly<ServiceImpl>
    toLayer: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, R>
    toLayerScoped: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, Exclude<R, Scope>>
  } = class {
    constructor(service: ServiceImpl) {
      Object.assign(this, service)
    }
    static _key?: string
    static toLayer = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
      return eff.map((_) => new this(_)).toLayer(this as any)
    }
    static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
      return eff.map((_) => new this(_)).toLayerScoped(this as any)
    }
    static get key() {
      return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
    }
  } as any

  return assignTag<Id, Service>(key, creationError)(c)
}

export const TagClassMake = <ServiceImpl, R, E>(
  make: Effect<ServiceImpl, E, R>,
  key?: string
) =>
<Id, Service = Id>() => {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  const creationError = new Error()
  Error.stackTraceLimit = limit
  const c: {
    new(service: ServiceImpl): Readonly<ServiceImpl>
    toLayer: () => Layer<Id, E, R>
    toLayerScoped: () => Layer<Id, E, Exclude<R, Scope>>
    make: Effect<Id, E, R>
  } = class {
    constructor(service: ServiceImpl) {
      Object.assign(this, service)
    }
    static _key: string
    static make = make.andThen((_) => new this(_))
    // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
    static toLayer = () => {
      return this.make.toLayer(this as any)
    }

    static toLayerScoped = () => {
      return this.make.toLayerScoped(this as any)
    }

    static get key() {
      return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return assignTag<Id, Service>(key, creationError)(c)
}

export function TagClassId<const Key extends string>(key: Key) {
  return <Id, ServiceImpl>() => {
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    const c: {
      new(service: ServiceImpl): Readonly<ServiceImpl> & Context.TagClassShape<Key, ServiceImpl>
      toLayer: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, R>
      toLayerScoped: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, Exclude<R, Scope>>
      wrap: (service: ServiceImpl) => Id
    } = class {
      constructor(service: ServiceImpl) {
        Object.assign(this, service)
      }
      static wrap = (service: ServiceImpl) => new this(service)
      static toLayer = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
        return Layer.effect(this as any, eff.map((_) => new this(_)))
      }
      static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
        return Layer.scoped(this as any, eff.map((_) => new this(_)))
      }
    } as any

    return assignTag<Id, Id>(key, creationError)(c)
  }
}

export const TagClassMakeId = <ServiceImpl, R, E, const Key extends string>(
  key: Key,
  make: Effect<ServiceImpl, E, R>
) =>
<Id>() => {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  const creationError = new Error()
  Error.stackTraceLimit = limit
  const c: {
    new(service: ServiceImpl): Readonly<ServiceImpl> & Context.TagClassShape<Key, ServiceImpl>
    toLayer: { (): Layer<Id, E, R>; <E, R>(eff: Effect<ServiceImpl, E, R>): Layer<Id, E, R> }
    toLayerScoped: {
      (): Layer<Id, E, Exclude<R, Scope>>
      <E, R>(eff: Effect<ServiceImpl, E, R>): Layer<Id, E, Exclude<R, Scope>>
    }

    wrap: (service: ServiceImpl) => Id
    make: Effect<Id, E, R>
  } = class {
    constructor(service: ServiceImpl) {
      Object.assign(this, service)
    }

    static wrap = (service: ServiceImpl) => new this(service)
    static make = make.andThen((_) => new this(_))
    // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
    static toLayer = (arg?: any) => {
      return arg ? Layer.effect(this as any, arg) : this.make.toLayer(this as any)
    }

    static toLayerScoped = (arg?: any) => {
      return arg ? Layer.scoped(this as any, arg) : this.make.toLayerScoped(this as any)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return assignTag<Id, Id>(key, creationError)(c)
}
