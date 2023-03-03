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

export interface AccessService<T> {
  tag: Tag<T>
  access: Effect<T, never, T>
  accessWith: <B>(f: (a: T) => B) => Effect<T, never, B>
  accessWithEffect: <R, E, B>(f: (a: T) => Effect<R, E, B>) => Effect<T, E, B>
}

export function assignTag<Service>() {
  return <S extends object>(cls: S) => {
    const tag = Tag<Service>()
    return Object.assign(cls, {
      _S: tag._S,
      _id: tag._id,
      tag(): Tag<Service> {
        // will point at the class it is called on
        return this as Tag<Service>
      },
      access() {
        return Effect.service(this.tag())
      },
      accessWith<B>(f: (a: Service) => B) {
        return Effect.serviceWith(this.tag(), f)
      },
      accessWithEffect<R, E, B>(f: (a: Service) => Effect<R, E, B>) {
        return Effect.serviceWithEffect(this.tag(), f)
      },
      makeLayer(resource: Service) {
        return Layer.succeed(this.tag(), resource)
      }
    }) as any as S & AccessService<Service> & Tag<Service>
  }
}
export function TagClass<Service>(): Tag<Service> & {
  tag(): Tag<Service>
  access(): Effect<Service, never, Service>
  accessWith<B>(f: (a: Service) => B): Effect<Service, never, B>
  accessWithEffect<R, E, B>(f: (a: Service) => Effect<R, E, B>): Effect<Service, E, B>
  makeLayer(resource: Service): Layer<never, never, Service>
  new(): {}
} {
  abstract class TagClass {}

  return assignTag<Service>()(TagClass) as any
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
