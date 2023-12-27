import { AST, S } from "@effect-app/schema"
import type { Schema } from "@effect-app/schema"
import { createIntl, type IntlFormatters } from "@formatjs/intl"
import type { Ref } from "vue"
import { capitalize, ref, watch } from "vue"

import * as JSONSchema from "@effect/schema/JSONSchema"
import type { ParseError } from "@effect/schema/ParseResult"

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

export function buildFieldInfoFromFields<From extends Record<PropertyKey, any>, To extends Record<PropertyKey, any>>(
  fields: Schema<From, To>
) {
  if (!AST.isTypeLiteral(fields.ast)) throw new Error("not a struct type")
  return fields.ast.propertySignatures.reduce(
    (prev, cur) => {
      ;(prev as any)[cur.name] = buildFieldInfo(cur)
      return prev
    },
    {} as {
      [K in keyof To]: FieldInfo<To[K]>
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
export interface FieldInfo<Tout> extends PhantomTypeParameter<typeof f, { out: Tout }> {
  rules: ((v: string) => boolean | string)[]
  metadata: FieldMetadata
  type: "text" | "float" | "int" // todo; multi-line vs single line text
}

// type GetSchemaFromProp<T> = T extends Field<infer S, any, any, any> ? S
//   : never

const defaultIntl = createIntl({ locale: "en" })
export const translate = ref<IntlFormatters["formatMessage"]>(defaultIntl.formatMessage.bind(defaultIntl))
export const customSchemaErrors = ref<Map<AST.AST, (message: string, e: unknown, v: unknown) => string>>(
  new Map()
)

function buildFieldInfo(
  property: AST.PropertySignature
): FieldInfo<any> {
  const propertyKey = property.name
  const schema = S.make(property.type)
  const metadata = getMetadataFromSchema(property.type) // TODO
  const parse = schema.parseEither

  const nullable = AST.isUnion(property.type) && property.type.types.includes(Schema2.null.ast)
  const realSelf = nullable && AST.isUnion(property.type)
    ? property.type.types.filter((_) => _ !== Schema2.null.ast)[0]!
    : property.type

  function renderError(e: ParseError, v: unknown) {
    const err = e.toString()
    const custom = customSchemaErrors.value.get(realSelf)
    return custom ? custom(err, e, v) : translate.value(
      { defaultMessage: "The entered value is not a valid {type}: {message}", id: "validation.not_a_valid" },
      {
        type: translate.value({
          defaultMessage: capitalize(propertyKey.toString()),
          id: `fieldNames.${String(propertyKey)}`
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
      (_) =>
        _.match(
          {
            onLeft: (_) => renderError(_, v),
            onRight: () => true
          }
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

export const buildFormFromSchema = <
  From extends Record<PropertyKey, any>,
  To extends Record<PropertyKey, any>,
  OnSubmitA
>(
  s: Schema<
    From,
    To
  >,
  state: Ref<From>,
  onSubmit: (a: To) => Promise<OnSubmitA>
) => {
  const fields = buildFieldInfoFromFields(s)
  const parse = s.parseSync
  const isDirty = ref(false)
  const isValid = ref(true)

  const submit1 = <A>(onSubmit: (a: To) => Promise<A>) => async <T extends Promise<{ valid: boolean }>>(e: T) => {
    const r = await e
    if (!r.valid) return
    return onSubmit(parse(state.value))
  }
  const submit = submit1(onSubmit)

  watch(
    state,
    (v) => {
      // TODO: do better
      isDirty.value = JSON.stringify(v) !== JSON.stringify(state.value)
    },
    { deep: true }
  )

  const submitFromState = () => submit(Promise.resolve({ valid: isValid.value }))

  return { fields, submit, submitFromState, isDirty, isValid }
}

export function getMetadataFromSchema(
  ast: AST.AST
): {
  type: "int" | "float" | "text"
  minimum?: number
  maximum?: number
  minimumExclusive?: boolean
  maximumExclusive?: boolean
  minLength?: number
  maxLength?: number
  required: boolean
} {
  const nullable = AST.isUnion(ast) && ast.types.includes(Schema2.null.ast)
  const realSelf = nullable && AST.isUnion(ast)
    ? ast.types.filter((_) => _ !== Schema2.null.ast)[0]!
    : ast

  const jschema = JSONSchema.to(S.make(realSelf)) as any

  const isNumber = jschema.type === "number" || jschema.type === "integer"
  const isInt = jschema.type === "integer"
  return {
    type: isInt ? "int" as const : isNumber ? "float" as const : "text" as const,
    minimum: jschema.minimum,
    minimumExclusive: jschema.exclusiveMinimum,
    maximum: jschema.maximum,
    maximumExclusive: jschema.exclusiveMaximum,
    minLength: jschema.minLength,
    maxLength: jschema.maxLength,
    required: !nullable
  }
}
