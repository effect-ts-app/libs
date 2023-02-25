import { drawError, getMetadataFromSchemaOrProp, isSchema, Parser, These } from "@effect-app/prelude/schema"
import type {
  AnyProperty,
  EncodedOf,
  ParsedShapeOfCustom,
  Property,
  PropertyRecord,
  SchemaAny
} from "@effect-app/prelude/schema"
import { capitalize } from "vue"

export function convertIn(v: string | null) {
  return v === null ? "" : v
}

export function convertOut(v: string | null, set: (v: string | null) => void) {
  v = v == null ? v : v.trim()
  return set(v === "" ? null : v)
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
  type: "text"
}

type GetSchemaFromProp<T> = T extends Property<infer S, any, any, any> ? S
  : never

function buildFieldInfo(
  propOrSchema: AnyProperty | SchemaAny,
  fieldKey: PropertyKey
): FieldInfo<any, any> {
  const metadata = getMetadataFromSchemaOrProp(propOrSchema)
  const schema = isSchema(propOrSchema) ? propOrSchema : propOrSchema._schema
  const parse = Parser.for(schema)

  function renderError(e: any) {
    const err = drawError(e)
    return `The entered value is not a valid ${
      capitalize(
        fieldKey.toString()
      )
    } (${err.slice(err.indexOf("expected"))})`
  }

  const info = {
    type: "text", // TODO: various types
    rules: [
      (v: string) => !metadata.required || v !== "" || "The field cannot be empty",
      (v: string) =>
        v === "" ||
        metadata.minLength === undefined ||
        v.length >= metadata.minLength ||
        `The field requires at least ${metadata.minLength} characters`,
      (v: string) =>
        v === "" ||
        metadata.maxLength === undefined ||
        v.length <= metadata.maxLength ||
        `The field cannot have more than ${metadata.maxLength} characters`,
      (v: unknown) =>
        pipe(
          parse(v === "" ? null : v),
          These.result,
          _ =>
            _.match(
              renderError,
              ([_, optErr]) =>
                optErr.isSome()
                  ? renderError(optErr.value)
                  : true
            )
        )
    ],
    metadata
  }

  return info as any
}
