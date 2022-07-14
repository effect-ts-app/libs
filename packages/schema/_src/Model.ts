/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as St from "@effect-ts/core/Structural"
import { ComputeFlat } from "@effect-ts/core/Utils"
import * as Lens from "@effect-ts/monocle/Lens"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"

import {
  EncSchemaForModel,
  EParserFor,
  FromPropertyRecord,
  fromProps,
} from "./_api/index.js"
import * as MO from "./_schema.js"
import { schemaField } from "./_schema.js"
import { unsafe } from "./custom/_api/condemn.js"
import {
  AnyProperty,
  EncodedOf,
  ParsedShapeOf,
  PropertyRecord,
} from "./custom/index.js"
import { include } from "./utils.js"

export const nModelBrand = Symbol()

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = MO.Schema<unknown, any, any, AnyRecord, any>

// Not inheriting from Schemed because we don't want `copy`
// passing SelfM down to Model2 so we only compute it once.
export interface Model<ParsedShape, Self extends MO.SchemaAny>
  extends Model2<
    ParsedShape,
    Self,
    EncSchemaForModel<ParsedShape, Self, MO.EncodedOf<Self>>,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<MO.ParsedShapeOf<Self>>
  > {}

export interface Model3<ParsedShape, ParsedShape2, Self extends MO.SchemaAny>
  extends Model2<
    ParsedShape,
    Self,
    EncSchemaForModel<ParsedShape, Self, MO.EncodedOf<Self>>,
    ParsedShape2
  > {}

export interface ModelEnc<
  ParsedShape,
  Self extends MO.SchemaAny,
  MEnc,
  // makes it pretty, but also helps compatibility with WebStorm it seems...
  ParsedShape2 = ComputeFlat<MO.ParsedShapeOf<Self>>
> extends MM<
    Self,
    EncSchemaForModel<ParsedShape, Self, MEnc>,
    ParsedShape,
    MO.ConstructorInputOf<Self>,
    MEnc,
    GetApiProps<Self>,
    ParsedShape2
  > {}

export interface ModelEnc3<ParsedShape, ParsedShape2, Self extends MO.SchemaAny, MEnc>
  extends MM<
    Self,
    EncSchemaForModel<ParsedShape, Self, MEnc>,
    ParsedShape,
    MO.ConstructorInputOf<Self>,
    MEnc,
    GetApiProps<Self>,
    ParsedShape2
  > {}

export interface Model2<
  M,
  Self extends MO.SchemaAny,
  SelfM extends MO.SchemaAny,
  ParsedShape2
> extends MM<
    Self,
    SelfM,
    M,
    MO.ConstructorInputOf<Self>,
    MO.EncodedOf<Self>,
    GetApiProps<Self>,
    ParsedShape2
  > {}

type GetApiProps<T extends MO.SchemaAny> = T extends MO.SchemaProperties<infer Props>
  ? Props
  : never

export interface MNModel<
  Self extends MO.SchemaAny,
  ParsedShape = MO.ParsedShapeOf<Self>,
  ConstructorInput = MO.ConstructorInputOf<Self>,
  Encoded = MO.EncodedOf<Self>,
  Props = GetApiProps<Self>
> extends MM<
    Self,
    MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, { props: Props }>,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Props,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<MO.ParsedShapeOf<Self>>
  > {}

export interface MM<
  Self extends MO.SchemaAny,
  SelfM extends MO.SchemaAny,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Props,
  ParsedShape2
> extends MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, { props: Props }> {
  new (_: ConstructorInput): ParsedShape2
  [MO.schemaField]: Self
  readonly parsed: ParsedShapeOf<Self>
  readonly encoded: EncodedOf<Self>
  readonly Model: SelfM // added
  readonly lens: Lens.Lens<ParsedShape, ParsedShape> // added
  readonly lenses: RecordSchemaToLenses<ParsedShape, Self>

  readonly Parser: MO.ParserFor<SelfM>
  readonly EParser: EParserFor<SelfM>
  readonly Constructor: MO.ConstructorFor<SelfM>
  readonly Encoder: MO.EncoderFor<SelfM>
  readonly Guard: MO.GuardFor<SelfM>
  readonly Arbitrary: MO.ArbitraryFor<SelfM>
}

export function Model<ParsedShape>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecial<ParsedShape>(__name)(MO.props(props))
}

export function ModelEnc<ParsedShape, Encoded>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecialEnc<ParsedShape, Encoded>(__name)(MO.props(props))
}

export function Model3<ParsedShape, ParsedShape2>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecial3<ParsedShape, ParsedShape2>(__name)(MO.props(props))
}

