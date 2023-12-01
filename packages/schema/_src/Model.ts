/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ComputeFlat } from "@effect-app/core/utils"
import * as Lens from "@fp-ts/optic"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"

import * as Equal from "effect/Equal"
import * as Hash from "effect/Hash"

import type { EncSchemaForModel, EParserFor, FromPropertyRecord } from "./_api.js"
import { fromProps } from "./_api.js"
import * as MO from "./_schema.js"
import { schemaField } from "./_schema.js"
import type { AnyProperty, PropertyRecord, To } from "./custom.js"
import { unsafe } from "./custom/_api/condemn.js"
import type { OptionalConstructor } from "./tools.js"
import { include } from "./utils.js"

export const nModelBrand = Symbol()

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = MO.Schema<unknown, any, any, AnyRecord, any>

// Not inheriting from Schemed because we don't want `copy`
// passing SelfM down to Model2 so we only compute it once.
export interface Model<To, Self extends MO.SchemaAny> extends
  Model2<
    To,
    Self,
    EncSchemaForModel<To, Self, MO.From<Self>>,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<MO.To<Self>>
  >
{}

export interface ModelFrom<
  To,
  Self extends MO.SchemaAny,
  MEnc,
  // makes it pretty, but also helps compatibility with WebStorm it seems...
  ParsedShape2 = ComputeFlat<MO.To<Self>>
> extends
  MM<
    Self,
    EncSchemaForModel<To, Self, MEnc>,
    To,
    MO.ConstructorInputOf<Self>,
    MEnc,
    GetApiProps<Self>,
    ParsedShape2
  >
{}

export interface Model2<
  M,
  Self extends MO.SchemaAny,
  SelfM extends MO.SchemaAny,
  ParsedShape2
> extends
  MM<
    Self,
    SelfM,
    M,
    MO.ConstructorInputOf<Self>,
    MO.From<Self>,
    GetApiProps<Self>,
    ParsedShape2
  >
{}

type GetApiProps<T extends MO.SchemaAny> = T extends MO.SchemaProperties<infer Fields> ? Fields
  : never

export interface MNModel<
  Self extends MO.SchemaAny,
  To = MO.To<Self>,
  ConstructorInput = MO.ConstructorInputOf<Self>,
  From = MO.From<Self>,
  Fields = GetApiProps<Self>
> extends
  MM<
    Self,
    MO.Schema<unknown, To, ConstructorInput, From, { props: Fields }>,
    To,
    ConstructorInput,
    From,
    Fields,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<MO.To<Self>>
  >
{}

export interface MM<
  Self extends MO.SchemaAny,
  SelfM extends MO.SchemaAny,
  To,
  ConstructorInput,
  From,
  Fields,
  ParsedShape2
> extends MO.Schema<unknown, To, ConstructorInput, From, { props: Fields }> {
  new(_: OptionalConstructor<ConstructorInput>): ParsedShape2
  [MO.schemaField]: Self
  readonly to: MO.To<Self>
  readonly from: MO.From<Self>
  readonly Model: SelfM // added
  readonly lens: Lens.Lens<To, To> // added
  readonly lenses: RecordSchemaToLenses<To, Self>

  readonly Parser: MO.ParserFor<SelfM>
  readonly EParser: EParserFor<SelfM>
  readonly Constructor: MO.ConstructorFor<SelfM>
  readonly Encoder: MO.EncoderFor<SelfM>
  readonly Guard: MO.GuardFor<SelfM>
  readonly Arbitrary: MO.ArbitraryFor<SelfM>
}

/** opaque model only on To type param */
export function Model<To>(__name?: string) {
  return <ProvidedProps extends MO.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) =>
    ModelSpecial<To>(__name)(MO.struct(propsOrSchemas))
}

/** opaque model on To and From type params */
export function ModelFrom<To, From>(__name?: string) {
  return <ProvidedProps extends MO.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) =>
    ModelSpecialEnc<To, From>(__name)(MO.struct(propsOrSchemas))
}

/** fully opaque model on all type params */
export function MNModel<To, ConstructorInput, From, Fields>(
  __name?: string
) {
  return <ProvidedProps extends MO.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) => {
    const self = MO.struct(propsOrSchemas)
    return makeSpecial(__name, self) as
      & MNModel<
        typeof self,
        To,
        ConstructorInput,
        From,
        Fields
      >
      & PropsExtensions<Fields>
  }
}

export function fromModel<To>(__name?: string) {
  return <Fields extends FromPropertyRecord = {}>(props: Fields) => ModelSpecial<To>(__name)(fromProps(props))
}

