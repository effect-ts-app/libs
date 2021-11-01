/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as St from "@effect-ts/core/Structural"
import * as Lens from "@effect-ts/monocle/Lens"
import omit from "lodash/omit"
import pick from "lodash/pick"

import { Compute } from "../Compute"
import { EncSchemaForModel, EParserFor, FromPropertyRecord, fromProps } from "./_api"
import * as MO from "./_schema"
import { schemaField } from "./_schema"
import { AnyProperty, ParsedShapeOf, PropertyRecord } from "./custom"
import { unsafe } from "./custom/_api/condemn"
import { include } from "./utils"

export const nModelBrand = Symbol()

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = MO.Schema<unknown, any, any, AnyRecord, any>

// Not inheriting from Schemed because we don't want `copy`
// passing SelfM down to Model2 so we only compute it once.
export interface Model<M, Self extends MO.SchemaAny>
  extends Model2<M, Self, EncSchemaForModel<M, Self, MO.EncodedOf<Self>>> {}

export interface ModelEnc<M, Self extends MO.SchemaAny, MEnc>
  extends Model2Int<M, Self, EncSchemaForModel<M, Self, MEnc>, MEnc> {}

export interface ModelEncSchema<M, Self extends MO.SchemaAny, MEnc, MSchema>
  extends Model2Int<M, Self, EncSchemaForModel<M, Self, MEnc>, MEnc, MSchema> {}

export interface Model2<M, Self extends MO.SchemaAny, SelfM extends MO.SchemaAny>
  extends Model2Int<M, Self, SelfM, MO.EncodedOf<Self>> {}
interface Model2Int<
  M,
  Self extends MO.SchemaAny,
  SelfM extends MO.SchemaAny,
  MEnc,
  MSchema = Self
> extends MO.Schema<
    MO.ParserInputOf<Self>,
    M,
    MO.ConstructorInputOf<Self>,
    MEnc,
    MO.ApiOf<Self>
  > {
  new (_: Compute<MO.ConstructorInputOf<Self>>): Compute<MO.ParsedShapeOf<Self>>
  [MO.schemaField]: MSchema
  readonly Model: SelfM // added
  readonly lens: Lens.Lens<M, M> // added
  readonly lenses: RecordSchemaToLenses<M, Self> // MSchema ?

  readonly Parser: MO.ParserFor<SelfM>
  readonly EParser: EParserFor<SelfM>
  readonly Constructor: MO.ConstructorFor<SelfM>
  readonly Encoder: MO.EncoderFor<SelfM>
  readonly Guard: MO.GuardFor<SelfM>
  readonly Arbitrary: MO.ArbitraryFor<SelfM>
}

export function Model<M>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecial<M>(__name)(MO.props(props))
}

export function ModelEnc<M, MEnc>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecialEnc<M, MEnc>(__name)(MO.props(props))
}

export function ModelEncSchema<M, MEnc, MSchema>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecialEncSchema<M, MEnc, MSchema>(__name)(MO.props(props))
}

export function fromModel<M>(__name?: string) {
  return <Props extends FromPropertyRecord = {}>(props: Props) =>
    ModelSpecial<M>(__name)(fromProps(props))
}

export type RecordSchemaToLenses<T, Self extends AnyRecordSchema> = {
  [K in keyof ParsedShapeOf<Self>]: Lens.Lens<T, ParsedShapeOf<Self>[K]>
}

export type PropsToLenses<T, Props extends MO.PropertyRecord> = {
  [K in keyof Props]: Lens.Lens<T, MO.ParsedShapeOf<Props[K]["_schema"]>>
}
export function lensFromProps<T>() {
  return <Props extends MO.PropertyRecord>(props: Props): PropsToLenses<T, Props> => {
    const id = Lens.id<T>()
    return Object.keys(props).reduce((prev, cur) => {
      prev[cur] = id["|>"](Lens.prop(cur as any))
      return prev
    }, {} as any)
  }
}