export function Model4<ParsedShape>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecial3<ParsedShape, {}>(__name)(MO.props(props))
}

export function ModelEnc3<ParsedShape, ParsedShape2, Encoded>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecialEnc3<ParsedShape, ParsedShape2, Encoded>(__name)(MO.props(props))
}

export function ModelEnc4<ParsedShape, Encoded>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecialEnc3<ParsedShape, {}, Encoded>(__name)(MO.props(props))
}

export function MNModel<ParsedShape, ConstructorInput, Encoded, Props>(
  __name?: string
) {
  return <ProvidedProps extends MO.PropertyRecord = {}>(props: ProvidedProps) => {
    const self = MO.props(props)
    return makeSpecial(__name, self) as MNModel<
      typeof self,
      ParsedShape,
      ConstructorInput,
      Encoded,
      Props
    > &
      PropsExtensions<Props>
  }
  //MNModelSpecial<M, MEnc>(__name)(MO.props(props))
}

// export function MNModel3<ParsedShape, ParsedShape2, ConstructorInput, Encoded, Props>(
//   __name?: string
// ) {
//   return <ProvidedProps extends MO.PropertyRecord = {}>(props: ProvidedProps) => {
//     const self = MO.props(props)
//     return makeSpecial(__name, self) as MNModel<
//       typeof self,
//       ParsedShape,
//       ConstructorInput,
//       Encoded,
//       Props,
//     > &
//       PropsExtensions<Props>
//   }
//   //MNModelSpecial<M, MEnc>(__name)(MO.props(props))
// }

// export function MNModel4<ParsedShape, ConstructorInput, Encoded, Props>(
//   __name?: string
// ) {
//   return <ProvidedProps extends MO.PropertyRecord = {}>(props: ProvidedProps) => {
//     const self = MO.props(props)
//     return makeSpecial(__name, self) as MNModel<
//       typeof self,
//       ParsedShape,
//       ConstructorInput,
//       Encoded,
//       Props,
//       ProvidedProps,
//       {}
//     > &
//       PropsExtensions<Props>
//   }
//   //MNModelSpecial<M, MEnc>(__name)(MO.props(props))
// }

export function fromModel<ParsedShape>(__name?: string) {
  return <Props extends FromPropertyRecord = {}>(props: Props) =>
    ModelSpecial<ParsedShape>(__name)(fromProps(props))
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
      prev[cur] = id.prop(cur as any)
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
 * Automatically assign the name of the Class to the MO.
 */
export function useClassNameForSchema(cls: any) {
  setSchema(cls, pipe(cls[schemaField], MO.named(cls.name)) as any)
  return cls
}

export type GetProps<Self> = Self extends { Api: { props: infer Props } }
  ? Props extends PropertyRecord
    ? Props
    : never
  : never

export interface PropsExtensions<Props> {
  include: <NewProps extends Record<string, AnyProperty>>(
    fnc: (props: Props) => NewProps
  ) => NewProps
  pick: <P extends keyof Props>(...keys: readonly P[]) => Pick<Props, P>
  omit: <P extends keyof Props>(...keys: readonly P[]) => Omit<Props, P>
}

// We don't want Copy interface from the official implementation
export function ModelSpecial<ParsedShape>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): Model<ParsedShape, Self> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecialEnc<ParsedShape, Encoded>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): ModelEnc<ParsedShape, Self, Encoded> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecial3<ParsedShape, ParsedShape2>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): Model3<ParsedShape, ParsedShape2, Self> & PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ModelSpecialEnc3<ParsedShape, ParsedShape2, Encoded>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): ModelEnc3<ParsedShape, ParsedShape2, Self, Encoded> &
    PropsExtensions<GetProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

// export function MNModelSpecial<ParsedShape, MEnc>(__name?: string) {
//   return <Self extends MO.SchemaAny & { Api: { props: any } }>(
//     self: Self
//   ): MNModel<M, Self, MEnc> & PropsExtensions<GetProps<Self>> => {
//     return makeSpecial(__name, self)
//   }
// }

function makeSpecial<Self extends MO.SchemaAny>(__name: any, self: Self): any {
  const schema = __name ? self >= MO.named(__name) : self // TODO  ?? "Model(Anonymous)", but atm auto deriving openapiRef from this.
  const of_ = MO.Constructor.for(schema) >= unsafe
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

    constructor(inp: MO.ConstructorInputOf<any>) {
      // ideally inp would be optional, and default to {}, but only if the constructor input has only optional inputs..
      fromFields(of_(inp), this)
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
