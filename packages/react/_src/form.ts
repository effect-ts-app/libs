/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Type the return values of the functions preferably with interfaces!

import { getMetadataFromSchemaOrProp, getRegisterFromSchemaOrProp, isSchema } from "@effect-app/prelude/schema"
import {
  type AnyError,
  EParserFor,
  type FromStruct,
  Parser,
  type PropertyRecord,
  type StructConstructor,
  These,
  type ToStruct,
  unsafe
} from "@effect-app/schema"
import type { BaseSyntheticEvent } from "react"
import { useCallback, useMemo } from "react"
import type {
  Control,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
  RegisterOptions,
  SubmitErrorHandler,
  UnpackNestedValue,
  UseControllerProps,
  UseFormProps,
  UseFormRegister,
  UseFormStateReturn,
  Validate
} from "react-hook-form"
import { useController, useForm as useFormOriginal } from "react-hook-form"
import type { IntlShape } from "react-intl"
import { useIntl } from "react-intl"
import { capitalize, isBetweenMidnightAndEndOfDay } from "./utils.js"

export interface ControlMui<
  Fields extends Schema.PropertyRecord,
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> extends Control<TFieldValues, TContext> {
  fields: Fields
}

export interface ControllerMuiProps<
  Fields extends Schema.PropertyRecord,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<UseControllerProps<TFieldValues, TName>, "control"> {
  control: ControlMui<Fields, TFieldValues>
}

export function useControllerMui<
  Fields extends Schema.PropertyRecord,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(fields: ControllerMuiProps<Fields, TFieldValues, TName>) {
  const [getFieldMetadata, getMetadata, getRegisterMeta] = useGetMeta<
    TFieldValues,
    Fields
  >(fields.control.fields)
  const r = useController({
    ...fields,
    rules: { ...getFieldMetadata(fields.name), ...fields.rules }
  })

  const {
    field,
    fieldState: { error }
  } = r

  const fieldOnChange = field.onChange

  const { metadata, metadataMui, onChange, transform } = useMemo(() => {
    const getMetadataMui = <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName
    ) => {
      return {
        ...getMetadata(name),
        error: !!error,
        helperText: error?.message
      }
    }
    const { transform } = getRegisterMeta(fields.name)
    const onChange = (evt: any) => fieldOnChange(transform.output(getControllerValue(evt)))

    return {
      metadata: getMetadata(fields.name),
      metadataMui: getMetadataMui(fields.name),
      onChange,
      transform
    }
  }, [getRegisterMeta, fields.name, fieldOnChange, getMetadata, error])

  const { ref, ...restField } = field

  const value = transform ? transform.input(field.value) : field.value

  return {
    ...r,
    field: {
      ...field,
      onChange,
      value,
      ...metadata
    },
    fieldMui: {
      innerRef: ref,
      ...restField,
      onChange,
      value,
      ...metadataMui
    }
  }
}

const isCheckBoxInput = (element: any) => element.type === "checkbox"

const isDateObject = (data: any) => data instanceof Date

const isNullOrUndefined = (value: any) => value == null

const isObjectType = (value: any) => typeof value === "object"
const isObject = (value: any) =>
  !isNullOrUndefined(value)
  && !Array.isArray(value)
  && isObjectType(value)
  && !isDateObject(value)

function getControllerValue(event: any) {
  return isObject(event) && event.target
    ? isCheckBoxInput(event.target)
      ? event.target.checked
      : event.target.value
    : event
}

interface Metadata {
  minLength: number | undefined
  maxLength: number | undefined
  required: boolean
}

export interface FieldMui<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerRenderProps<TFieldValues, TName>, "ref">, Metadata {
  innerRef: ControllerRenderProps<TFieldValues, TName>["ref"]

  onChange: (
    evtOrValue:
      | {
        target: { value: UnpackNestedValue<FieldPathValue<TFieldValues, TName>> }
      }
      | UnpackNestedValue<FieldPathValue<TFieldValues, TName>>
  ) => void

  error: boolean
  helperText: string | undefined
}

export interface MuiRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  field: ControllerRenderProps<TFieldValues, TName> & Metadata
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<TFieldValues>

  fieldMui: FieldMui<TFieldValues, TName>
}

export interface MuiProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Fields extends Schema.PropertyRecord = Schema.PropertyRecord
> extends Omit<ControllerProps<TFieldValues, TName>, "control" | "render"> {
  control: ControlMui<Fields, TFieldValues>
  render: (_: MuiRenderProps<TFieldValues, TName>) => React.ReactElement
}

// to apply the metadata also to the field
export function ControllerMui<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Fields extends Schema.PropertyRecord = Schema.PropertyRecord
>(fields: MuiProps<TFieldValues, TName, Fields>) {
  return fields.render(useControllerMui(fields))
}

export interface Val<T> {
  value: T
  message: string
}

export interface FormMetadata {
  minLength: Val<number> | undefined
  maxLength: Val<number> | undefined
  required: Val<boolean> | undefined
}

