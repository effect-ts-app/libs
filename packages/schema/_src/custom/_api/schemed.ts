import { pipe } from "@effect-ts/core/Function"
import * as St from "@effect-ts/core/Structural"

import * as S from "../_schema/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Constructor from "../Constructor/index.js"
import * as Parser from "../Parser/index.js"
import * as Th from "../These/index.js"
import { unsafe } from "./condemn.js"

export const schemaField = Symbol()
export type schemaField = typeof schemaField

export interface SchemedOut<Self extends S.SchemaAny> {
  [schemaField]: Self
  new (_: any): S.ParsedShapeOf<Self>
}

export const schemedBrand = Symbol()

export function isSchemed(u: unknown): u is SchemedOut<any> {
  return typeof u === "function" && u != null && u[schemedBrand] === schemedBrand
}

export type ShapeFromSchemedOut<
  C extends {
    new (_: any): any
  }
> = C extends {
  new (_: any): infer T
}
  ? T
  : never

export type SchemaForSchemed<Self extends SchemedOut<S.SchemaAny>> = [
  Self[schemaField]
] extends [
  S.Schema<infer ParserInput, any, infer ConstructorInput, infer Encoded, infer Api>
]
  ? S.Schema<
      ParserInput,
      ShapeFromSchemedOut<Self>,
      ConstructorInput,
      Encoded,
      Api & S.ApiSelfType<ShapeFromSchemedOut<Self>>
    >
  : never

export interface Copy {
  copy(args: {} extends this ? void : Partial<Omit<this, "copy">>): this
}

export interface Schemed<Self extends S.SchemaAny> {
  [schemaField]: Self
  new (_: S.ConstructorInputOf<Self>): S.ParsedShapeOf<Self> & Copy
}

type ShapeFromClass<
  C extends {
    new (_: any): any
  }
> = C extends {
  new (_: any): infer T
}
  ? T
  : never

export const fromFields = Symbol()

export function Schemed<Self extends S.Schema<any, any, any, any, any>>(
  self: Self
): Schemed<Self> {
  const of_ = Constructor.for(self) >= unsafe
  // @ts-expect-error
  return class {
    static [schemaField] = self
    static [schemedBrand] = schemedBrand
    constructor(inp?: S.ConstructorInputOf<Self>) {
      if (inp) {
        this[fromFields](of_(inp))
      }
    }
    [fromFields](fields: any) {
      for (const k of Object.keys(fields)) {
        this[k] = fields[k]
      }
    }
    copy(partial: any) {
      // @ts-expect-error
      const inst = new this.constructor()
      inst[fromFields]({ ...this, ...partial })
      return inst
    }
    get [St.hashSym](): number {
      const ka = Object.keys(this).sort()
      if (ka.length === 0) {
        return 0
      }
      let hash = St.combineHash(St.hashString(ka[0]!), St.hash(this[ka[0]!]))
      let i = 1
      while (hash && i < ka.length) {
        hash = St.combineHash(
          hash,
          St.combineHash(St.hashString(ka[i]!), St.hash(this[ka[i]!]))
        )
        i++
      }
      return hash
    }

    [St.equalsSym](that: unknown): boolean {
      if (!(that instanceof this.constructor)) {
        return false
      }
      const ka = Object.keys(this)
      const kb = Object.keys(that)
      if (ka.length !== kb.length) {
        return false
      }
      let eq = true
      let i = 0
      const ka_ = ka.sort()
      const kb_ = kb.sort()
      while (eq && i < ka.length) {
        eq = ka_[i] === kb_[i] && St.equals(this[ka_[i]!], this[kb_[i]!])
        i++
      }
      return eq
    }
  }
}

export function schema<Self extends SchemedOut<any>>(self: Self) {
  const guard = (u: unknown): u is ShapeFromClass<Self> => u instanceof self
  const of_ = Constructor.for(self[schemaField])
  const parse_ = Parser.for(self[schemaField])
  const arb = Arbitrary.for(self[schemaField])

  const schema = pipe(
    self[schemaField],
    S.guard(guard),
    S.constructor((u: any): any => {
      const res = of_(u)
      if (res.effect._tag === "Left") {
        return Th.fail(res.effect.left)
      }
      const warnings = res.effect.right.get(1)
      const out = res.effect.right.get(0)
      // @ts-expect-error
      const x = new self() as ShapeFromClass<Self>
      x[fromFields](out)
      if (warnings._tag === "Some") {
        return Th.warn(x, warnings.value)
      }
      return Th.succeed(x)
    }),
    S.parser((u: any, env): any => {
      const res = parse_(u, env)
      if (res.effect._tag === "Left") {
        return Th.fail(res.effect.left)
      }
      const warnings = res.effect.right.get(1)
      const out = res.effect.right.get(0)
      // @ts-expect-error
      const x = new self() as ShapeFromClass<Self>
      x[fromFields](out)
      if (warnings._tag === "Some") {
        return Th.warn(x, warnings.value)
      }
      return Th.succeed(x)
    }),
    S.arbitrary((_) =>
      arb(_).map((out) => {
        // @ts-expect-error
        const x = new self() as ShapeFromClass<Self>
        x[fromFields](out)
        return x
      })
    ),
    S.mapApi(() => self[schemaField].Api)
  )

  return schema as SchemaForSchemed<Self>
}
