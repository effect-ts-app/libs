/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible.
 * https://github.com/microsoft/TypeScript/issues/52644
 */

import type { Scope } from "@effect-app/core"
import { Context, Effect, Layer } from "@effect-app/core"

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

export type ServiceAcessorShape<Self, Shape> =
  & {
    $: {
      [k in keyof Shape as Shape[k] extends (...args: Array<any>) => any ? never : k]: Shape[k] extends
        Effect.Effect<infer A, infer E, infer R> ? Effect.Effect<A, E, Self | R>
        : Effect.Effect<Shape[k], never, Self>
    }
  }
  & {
    [k in keyof Shape as Shape[k] extends (...args: Array<any>) => any ? k : never]: Shape[k] extends
      (...args: infer Args) => Effect.Effect<infer A, infer E, infer R>
      ? (...args: Args) => Effect.Effect<A, E, Self | R>
      : Shape[k] extends (...args: infer Args) => infer A ? (...args: Args) => Effect.Effect<A, never, Self>
      : never
  }

export const proxify = <T extends object>(TagClass: T) =>
<Self, Shape>():
  & T
  & ServiceAcessorShape<Self, Shape> =>
{
  // @ts-expect-error abc
  TagClass["$"] = new Proxy({}, {
    get(_target: any, prop: any, _receiver) {
      // @ts-expect-error abc
      return Effect.andThen(TagClass, (s) => s[prop])
    }
  })
  const done = new Proxy(TagClass, {
    get(_target: any, prop: any, _receiver) {
      if (prop in TagClass) {
        // @ts-expect-error abc
        return TagClass[prop]
      }
      // @ts-expect-error abc
      return (...args: Array<any>) => Effect.andThen(TagClass, (s: any) => s[prop](...args))
    }
  })
  return done
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
      return Layer.effect(this as any, make)
    }

    static toLayerScoped = () => {
      return Layer.scoped(this as any, make)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return proxify(assignTag<Id, ServiceImpl>(key, creationError)(c))<Id, ServiceImpl>()
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
      return Layer.effect(this as any, Effect.map(eff, (_) => new this(_)))
    }
    static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
      return Layer.scoped(this as any, Effect.map(eff, (_) => new this(_)))
    }
    static get key() {
      return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
    }
  } as any

  return proxify(assignTag<Id, Service>(key, creationError)(c))<Id, ServiceImpl>()
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
    static make = Effect.andThen(make, (_) => new this(_))
    // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
    static toLayer = () => {
      return Layer.effect(this as any, this.make)
    }

    static toLayerScoped = () => {
      return Layer.scoped(this as any, this.make)
    }

    static get key() {
      return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return proxify(assignTag<Id, Service>(key, creationError)(c))<Id, ServiceImpl>()
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
        // this addresses prototype inheritance, but the trade-off is that the object won't be `instanceof` the Service Id class, so it's really just used as an interface only.
        return Object.assign(Object.create(service as any), service)
      }
      static wrap = (service: ServiceImpl) => new this(service)
      static toLayer = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
        return Layer.effect(this as any, Effect.map(eff, (_) => new this(_)))
      }
      static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
        return Layer.scoped(this as any, Effect.map(eff, (_) => new this(_)))
      }
    } as any

    return proxify(assignTag<Id, Id>(key, creationError)(c))<Id, ServiceImpl>()
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
      // this addresses prototype inheritance, but the trade-off is that the object won't be `instanceof` the Service Id class, so it's really just used as an interface only.
      return Object.assign(Object.create(service as any), service)
    }

    static wrap = (service: ServiceImpl) => new this(service)
    static make = Effect.andThen(make, (_) => new this(_))
    // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
    static toLayer = (arg?: any) => {
      return arg ? Layer.effect(this as any, arg) : Layer.effect(this as any, this.make)
    }

    static toLayerScoped = (arg?: any) => {
      return arg ? Layer.scoped(this as any, arg) : Layer.scoped(this as any, this.make)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  return proxify(assignTag<Id, Id>(key, creationError)(c))<Id, ServiceImpl>()
}
