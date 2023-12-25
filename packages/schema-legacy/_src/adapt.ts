/* eslint-disable @typescript-eslint/no-explicit-any */
import * as D from "@effect-app/core/Dictionary"

import type { ComputeFlat, UnionToIntersection } from "@effect-app/core/utils"
import { array, struct } from "./_schema.js"
import * as S from "./_schema.js"
import { positiveInt } from "./custom.js"

type AdaptSchema<Fields extends S.FieldRecord, Key extends keyof Fields> = {
  [K in Key]: Fields[K]
}

// TODO: adapt error types too; low prio
const adaptedSchema =
  <Fields extends S.FieldRecord>(properties: Fields) =>
  <Key extends keyof Fields>(keys: readonly Key[]): AdaptSchema<Fields, Key> =>
    D.filterWithIndex_(properties, (key) => keys.includes(key as Key)) as any

// TODO: keep existing fields
export const adaptRes = <Fields extends S.FieldRecord>(properties: Fields) => {
  const adapt = adaptedSchema(properties)
  return <Key extends keyof Fields>(keys: readonly Key[]) =>
    S.struct({
      items: array(struct(adapt(keys))),
      // TODO: hide count when not asked for $count. and demand non-opt count, when asked.
      count: S.optProp(positiveInt)
    })
}

export type Adapted<
  Fields extends S.FieldRecord,
  Key extends keyof Fields
> = /* copy pasted from return type of function */ S.SchemaProperties<{
  items: S.Field<
    S.SchemaDefaultSchema<
      unknown,
      readonly ComputeFlat<
        UnionToIntersection<
          {
            [k in keyof AdaptSchema<Fields, Key>]: AdaptSchema<
              Fields,
              Key
            >[k] extends S.AnyField ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [h in k]?:
                    | S.To<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [h in k]: S.To<
                  AdaptSchema<Fields, Key>[k]["_schema"]
                >
              }
              : never
          }[Key]
        >
      >[],
      readonly ComputeFlat<
        UnionToIntersection<
          {
            [k in keyof AdaptSchema<Fields, Key>]: AdaptSchema<
              Fields,
              Key
            >[k] extends S.AnyField ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [h in k]?:
                    | S.To<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [h in k]: S.To<
                  AdaptSchema<Fields, Key>[k]["_schema"]
                >
              }
              : never
          }[Key]
        >
      >[],
      readonly ComputeFlat<
        UnionToIntersection<
          {
            [k in keyof AdaptSchema<Fields, Key>]: AdaptSchema<
              Fields,
              Key
            >[k] extends S.AnyField ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [
                    h in AdaptSchema<Fields, Key>[k]["_as"] extends Some<any>
                      ? AdaptSchema<Fields, Key>[k]["_as"]["value"]
                      : k
                  ]?:
                    | S.From<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [
                  h in AdaptSchema<Fields, Key>[k]["_as"] extends Some<any>
                    ? AdaptSchema<Fields, Key>[k]["_as"]["value"]
                    : k
                ]: S.From<AdaptSchema<Fields, Key>[k]["_schema"]>
              }
              : never
          }[Key]
        >
      >[],
      // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    >,
    "required",
    None<any>,
    None<any>
  >
}>
