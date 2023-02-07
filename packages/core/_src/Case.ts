/* eslint-disable @typescript-eslint/ban-types */
// ets_tracing: off

import * as Equal from "@effect/data/Equal"
import * as Hash from "@effect/data/Hash"
import type { IsEqualTo } from "./utils.js"

export const CaseBrand = Symbol()

export interface CaseBrand {
  [CaseBrand]: string[]
}

export function hasCaseBrand(self: unknown): self is CaseBrand {
  return typeof self === "object" && self != null && CaseBrand in self
}

const h0 = Hash.string("@effect-app/core/Case")

export interface Copy<T> {
  copy(args: IsEqualTo<T, {}> extends true ? void : Partial<T>): this
}

export interface CaseConstructor {
  readonly make: <X extends CaseConstructor>(
    this: X,
    ...args: X extends new(...args: infer R) => any ? R : never
  ) => X extends new(...args: any) => any ? InstanceType<X> : never

  new<T>(args: IsEqualTo<T, {}> extends true ? void : T): T & Copy<T>
}

export const caseArgs = Symbol()
export const caseKeys = Symbol()

// @ts-expect-error abc
export const Case: CaseConstructor = class<T> implements CaseBrand, Hash.Hash, Equal.Equal {
  static make<T>(args: T) {
    return new this(args)
  }

  private [caseArgs]: T
  private [caseKeys]: string[]
  constructor(args: T) {
    this[caseArgs] = args

    if (typeof args === "object" && args != null) {
      const keys = Object.keys(args)

      for (let i = 0; i < keys.length; i++) {
        this[keys[i]!] = args[keys[i]!]
      }
    }
    this[caseKeys] = Object.keys(this).sort()
  }

  copy(args: Partial<T>): this {
    // @ts-expect-error abc
    return new this.constructor({ ...this[caseArgs], ...args })
  }

  get [CaseBrand](): string[] {
    return this[caseKeys]
  }

  [Hash.symbol](): number {
    let h = h0
    for (const k of this[caseKeys]) {
      h = Hash.combine(Hash.hash(this[k]))(h)
    }
    return h
  }

  [Equal.symbol](that: unknown): boolean {
    if (this === that) {
      return true
    }
    if (that instanceof this.constructor) {
      const kthat = that[CaseBrand]
      const len = kthat.length

      if (len !== this[caseKeys].length) {
        return false
      }

      let eq = true
      let i = 0

      while (eq && i < len) {
        eq = this[caseKeys][i] === kthat[i] &&
          Equal.equals(this[this[caseKeys][i]!]!, that[kthat[i]!]!)
        i++
      }

      return eq
    }
    return false
  }
}

export interface CaseConstructorTagged<Tag extends PropertyKey, K extends PropertyKey> {
  readonly _tag: Tag

  readonly make: <X extends Omit<CaseConstructorTagged<Tag, K>, "new">>(
    this: X,
    ...args: X extends new(...args: infer R) => any ? R : never
  ) => X extends new(...args: any[]) => any ? InstanceType<X> : never

  new<T>(args: IsEqualTo<T, {}> extends true ? void : T):
    & T
    & Copy<T>
    & { readonly [k in K]: Tag }
}

export interface CaseConstructorADT<Y, Tag extends PropertyKey, K extends PropertyKey> {
  readonly _tag: Tag

  readonly make: <X extends Omit<CaseConstructorADT<Y, Tag, K>, "new">>(
    this: X,
    ...args: X extends new(...args: infer R) => any ? R : never
  ) => X extends new(...args: any) => any ? InstanceType<X> extends Y ? Y
    : InstanceType<X>
    : Y

  new<T>(args: IsEqualTo<T, {}> extends true ? void : T):
    & T
    & Copy<T>
    & { readonly [k in K]: Tag }
}

export function TaggedADT<X>(): {
  <Tag extends string | symbol>(tag: Tag): CaseConstructorADT<X, Tag, "_tag">
  <Tag extends string | symbol, Key extends string | symbol>(
    tag: Tag,
    key: Key
  ): CaseConstructorADT<X, Tag, Key>
} {
  // @ts-expect-error abc
  return Tagged
}

export function Tagged<Tag extends string | symbol, Key extends string | symbol>(
  tag: Tag,
  key: Key
): CaseConstructorTagged<Tag, Key>
export function Tagged<Tag extends PropertyKey>(
  tag: Tag
): CaseConstructorTagged<Tag, "_tag">
export function Tagged<Tag extends string | symbol, Key extends string | symbol>(
  tag: Tag,
  key?: Key
): CaseConstructorTagged<Tag, string> {
  if (key) {
    class X extends Case<{}> {
      static readonly _tag = tag
      // @ts-expect-error abc
      readonly [key] = tag
    }
    // @ts-expect-error abc
    return X
  }
  class X extends Case<{}> {
    static readonly _tag = tag
    readonly _tag = tag
  }

  // @ts-expect-error abc
  return X
}
