/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ComputeFlat } from "@effect-app/core/utils"
import * as Lens from "@fp-ts/optic"
import * as Equal from "effect/Equal"
import * as Hash from "effect/Hash"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"
import type { EncSchemaForClass, EParserFor, SpecificFieldRecord } from "./_api.js"
import { specificStruct } from "./_api.js"
import * as S from "./_schema.js"
import { schemaField } from "./_schema.js"
import type { AnyField, FieldRecord, To } from "./custom.js"
import { unsafe } from "./custom/_api/condemn.js"
import { type CustomSchemaException, parseEither, parseFromEither, parseFromSync, parseSync } from "./ext2.js"
import type { OptionalConstructor } from "./tools.js"
import { include } from "./utils.js"

export const nClassBrand = Symbol()

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = S.Schema<unknown, any, any, AnyRecord, any>

// Not inheriting from Schemed because we don't want `copy`
// passing SelfM down to Class2 so we only compute it once.
export interface Class<To, Self extends S.SchemaAny> extends
  Class2<
    To,
    Self,
    EncSchemaForClass<To, Self, S.From<Self>>,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<S.To<Self>>
  >
{}

export interface ClassFrom<
  To,
  Self extends S.SchemaAny,
  MEnc,
  // makes it pretty, but also helps compatibility with WebStorm it seems...
  To2 = ComputeFlat<S.To<Self>>
> extends
  MM<
    Self,
    EncSchemaForClass<To, Self, MEnc>,
    To,
    S.ConstructorInputOf<Self>,
    MEnc,
    GetApiProps<Self>,
    To2
  >
{}

export interface Class2<
  M,
  Self extends S.SchemaAny,
  SelfM extends S.SchemaAny,
  To2
> extends
  MM<
    Self,
    SelfM,
    M,
    S.ConstructorInputOf<Self>,
    S.From<Self>,
    GetApiProps<Self>,
    To2
  >
{}

type GetApiProps<T extends S.SchemaAny> = T extends S.SchemaProperties<infer Fields> ? Fields
  : never

export interface ExtendedClass<
  Self extends S.SchemaAny,
  To = S.To<Self>,
  ConstructorInput = S.ConstructorInputOf<Self>,
  From = S.From<Self>,
  Fields = GetApiProps<Self>
> extends
  MM<
    Self,
    S.Schema<unknown, To, ConstructorInput, From, { fields: Fields }>,
    To,
    ConstructorInput,
    From,
    Fields,
    // makes it pretty, but also helps compatibility with WebStorm it seems...
    ComputeFlat<S.To<Self>>
  >
{}

export interface MM<
  Self extends S.SchemaAny,
  SelfM extends S.SchemaAny,
  To,
  ConstructorInput,
  From,
  Fields,
  To2
> extends S.Schema<unknown, To, ConstructorInput, From, { fields: Fields }> {
  new(_: OptionalConstructor<ConstructorInput>): To2 // & Equal.Equal & S.Copy // we leave them out so that we can still spread while adhering to the type, if we want to...
  [S.schemaField]: Self
  readonly to: S.To<Self>
  readonly from: S.From<Self>
  readonly Model: SelfM // added
  readonly lens: Lens.Lens<To, To> // added
  readonly lenses: RecordSchemaToLenses<To, Self>

  readonly Parser: S.ParserFor<SelfM>
  readonly EParser: EParserFor<SelfM>
  readonly Constructor: S.ConstructorFor<SelfM>
  readonly encodeSync: S.EncoderFor<SelfM>
  readonly parseSync: (
    i: S.ParserInputOf<SelfM>,
    env?: S.Parser.ParserEnv
  ) => S.To<SelfM>
  readonly parseEither: (
    i: S.ParserInputOf<SelfM>,
    env?: S.Parser.ParserEnv
  ) => Either<CustomSchemaException, S.To<SelfM>>
  readonly parseFromEither: (
    i: S.From<SelfM>,
    env?: S.Parser.ParserEnv
  ) => Either<CustomSchemaException, S.To<SelfM>>
  readonly parseFromSync: (i: S.From<SelfM>, env?: S.Parser.ParserEnv) => S.To<SelfM>
  readonly is: S.GuardFor<SelfM>
  readonly Arbitrary: S.ArbitraryFor<SelfM>
}

/** opaque model only on To type param */
export function Class<To>(__name?: string) {
  return <ProvidedProps extends S.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) =>
    ClassSpecial<To>(__name)(S.struct(propsOrSchemas))
}

/** opaque model on To and From type params */
export function ClassFrom<To, From>(__name?: string) {
  return <ProvidedProps extends S.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) =>
    ClassSpecialEnc<To, From>(__name)(S.struct(propsOrSchemas))
}

/** fully opaque model on all type params */
export function ExtendedClass<To, ConstructorInput, From, Fields>(
  __name?: string
) {
  return <ProvidedProps extends S.PropertyOrSchemaRecord = {}>(propsOrSchemas: ProvidedProps) => {
    const self = S.struct(propsOrSchemas)
    return makeSpecial(__name, self) as
      & ExtendedClass<
        typeof self,
        To,
        ConstructorInput,
        From,
        Fields
      >
      & PropsExtensions<Fields>
  }
}

export function fromClass<To>(__name?: string) {
  return <Fields extends SpecificFieldRecord = {}>(fields: Fields) => ClassSpecial<To>(__name)(specificStruct(fields))
}

export type RecordSchemaToLenses<T, Self extends AnyRecordSchema> = {
  [K in keyof To<Self>]-?: Lens.Lens<T, To<Self>[K]>
}

