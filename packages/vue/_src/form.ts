import { drawError, getMetadataFromSchemaOrProp, isSchema, Parser, These } from "@effect-app/prelude/schema"
import type {
  AnyProperty,
  EncodedOf,
  ParsedShapeOfCustom,
  Property,
  PropertyRecord,
  SchemaAny
} from "@effect-app/prelude/schema"
import { createIntl, type IntlFormatters } from "@formatjs/intl"
import { capitalize, ref } from "vue"

export function convertIn(v: string | null, type?: "text" | "float" | "int") {
  return v === null ? "" : type === "text" ? v : `${v}`
}

export function convertOutInt(v: string, type?: "text" | "float" | "int") {
  v = v == null ? v : v.trim()
  const c = v === "" ? null : type === "float" ? parseFloat(v) : type === "int" ? parseInt(v) : v
  return c
}

export function convertOut(v: string, set: (v: unknown | null) => void, type?: "text" | "float" | "int") {
  return set(convertOutInt(v, type))
}

export function buildFieldInfoFromProps<Props extends PropertyRecord>(
  props: Props
) {
  return props.$$.keys.reduce(
    (prev, cur) => {
      prev[cur] = buildFieldInfo(props[cur] as AnyProperty, cur)
      return prev
    },
    {} as {
      [K in keyof Props]: FieldInfo<
        EncodedOf<GetSchemaFromProp<Props[K]>>,
        ParsedShapeOfCustom<GetSchemaFromProp<Props[K]>>
      >
    }
  )
}

export interface FieldMetadata {
  minLength: number | undefined
  maxLength: number | undefined
  required: boolean
}

const f = Symbol()
abstract class PhantomTypeParameter<
  Identifier extends keyof any,
  InstantiatedType
> {
  protected abstract readonly _: {
    readonly [NameP in Identifier]: (_: InstantiatedType) => InstantiatedType
  }
}
export interface FieldInfo<Tin, Tout> extends PhantomTypeParameter<typeof f, { in: Tin; out: Tout }> {
  rules: ((v: string) => boolean | string)[]
  metadata: FieldMetadata
  type: "text" | "float" | "int" // todo; multi-line vs single line text
}

type GetSchemaFromProp<T> = T extends Property<infer S, any, any, any> ? S
  : never

const defaultIntl = createIntl({ locale: "en" })
export const translate = ref<IntlFormatters["formatMessage"]>(defaultIntl.formatMessage.bind(defaultIntl))
export const customSchemaErrors = ref<Map<SchemaAny, (message: string, e: unknown, v: unknown) => string>>(new Map())

function buildFieldInfo(
  propOrSchema: AnyProperty | SchemaAny,
  fieldKey: PropertyKey
): FieldInfo<any, any> {
  const metadata = getMetadataFromSchemaOrProp(propOrSchema)
  const schema = isSchema(propOrSchema) ? propOrSchema : propOrSchema._schema
  const parse = Parser.for(schema)

  const nullable = Schema.findAnnotation(schema, Schema.nullableIdentifier)

  function renderError(e: any, v: unknown) {
    const err = drawError(e)
    const custom = customSchemaErrors.value.get(schema)
      ?? (nullable?.self ? customSchemaErrors.value.get(nullable.self) : undefined)
    return custom ? custom(err, e, v) : translate.value(
      { defaultMessage: "The entered value is not a valid {type}: {message}", id: "validation.not_a_valid" },
      {
        type: translate.value({
          defaultMessage: capitalize(fieldKey.toString()),
          id: `fieldNames.${String(fieldKey)}`
        }),
        message: err.slice(err.indexOf("expected")) // TODO: this is not translated.
      }
    )
  }

  const stringRules = [
    (v: string | null) =>
      v === null
      || metadata.minLength === undefined
      || v.length >= metadata.minLength
      || translate.value({
        defaultMessage: "The field requires at least {minLength} characters",
        id: "validation.string.minLength"
      }, {
        minLength: metadata.minLength
      }),
    (v: string | null) =>
      v === null
      || metadata.maxLength === undefined
      || v.length <= metadata.maxLength
      || translate.value({
        defaultMessage: "The field cannot have more than {maxLength} characters",
        id: "validation.string.maxLength"
      }, {
        maxLength: metadata.maxLength
      })
  ]

  const numberRules = [
    (v: number | null) =>
      v === null
      || metadata.minimum === undefined
      || metadata.minimumExclusive && v > metadata.minimum
      || !metadata.minimumExclusive && v >= metadata.minimum
      || translate.value({
        defaultMessage: "The value should be {isExclusive, select, true {larger than} other {at least}} {minimum}",
        id: "validation.number.min"
      }, { isExclusive: metadata.minimumExclusive, minimum: metadata.minimum }),
    (v: number | null) =>
      v === null
      || metadata.maximum === undefined
      || metadata.maximumExclusive && v < metadata.maximum
      || !metadata.maximumExclusive && v <= metadata.maximum
      || translate.value({
        defaultMessage: "The value should be {isExclusive, select, true {smaller than} other {at most}} {maximum}",
        id: "validation.number.max"
      }, { isExclusive: metadata.maximumExclusive, maximum: metadata.maximum })
  ]

  const parseRule = (v: unknown) =>
    pipe(
      parse(v),
      These.result,
      (_) =>
        _.match(
          (_) => renderError(_, v),
          ([_, optErr]) =>
            optErr.isSome()
              ? renderError(optErr.value, v)
              : true
        )
    )

  type UnknownRule = (v: unknown) => boolean | string
  const rules: UnknownRule[] = [
    ...(metadata.type === "text"
      ? stringRules
      : numberRules) as UnknownRule[],
    parseRule as UnknownRule
  ]

  const info = {
    type: metadata.type,
    rules: [
      (v: string) =>
        !metadata.required
        || v !== ""
        || translate.value({ defaultMessage: "The field cannot be empty", id: "validation.empty" }),
      (v: string) => {
        const converted = convertOutInt(v, metadata.type)

        for (const r of rules) {
          const res = r(converted)
          if (res !== true) {
            return res
          }
        }

        return true
      }
    ],
    metadata
  }

  return info as any
}