export function setSchema<Self extends MO.SchemaProperties<any>>(
  schemed: any,
  self: Self
) {
  schemed[MO.SchemaContinuationSymbol] = schemed[schemaField] = schemed.Model = self

  // Object.defineProperty(schemed, MO.SchemaContinuationSymbol, {
  //   value: self,
  // })

  Object.defineProperty(schemed, "include", {
    value: include(self.Api.props),
    configurable: true,
  })

  Object.defineProperty(schemed, "lenses", {
    value: lensFromProps()(self.Api.props),
    configurable: true,
  })
  Object.defineProperty(schemed, "Api", {
    value: self.Api,
    configurable: true,
  })

  Object.defineProperty(schemed, ">>>", {
    value: self[">>>"],
    configurable: true,
  })

  Object.defineProperty(schemed, "Parser", {
    value: MO.Parser.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "EParser", {
    value: MO.Parser.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Constructor", {
    value: MO.Constructor.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Encoder", {
    value: MO.Encoder.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Guard", {
    value: MO.Guard.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: MO.Arbitrary.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(identifier: MO.Annotation<Meta>, meta: Meta) =>
      new MO.SchemaAnnotated(self, identifier, meta),
    configurable: true,
  })
}

/**
 * Automatically assign the name of the Class to the Schema.
 */
export function useClassNameForSchema(cls: any) {
  setSchema(cls, cls[schemaField]["|>"](MO.named(cls.name)))
  return cls
}

export type GetProps<Self> = Self extends { Api: { props: infer Props } }
  ? Props extends PropertyRecord
    ? Props
    : never
  : never

export interface PropsExtensions<Props extends PropertyRecord> {
  include: <NewProps extends Record<string, AnyProperty>>(
    fnc: (props: Props) => NewProps
  ) => NewProps
  pick: <P extends keyof Props>(...keys: readonly P[]) => Pick<Props, P>
  omit: <P extends keyof Props>(...keys: readonly P[]) => Omit<Props, P>
}

// We don't want Copy interface from the official implementation
export function ModelSpecial<M>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): Model<M, Self> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecialEnc<M, MEnc>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): ModelEnc<M, Self, MEnc> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecialEncSchema<M, MEnc, MSchema>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): ModelEncSchema<M, Self, MEnc, MSchema> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

function makeSpecial(__name: any, self: any): any {
  const schema = __name ? self["|>"](MO.named(__name)) : self // TODO  ?? "Model(Anonymous)", but atm auto deriving openapiRef from this.
  const of_ = MO.Constructor.for(schema)["|>"](unsafe)
  const fromFields = (fields: any, target: any) => {
    for (const k of Object.keys(fields)) {
      target[k] = fields[k]
    }
  }
  const parser = MO.Parser.for(schema)

  return class {
    static [nModelBrand] = nModelBrand

    static [schemaField] = schema
    static [MO.SchemaContinuationSymbol] = schema
    static Model = schema
    static Api = schema.Api
    static [">>>"] = schema[">>>"]

    static Parser = parser
    static EParser = parser
    static Encoder = MO.Encoder.for(schema)
    static Constructor = MO.Constructor.for(schema)
    static Guard = MO.Guard.for(schema)
    static Arbitrary = MO.Arbitrary.for(schema)

    static lens = Lens.id<any>()
    static lenses = lensFromProps()(schema.Api.props)

    static include = include(schema.Api.props)
    static pick = (...props: any[]) => pick(schema.Api.props, props)
    static omit = (...props: any[]) => omit(schema.Api.props, props)

    static annotate = <Meta>(identifier: MO.Annotation<Meta>, meta: Meta) =>
      new MO.SchemaAnnotated(self, identifier, meta)

    constructor(inp?: MO.ConstructorInputOf<any>) {
      if (inp) {
        fromFields(of_(inp), this)
      }
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
    // static copy(this, that) {
    //   return fromFields(that, this)
    // }
  }
}
