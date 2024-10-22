/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible.
 * https://github.com/microsoft/TypeScript/issues/52644
 */

import type { Scope } from "effect-app"
import { Effect, Layer } from "effect-app"
import * as Context from "effect/Context"

export * from "effect/Context"

export const ServiceTag = Symbol()
export type ServiceTag = typeof ServiceTag

export abstract class PhantomTypeParameter<Identifier extends keyof any, InstantiatedType> {
  protected abstract readonly [ServiceTag]: {
    readonly [NameP in Identifier]: (_: InstantiatedType) => InstantiatedType
  }
}

export type ServiceShape<T extends Context.TagClassShape<any, any>> = Omit<
  T,
  keyof Context.TagClassShape<any, any>
>

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

export type ServiceAcessorShape<Self, Type> =
  & (Type extends Record<PropertyKey, any> ? {
      [
        k in keyof Type as Type[k] extends ((...args: [...infer Args]) => infer Ret)
          ? ((...args: Readonly<Args>) => Ret) extends Type[k] ? k : never
          : k
      ]: Type[k] extends (...args: [...infer Args]) => Effect<infer A, infer E, infer R>
        ? (...args: Readonly<Args>) => Effect<A, E, Self | R>
        : Type[k] extends (...args: [...infer Args]) => infer A ? (...args: Readonly<Args>) => Effect<A, never, Self>
        : Type[k] extends Effect<infer A, infer E, infer R> ? Effect<A, E, Self | R>
        : Effect<Type[k], never, Self>
    }
    : {})
  & {
    use: <X>(
      body: (_: Type) => X
    ) => X extends Effect<infer A, infer E, infer R> ? Effect<A, E, R | Self> : Effect<X, never, Self>
  }

export const proxify = <T extends object>(Tag: T) =>
<Self, Shape>():
  & T
  & ServiceAcessorShape<Self, Shape> =>
{
  const cache = new Map()
  const done = new Proxy(Tag, {
    get(_target: any, prop: any, _receiver) {
      if (prop === "use") {
        // @ts-expect-error abc
        return (body) => Effect.andThen(Tag, body)
      }
      if (prop in Tag) {
        return Tag[prop]
      }
      if (cache.has(prop)) {
        return cache.get(prop)
      }
      // @ts-expect-error abc
      const fn = (...args: Array<any>) => Effect.andThen(Tag, (s: any) => s[prop](...args))
      // @ts-expect-error abc
      const cn = Effect.andThen(Tag, (s) => s[prop])
      Object.assign(fn, cn)
      Object.setPrototypeOf(fn, Object.getPrototypeOf(cn))
      cache.set(prop, fn)
      return fn
    }
  })
  return done
}

// export const TagMake = <ServiceImpl, R, E, const Key extends string>(
//   key: Key,
//   make: Effect<ServiceImpl, E, R>
// ) =>
// <Id>() => {
//   const limit = Error.stackTraceLimit
//   Error.stackTraceLimit = 2
//   const creationError = new Error()
//   Error.stackTraceLimit = limit
//   const c: {
//     new(): Context.TagClassShape<Key, ServiceImpl>
//     toLayer: () => Layer<Id, E, R>
//     toLayerScoped: () => Layer<Id, E, Exclude<R, Scope>>
//   } = class {
//     static toLayer = () => {
//       return Layer.effect(this as any, make)
//     }

//     static toLayerScoped = () => {
//       return Layer.scoped(this as any, make)
//     }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } as any

//   return proxify(assignTag<Id, ServiceImpl>(key, creationError)(c))<Id, ServiceImpl>()
// }

// export function Tag<Id, ServiceImpl, Service = Id>(key?: string) {
//   const limit = Error.stackTraceLimit
//   Error.stackTraceLimit = 2
//   const creationError = new Error()
//   Error.stackTraceLimit = limit
//   const c: (abstract new(impl: ServiceImpl) => Readonly<ServiceImpl>) & {
//     toLayer: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, R>
//     toLayerScoped: <E, R>(eff: Effect<ServiceImpl, E, R>) => Layer<Id, E, Exclude<R, Scope>>
//   } = class {
//     constructor(service: ServiceImpl) {
//       Object.assign(this, service)
//     }
//     static _key?: string
//     static toLayer = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
//       return Layer.effect(this as any, eff)
//     }
//     static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
//       return Layer.scoped(this as any, eff)
//     }
//     static get key() {
//       return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
//     }
//   } as any

//   return proxify(assignTag<Id, Service>(key, creationError)(c))<Id, ServiceImpl>()
// }