export type PropsToLenses<T, Fields extends S.FieldRecord> = {
  [K in keyof Fields]: Lens.Lens<T, S.To<Fields[K]["_schema"]>>
}
export function lensFields<T>() {
  return <Fields extends S.FieldRecord>(fields: Fields): PropsToLenses<T, Fields> => {
    const id = Lens.id<T>()
    return Object.keys(fields).reduce((prev, cur) => {
      prev[cur] = id.at(cur as any)
      return prev
    }, {} as any)
  }
}

export function setSchema<Self extends S.SchemaProperties<any>>(
  schemed: any,
  self: Self
) {
  schemed[S.SchemaContinuationSymbol] = schemed[schemaField] = schemed.Model = self

  // Object.defineProperty(schemed, S.SchemaContinuationSymbol, {
  //   value: self,
  // })

  Object.defineProperty(schemed, "include", {
    value: include(self.Api.fields),
    configurable: true
  })

  Object.defineProperty(schemed, "lenses", {
    value: lensFields()(self.Api.fields),
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
    value: S.Parser.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "EParser", {
    value: S.Parser.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Constructor", {
    value: S.Constructor.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "encodeSync", {
    value: S.Encoder.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "parseEither", {
    value: parseEither(self),
    configurable: true
  })

  Object.defineProperty(schemed, "parseSync", {
    value: parseSync(self),
    configurable: true
  })

  Object.defineProperty(schemed, "parseFromEither", {
    value: parseFromEither(self),
    configurable: true
  })

  Object.defineProperty(schemed, "parseFromSync", {
    value: parseFromSync(self),
    configurable: true
  })

  Object.defineProperty(schemed, "is", {
    value: S.is(self),
    configurable: true
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: S.Arbitrary.for(self),
    configurable: true
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(identifier: S.Annotation<Meta>, meta: Meta) => new S.SchemaAnnotated(self, identifier, meta),
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
    S.parser((_, env) => S.These.map_(p(_, env), (_) => new cls(_))),
    S.constructor((_) => S.These.map_(c(_), (_) => new cls(_)))
  )
  setSchema(
    cls,
    upd as any
  )
  return cls
}

/**
 * Automatically assign the name of the Class to the S.
 */
export function useClassNameForSchema(cls: any) {
  setSchema(cls, pipe(cls[schemaField], S.named(cls.name)) as any)
  return cls
}

// TODO: call this via a transform?
/**
 * composes @link useClassNameForSchema and @link useClassConstructorForSchema
 */
export function useClassFeaturesForSchema(cls: any) {
  return useClassNameForSchema(useClassConstructorForSchema(cls))
}

export type GetClassProps<Self> = Self extends { Api: { fields: infer Fields } } ? Fields extends FieldRecord ? Fields
  : never
  : never

export interface PropsExtensions<Fields> {
  include: <NewProps extends Record<string, AnyField>>(
    fnc: (fields: Fields) => NewProps
  ) => NewProps
  pick: <P extends keyof Fields>(...keys: readonly P[]) => Pick<Fields, P>
  omit: <P extends keyof Fields>(...keys: readonly P[]) => Omit<Fields, P>
}

// We don't want Copy interface from the official implementation
export function ClassSpecial<To>(__name?: string) {
  return <Self extends S.SchemaAny & { Api: { fields: any } }>(
    self: Self
  ): Class<To, Self> & PropsExtensions<GetClassProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

export function ClassSpecialEnc<To, From>(__name?: string) {
  return <Self extends S.SchemaAny & { Api: { fields: any } }>(
    self: Self
  ): ClassFrom<To, Self, From> & PropsExtensions<GetClassProps<Self>> => {
    return makeSpecial(__name, self)
  }
}

function makeSpecial<Self extends S.SchemaAny>(__name: any, self: Self): any {
  const schema = __name ? self >= S.named(__name) : self // TODO  ?? "Class(Anonymous)", but atm auto deriving openapiRef from this.
  const of_ = S.Constructor.for(schema) >= unsafe
  const parser = S.Parser.for(schema)

  return class implements Equal.Equal, S.Copy {
    static [nClassBrand] = nClassBrand

    static [schemaField] = schema
    static [S.SchemaContinuationSymbol] = schema
    static Model = schema
    static Api = schema.Api
    static [">>>"] = schema[">>>"]

    static Parser = parser
    static EParser = parser
    static encodeSync = S.Encoder.for(schema)
    static Constructor = S.Constructor.for(schema)
    static is = S.is(schema)
    static Arbitrary = S.Arbitrary.for(schema)

    static lens = Lens.id<any>()
    static lenses = lensFields()(schema.Api.fields)

    static include = include(schema.Api.fields)
    static pick = (...fields: any[]) => pick(schema.Api.fields, fields)
    static omit = (...fields: any[]) => omit(schema.Api.fields, fields)

    static annotate = <Meta>(identifier: S.Annotation<Meta>, meta: Meta) =>
      new S.SchemaAnnotated(self, identifier, meta)

    constructor(inp?: S.ConstructorInputOf<any>) {
      if (inp !== null) {
        Object.assign(this, of_(inp ?? {}))
      }
    }

    [Lens.cloneTrait](a: any) {
      // @ts-expect-error
      const inst = new this.constructor(null)
      Object.assign(inst, a)
      return inst
    }

    copy(partial: any) {
      return this[Lens.cloneTrait]({ ...this, ...partial })
    }
    [Hash.symbol](): number {
      return Hash.structure(this)
    }

    [Equal.symbol](that: unknown): boolean {
      const selfKeys = Object.keys(this)
      const thatKeys = Object.keys(that as object)
      if (selfKeys.length !== thatKeys.length) {
        return false
      }
      for (const key of selfKeys) {
        if (!(key in (that as object) && Equal.equals((this as any)[key], (that as any)[key]))) {
          return false
        }
      }
      return true
    }
  }
}