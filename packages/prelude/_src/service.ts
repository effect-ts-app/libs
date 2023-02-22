/**
 * We're doing the long way around here with assignTag, TagBase & TagBaseTagged,
 * because there's a typescript compiler issue where it will complain about Equal.symbol, and Hash.symbol not being accessible
 */

import type { TagTypeId as TagTypeIdOriginal } from "@effect/data/Context"
import * as Equal from "@effect/data/Equal"
import * as Hash from "@effect/data/Hash"

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

export const equalSymbol: typeof Equal.symbol = Symbol.for("@effect/data/Equal") as unknown as typeof Equal.symbol
export const hashSymbol: typeof Hash.symbol = Symbol.for("@effect/data/Hash") as unknown as typeof Hash.symbol

export interface AccessService<T> {
  access: Effect<T, never, T>
  accessWith: <B>(f: (a: T) => B) => Effect<T, never, B>
  accessWithEffect: <R, E, B>(f: (a: T) => Effect<R, E, B>) => Effect<T, E, B>
}

export function assignTag<T extends Tag<any>>() {
  type Service = ReturnType<T["_S"]>
  return <S extends object>(cls: S) => {
    const tag = Tag<ReturnType<T["_S"]>>()
    return Object.assign(cls, {
      _S: tag._S,
      _id: tag._id,
      key: tag.key,
      [Hash.symbol]: tag[Hash.symbol],
      [Equal.symbol]: tag[Equal.symbol],
      access: Effect.service(tag),
      accessWith: <B>(f: (a: Service) => B) => Effect.serviceWith(tag, f),
      accessWithEffect: <R, E, B>(f: (a: Service) => Effect<R, E, B>) => Effect.serviceWithEffect(tag, f)
    }) as any as S & AccessService<Service> & T
  }
}

export function TagClass<T extends Tag<any>>(): T & {
  access: Effect<ReturnType<T["_S"]>, never, ReturnType<T["_S"]>>
  accessWith: <B>(f: (a: ReturnType<T["_S"]>) => B) => Effect<ReturnType<T["_S"]>, never, B>
  accessWithEffect: <R, E, B>(f: (a: ReturnType<T["_S"]>) => Effect<R, E, B>) => Effect<ReturnType<T["_S"]>, E, B>
  new(): {}
} {
  abstract class TagClass {}

  return Object.assign(TagClass, assignTag<T>()) as any
}

export function ServiceTaggedClass<T extends Tag<any>>(): <Key extends PropertyKey>(
  _: Key
) => T & {
  make: (t: Omit<ReturnType<T["_S"]>, Key>) => ReturnType<T["_S"]>
  access: Effect<ReturnType<T["_S"]>, never, ReturnType<T["_S"]>>
  accessWith: <B>(f: (a: ReturnType<T["_S"]>) => B) => Effect<ReturnType<T["_S"]>, never, B>
  accessWithEffect: <R, E, B>(f: (a: ReturnType<T["_S"]>) => Effect<R, E, B>) => Effect<ReturnType<T["_S"]>, E, B>
  new(): {}
} {
  type Service = ReturnType<T["_S"]>
  return <Key extends PropertyKey>(_: Key) => {
    abstract class ServiceTaggedClassC {
      static make(t: Omit<Service, Key>) {
        return t as Service
      }
    }

    return Object.assign(ServiceTaggedClassC, assignTag<T>()) as any
  }
}