export type RecordSchemaToLenses<T, Self extends AnyRecordSchema> = {
  [K in keyof To<Self>]-?: Lens.Lens<T, To<Self>[K]>
}

export type PropsToLenses<T, Fields extends MO.PropertyRecord> = {
  [K in keyof Fields]: Lens.Lens<T, MO.To<Fields[K]["_schema"]>>
}
export function lensFromProps<T>() {
  return <Fields extends MO.PropertyRecord>(props: Fields): PropsToLenses<T, Fields> => {
    const id = Lens.id<T>()
    return Object.keys(props).reduce((prev, cur) => {
      prev[cur] = id.at(cur as any)
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
    configurable: true
  })

  Object.defineProperty(schemed, "lenses", {
    value: lensFromProps()(self.Api.props),
    configurable: true
  })
  Object.defineProperty(schemed, "Api", {
    value: self.Api,
    configurable: true
  })

  Object.defineProperty(schemed, ">>>", {
    value: self[">>>"],
    configurable: true
  })

  Object.defineProperty(schemed, "Parser", {
    value: MO.Parser.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "EParser", {
    value: MO.Parser.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Constructor", {
    value: MO.Constructor.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Encoder", {
    value: MO.Encoder.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Guard", {
    value: MO.Guard.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: MO.Arbitrary.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(identifier: MO.Annotation<Meta>, meta: Meta) => new MO.SchemaAnnotated(self, identifier, meta),
    configurable: true
  })
}

/**
 * Run the parsed or constructed value through the class constructor
 * inheriting the prototype and making the parsed and constructed shape
 * instanceof the class.
 */
export function useClassConstructorForSchema(cls: any) {
  const p = cls.Parser
  const c = cls.Constructor
  const upd = pipe(
    cls[schemaField],
    MO.parser((_, env) => MO.These.map_(p(_, env), (_) => new cls(_))),
    MO.constructor((_) => MO.These.map_(c(_), (_) => new cls(_)))
  )
  setSchema(
    cls,
    upd as any
  )
  return cls
}

/**
 * Automatically assign the name of the Class to the MO.
 */
export function useClassNameForSchema(cls: any) {
  setSchema(cls, pipe(cls[schemaField], MO.named(cls.name)) as any)
  return cls
}

// TODO: call this via a transform?
/**
 * composes @link useClassNameForSchema and @link useClassConstructorForSchema
 */
export function useClassFeaturesForSchema(cls: any) {
  return useClassNameForSchema(useClassConstructorForSchema(cls))
}

export type GetModelProps<Self> = Self extends { Api: { props: infer Fields } } ? Fields extends PropertyRecord ? Fields
  : never
  : never

export interface PropsExtensions<Fields> {
  include: <NewProps extends Record<string, AnyProperty>>(
    fnc: (props: Fields) => NewProps
  ) => NewProps
  pick: <P extends keyof Fields>(...keys: readonly P[]) => Pick<Fields, P>
  omit: <P extends keyof Fields>(...keys: readonly P[]) => Omit<Fields, P>
}

// We don't want Copy interface from the official implementation
export function ModelSpecial<To>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): Model<To, Self> & PropsExtensions<GetModelProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecialEnc<To, From>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): ModelFrom<To, Self, From> & PropsExtensions<GetModelProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

function makeSpecial<Self extends MO.SchemaAny>(__name: any, self: Self): any {
  const schema = __name ? self >= MO.named(__name) : self // TODO  ?? "Model(Anonymous)", but atm auto deriving openapiRef from this.
  const of_ = MO.Constructor.for(schema) >= unsafe
  const fromFields = (fields: any, target: any) => {
    for (const k of Object.keys(fields)) {
      target[k] = fields[k]
    }
  }
  const parser = MO.Parser.for(schema)

  return class implements Hash.Hash, Equal.Equal {
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

    constructor(inp: MO.ConstructorInputOf<any> = {}) {
      // ideally inp would be optional, and default to {}, but only if the constructor input has only optional inputs..
      fromFields(of_(inp), this)
    }
    [Hash.symbol](): number {
      const ka = Object.keys(this).sort()
      if (ka.length === 0) {
        return 0
      }
      let hash = Hash.combine(Hash.hash(this[ka[0]!]))(Hash.string(ka[0]!))
      let i = 1
      while (hash && i < ka.length) {
        hash = Hash.combine(
          Hash.combine(Hash.hash(this[ka[i]!]))(Hash.string(ka[i]!))
        )(hash)
        i++
      }
      return hash
    }

    [Equal.symbol](that: unknown): boolean {
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
        eq = ka_[i] === kb_[i] && Equal.equals(this[ka_[i]!], this[kb_[i]!])
        i++
      }
      return eq
    }
  }
}
