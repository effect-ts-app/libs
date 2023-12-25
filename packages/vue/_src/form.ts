import type { Schema } from "@effect-app/schema"
import { createIntl, type IntlFormatters } from "@formatjs/intl"
import { ref } from "vue"

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

// export function buildFieldInfoFromFields<Fields extends StructFields>(
//   fields: Fields
// ) {
//   return fields.$$.keys.reduce(
//     (prev, cur) => {
//       prev[cur] = buildFieldInfo(fields[cur] as AnyField, cur)
//       return prev
//     },
//     {} as {
//       [K in keyof Fields]: FieldInfo<
//         Schema.From<GetSchemaFromProp<Fields[K]>>,
//         Schema.To<GetSchemaFromProp<Fields[K]>>
//       >
//     }
//   )
// }

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

// type GetSchemaFromProp<T> = T extends Field<infer S, any, any, any> ? S
//   : never

const defaultIntl = createIntl({ locale: "en" })
export const translate = ref<IntlFormatters["formatMessage"]>(defaultIntl.formatMessage.bind(defaultIntl))
export const customSchemaErrors = ref<Map<Schema<any, any>, (message: string, e: unknown, v: unknown) => string>>(
  new Map()
)

// function buildFieldInfo(
//   propOrSchema: Schema<any, any>,
//   fieldKey: PropertyKey
// ): FieldInfo<any, any> {
//   const metadata = getMetadataFromSchemaOrProp(propOrSchema) // TODO
//   const schema = propOrSchema
//   const parse = schema.parseEither

//   const nullable = AST.isUnion(schema.ast) && schema.ast.types.includes(Schema2.null.ast)

//   function renderError(e: any, v: unknown) {
//     const err = drawError(e)
//     const custom = customSchemaErrors.value.get(schema)
//       ?? (nullable?.self ? customSchemaErrors.value.get(nullable.self) : undefined)
//     return custom ? custom(err, e, v) : translate.value(
//       { defaultMessage: "The entered value is not a valid {type}: {message}", id: "validation.not_a_valid" },
//       {
//         type: translate.value({
//           defaultMessage: capitalize(fieldKey.toString()),
//           id: `fieldNames.${String(fieldKey)}`
//         }),
//         message: err.slice(err.indexOf("expected")) // TODO: this is not translated.
//       }
//     )
//   }

//   const stringRules = [
//     (v: string | null) =>
//       v === null
//       || metadata.minLength === undefined
//       || v.length >= metadata.minLength
//       || translate.value({
//         defaultMessage: "The field requires at least {minLength} characters",
//         id: "validation.string.minLength"
//       }, {
//         minLength: metadata.minLength
//       }),
//     (v: string | null) =>
//       v === null
//       || metadata.maxLength === undefined
//       || v.length <= metadata.maxLength
//       || translate.value({
//         defaultMessage: "The field cannot have more than {maxLength} characters",
//         id: "validation.string.maxLength"
//       }, {
//         maxLength: metadata.maxLength
//       })
//   ]

//   const numberRules = [
//     (v: number | null) =>
//       v === null
//       || metadata.minimum === undefined
//       || metadata.minimumExclusive && v > metadata.minimum
//       || !metadata.minimumExclusive && v >= metadata.minimum
//       || translate.value({
//         defaultMessage: "The value should be {isExclusive, select, true {larger than} other {at least}} {minimum}",
//         id: "validation.number.min"
//       }, { isExclusive: metadata.minimumExclusive, minimum: metadata.minimum }),
//     (v: number | null) =>
//       v === null
//       || metadata.maximum === undefined
//       || metadata.maximumExclusive && v < metadata.maximum
//       || !metadata.maximumExclusive && v <= metadata.maximum
//       || translate.value({
//         defaultMessage: "The value should be {isExclusive, select, true {smaller than} other {at most}} {maximum}",
//         id: "validation.number.max"
//       }, { isExclusive: metadata.maximumExclusive, maximum: metadata.maximum })
//   ]

//   const parseRule = (v: unknown) =>
//     pipe(
//       parse(v),
//       (_) =>
//         _.match(
//           {
//             onLeft: (_) => renderError(_, v),
//             onRight: ([_, optErr]) =>
//               optErr.isSome()
//                 ? renderError(optErr.value, v)
//                 : true
//           }
//         )
//     )

//   type UnknownRule = (v: unknown) => boolean | string
//   const rules: UnknownRule[] = [
//     ...(metadata.type === "text"
//       ? stringRules
//       : numberRules) as UnknownRule[],
//     parseRule as UnknownRule
//   ]

//   const info = {
//     type: metadata.type,
//     rules: [
//       (v: string) =>
//         !metadata.required
//         || v !== ""
//         || translate.value({ defaultMessage: "The field cannot be empty", id: "validation.empty" }),
//       (v: string) => {
//         const converted = convertOutInt(v, metadata.type)

//         for (const r of rules) {
//           const res = r(converted)
//           if (res !== true) {
//             return res
//           }
//         }

//         return true
//       }
//     ],
//     metadata
//   }

//   return info as any
// }

// export const buildFormFromSchema = <
//   Fields extends StructFields,
//   OnSubmitA
// >(
//   s: Schema<
//     Simplify<FromStruct<Fields>>,
//     Simplify<ToStruct<Fields>>
//   >,
//   state: Ref<FromStruct<Fields>>,
//   onSubmit: (a: ToStruct<Fields>) => Promise<OnSubmitA>
// ) => {
//   const fields = buildFieldInfoFromFields(s.Api.fields)
//   const parse = s.parseSync
//   const isDirty = ref(false)
//   const isValid = ref(true)

//   const submit1 = <A>(onSubmit: (a: To) => Promise<A>) => async <T extends Promise<{ valid: boolean }>>(e: T) => {
//     const r = await e
//     if (!r.valid) return
//     return onSubmit(parse(state.value))
//   }
//   const submit = submit1(onSubmit)

//   watch(
//     state,
//     (v) => {
//       // TODO: do better
//       isDirty.value = JSON.stringify(v) !== JSON.stringify(state.value)
//     },
//     { deep: true }
//   )

//   const submitFromState = () => submit(Promise.resolve({ valid: isValid.value }))

//   return { fields, submit, submitFromState, isDirty, isValid }
// }