function getFormMetadata(
  intl: IntlShape,
  p: Schema.AnyProperty | Schema.SchemaAny
): FormMetadata {
  const { maxLength, minLength, required } = getMetadataFromSchemaOrProp(p)

  return {
    minLength: minLength
      ? {
        value: minLength,
        message: intl.formatMessage(
          {
            defaultMessage: "The value must be at least {minLength} characters long",
            id: "JxYRlM",
            description: "Default form validation error: min characters"
          },
          { minLength }
        )
      }
      : undefined,
    maxLength: maxLength
      ? {
        value: maxLength,
        message: intl.formatMessage(
          {
            defaultMessage: "Only a maximum of {maxLength} characters is allowed",
            id: "4+pPNW",
            description: "Default form validation error: max characters"
          },
          { maxLength }
        )
      }
      : undefined,
    required: required
      ? {
        value: required,
        message: intl.formatMessage({
          defaultMessage: "This field can not be empty",
          id: "Vfrho4",
          description: "Default form validation error: required field"
        })
      }
      : undefined
  }
}

export type SchemaProperties<Fields extends PropertyRecord> = Schema.Schema<
  unknown,
  ToStruct<Fields>,
  StructConstructor<Fields>,
  FromStruct<Fields>,
  {
    fields: Fields
  }
>

export function createUseParsedFormFromSchema<Fields extends PropertyRecord>(
  self: SchemaProperties<Fields>
) {
  return createUseParsedFormUnsafe(self.Api.fields)(EParserFor(self))
}

/**
 * @unsafe - because the `Shape` has no relation to `Fields`
 * This is used to adapt forms to tagged unions.
 * It would be better to make first class support for that instead.
 */
export function createUseCustomParsedFormFromSchemaUnsafe<
  Fields extends PropertyRecord,
  To
>(input: SchemaProperties<Fields>, target: Schema.Schema<unknown, To, any, any, any>) {
  return createUseParsedFormUnsafe(input.Api.fields)(Parser.for(target))
}

/**
 * @unsafe - because the `Shape` has no relation to `Fields`
 * This is used to adapt forms to tagged unions.
 * It would be better to make first class support for that instead.
 */
export function createUseParsedFormUnsafe<Fields extends PropertyRecord>(fields: Fields) {
  type From = FromStruct<Fields>
  type NEncoded = From // Transform<From>

  // We support a separate Parser so that the form may provide at-least, or over-provide.
  // TODO: From should extend Shape (provide at least, or over provide)
  return <Shape, ParserE extends AnyError>(
    parser: Parser.Parser<From, ParserE, Shape>
  ) => {
    const parse = parser.pipe(unsafe)
    return <
      // eslint-disable-next-line @typescript-eslint/ban-types
      TContext extends object = object
    >(
      _?: Omit<UseFormProps<NEncoded, TContext>, "defaultValues"> & {
        defaultValues: NEncoded
      }
    ) => {
      const originalForm_ = createUseForm(fields)
      const form = originalForm_<NEncoded, TContext>(_ as any)
      return {
        ...form,
        handleSubmit: (
          onValid: (data: Shape, event?: React.BaseSyntheticEvent) => Promise<unknown>,
          onInvalid?: SubmitErrorHandler<From>,
          preValidate?: () => boolean
        ) => {
          const hs = form.handleSubmit as any
          const h = hs(async (_v: any, e: any) => {
            if (preValidate && !preValidate()) {
              return
            }
            const parsed = parse(_v) as any
            return await onValid(parsed, e)
          }, onInvalid)
          return (
            // eslint-disable-next-line @typescript-eslint/ban-types
            e?: BaseSyntheticEvent<object, any, any> | undefined
          ): Promise<void> => h(e)
        }
      }
    }
  }
}

export function createUseForm<Fields extends PropertyRecord = PropertyRecord>(
  fields: Fields
) {
  type From = FromStruct<Fields>
  type NEncoded = From // Transform<From>
  return function useFormInternal<
    TFieldValues extends NEncoded,
    // eslint-disable-next-line @typescript-eslint/ban-types
    TContext extends object = object
  >(_?: UseFormProps<TFieldValues, TContext>) {
    const r = useFormOriginal(_)
    const [register, getFieldMetadata, getMetadata] = useRegister(r.register, fields)
    const { errors } = r.formState

    const control = useMemo(() => ({ ...r.control, fields }), [r.control])

    const getMetadataMui = useCallback(
      <TFieldName extends FieldPath<TFieldValues>>(name: TFieldName) => {
        const error = name
          .split(".")
          .reduce(
            (prev, cur) => (prev ? (prev as any)[cur] : undefined),
            errors
          ) as any as { message?: string } | undefined
        return {
          ...getMetadata(name),
          error: !!error,
          helperText: error?.message
        }
      },
      [getMetadata, errors]
    )

    const registerMui = useCallback(
      <TFieldName extends FieldPath<TFieldValues>>(
        name: TFieldName,
        options?: RegisterOptions<TFieldValues, TFieldName>
      ) => {
        const propOrSchema = getPropOrSchemaFromPath({ fields }, name)
        const { transform, ...customReg } = getRegisterFromSchemaOrProp(propOrSchema)

        // TODO: check and filter options for custom setValueAs / valueAsNumber / valueAsDate
        const setValueAs = (value: any) => transform.output(value)
        const reg = register(name, {
          ...customReg,
          setValueAs,
          ...options
        })
        const rootProps = getMetadataMui(name)
        return {
          ...rootProps,
          inputProps: reg
          // required:
          //   options && "required" in options ? !!options.required : rootProps.required,
        }
      },
      [getMetadataMui, register]
    )

    return {
      ...r,
      control,
      register,
      registerMui,
      getFieldMetadata,
      getMetadata,
      getMetadataMui
    }
  }
}