// export const TagMake = <ServiceImpl, R, E>(
//   make: Effect<ServiceImpl, E, R>,
//   key?: string
// ) =>
// <Id, Service = Id>() => {
//   const limit = Error.stackTraceLimit
//   Error.stackTraceLimit = 2
//   const creationError = new Error()
//   Error.stackTraceLimit = limit
//   const c: (abstract new(impl: ServiceImpl) => Readonly<ServiceImpl>) & {
//     toLayer: { (): Layer<Id, E, R>; <E, R>(eff: Effect<ServiceImpl, E, R>): Layer<Id, E, R> }
//     toLayerScoped: {
//       (): Layer<Id, E, Exclude<R, Scope>>
//       <E, R>(eff: Effect<ServiceImpl, E, R>): Layer<Id, E, Exclude<R, Scope>>
//     }
//     make: Effect<Id, E, R>
//   } = class {
//     constructor(service: ServiceImpl) {
//       Object.assign(this, service)
//     }
//     static _key: string
//     static make = make
//     // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
//     static toLayer = (arg?: any) => {
//       return Layer.effect(this as any, arg ?? this.make)
//     }

//     static toLayerScoped = (arg?: any) => {
//       return Layer.scoped(this as any, arg ?? this.make)
//     }

//     static get key() {
//       return this._key ?? (this._key = key ?? creationError.stack?.split("\n")[2] ?? this.name)
//     }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } as any

//   return proxify(assignTag<Id, Service>(key, creationError)(c))<Id, ServiceImpl>()
// }

export function TagId<const Key extends string>(key: Key) {
  return <Id, ServiceImpl>() => {
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 2
    const creationError = new Error()
    Error.stackTraceLimit = limit
    const c:
      & (abstract new(
        service: ServiceImpl
      ) => Readonly<ServiceImpl> & Context.TagClassShape<Key, ServiceImpl>)
      & {
        toLayer: <E, R>(eff: Effect<Omit<Id, keyof Context.TagClassShape<any, any>>, E, R>) => Layer<Id, E, R>
        toLayerScoped: <E, R>(
          eff: Effect<Omit<Id, keyof Context.TagClassShape<any, any>>, E, R>
        ) => Layer<Id, E, Exclude<R, Scope>>
        of: (service: Omit<Id, keyof Context.TagClassShape<any, any>>) => Id
      } = class {
        constructor(service: any) {
          // TODO: instead, wrap the service, and direct calls?
          Object.assign(this, service)
        }
        static of = (service: ServiceImpl) => service
        static toLayer = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
          return Layer.effect(this as any, eff)
        }
        static toLayerScoped = <E, R>(eff: Effect<ServiceImpl, E, R>) => {
          return Layer.scoped(this as any, eff)
        }
      } as any

    return proxify(assignTag<Id, Id>(key, creationError)(c))<Id, ServiceImpl>()
  }
}

export const TagMakeId = <ServiceImpl, R, E, const Key extends string>(
  key: Key,
  make: Effect<ServiceImpl, E, R>
) =>
<Id>() => {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  const creationError = new Error()
  Error.stackTraceLimit = limit
  const c:
    & (abstract new(
      service: ServiceImpl
    ) => Readonly<ServiceImpl> & Context.TagClassShape<Key, ServiceImpl>)
    & {
      toLayer: {
        (): Layer<Id, E, R>
        <E, R>(eff: Effect<Omit<Id, keyof Context.TagClassShape<any, any>>, E, R>): Layer<Id, E, R>
      }
      toLayerScoped: {
        (): Layer<Id, E, Exclude<R, Scope>>
        <E, R>(eff: Effect<Context.TagClassShape<any, any>, E, R>): Layer<Id, E, Exclude<R, Scope>>
      }
      of: (service: Context.TagClassShape<any, any>) => Id
      make: Effect<Id, E, R>
    } = class {
      constructor(service: any) {
        // TODO: instead, wrap the service, and direct calls?
        Object.assign(this, service)
      }

      static of = (service: ServiceImpl) => service
      static make = make
      // works around an issue where defining layer on the class messes up and causes the Tag to infer to `any, any` :/
      static toLayer = (arg?: any) => {
        return Layer.effect(this as any, arg ?? this.make)
      }

      static toLayerScoped = (arg?: any) => {
        return Layer.scoped(this as any, arg ?? this.make)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

  return proxify(assignTag<Id, Id>(key, creationError)(c))<Id, ServiceImpl>()
}