function isNumber(a: string) {
  const parsed = parseInt(a)
  const isNumber = parsed === 0 || !!parsed
  return isNumber
}

// We have to differentiate between Field and raw schema.
function getPropOrSchemaFromPath(
  current: any,
  name: string
): Schema.AnyProperty | Schema.SchemaAny {
  const path = name.split(".")
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const last = path[path.length - 1]!
  const left = path.slice(0, path.length - 1)
  // obj; a.b.c
  // array = a.0.b.c
  for (const p of left) {
    if (isNumber(p)) {
      current = current.self // returns a schema, not a field
    } else {
      current = current.fields[p]._schema.Api
    }
  }
  if (isNumber(last)) {
    current = current.self // returns a schema, not a field
  } else {
    current = current.fields[last]
  }
  return current
}

function useGetMeta<
  TFieldValues extends FieldValues,
  Fields extends Schema.PropertyRecord
>(fields: Fields) {
  const intl = useIntl()
  const { getFieldMetadata, getMetadata, getRegisterMeta } = useMemo(() => {
    const getMetadata = <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName
    ) => {
      const propOrSchema = getPropOrSchemaFromPath({ fields }, name)
      return getMetadataFromSchemaOrProp(propOrSchema)
    }
    const getFieldMetadata = <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName,
      additionalValidation?:
        | Validate<PathValue<TFieldValues, TFieldName>>
        // | Record<string, Validate<PathValue<TFieldValues, TFieldName>>>
        | undefined
    ) => {
      const propOrSchema = getPropOrSchemaFromPath({ fields }, name)
      const meta = getRegisterFromSchemaOrProp(propOrSchema)
      const schema = isSchema(propOrSchema) ? propOrSchema : propOrSchema._schema
      const parse = Schema.Parser.for(schema)
      const validate = (i: PathValue<TFieldValues, TFieldName>) =>
        parse(meta.transform.output(i))
          .pipe(These.result)
          .pipe(
            (r) =>
              r.match({
                onLeft: () =>
                  intl.formatMessage(
                    {
                      defaultMessage: "The entered value is not a valid {modelName}",
                      id: "/do4+3",
                      description: "Default form validation error: model invalid"
                    },
                    { modelName: capitalize(name.toString()) }
                  ),
                onRight: ([_, optErr]) =>
                  optErr.isSome()
                    ? intl.formatMessage(
                      {
                        defaultMessage: "The entered value is not a valid {modelName}",
                        id: "/do4+3",
                        description: "Default form validation error: model invalid"
                      },
                      { modelName: capitalize(name.toString()) }
                    )
                    : undefined
              }) ?? (additionalValidation ? additionalValidation(i) : undefined)
          )
      return {
        validate,
        ...getFormMetadata(intl, propOrSchema)
      }
    }
    const getRegisterMeta = <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName
    ) => {
      const propOrSchema = getPropOrSchemaFromPath({ fields }, name)
      const meta = getRegisterFromSchemaOrProp(propOrSchema)

      return meta
    }
    return {
      getMetadata,
      getRegisterMeta,
      getFieldMetadata
    }
  }, [fields, intl])

  return [getFieldMetadata, getMetadata, getRegisterMeta] as const
}

function useRegister<
  TFieldValues extends FieldValues,
  Fields extends Schema.PropertyRecord
>(register_: UseFormRegister<TFieldValues>, fields: Fields) {
  const [getFieldMetadata, getMetadata] = useGetMeta<TFieldValues, Fields>(fields)
  const register = useCallback(
    <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName,
      options?: RegisterOptions<TFieldValues, TFieldName>
    ) => register_(name, { ...getFieldMetadata(name), ...options }),
    [register_, getFieldMetadata]
  )
  return [register, getFieldMetadata, getMetadata] as const
}

export function validateBetweenMidnightAndEndOfDay(minDate?: Date, maxDate?: Date) {
  return (d: Date) =>
    !isBetweenMidnightAndEndOfDay(minDate, maxDate)(d)
      ? "Not within expected date range"
      : undefined
}
