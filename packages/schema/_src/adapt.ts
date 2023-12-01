/* eslint-disable @typescript-eslint/no-explicit-any */
import * as D from "@effect-app/core/Dictionary"

import type { ComputeFlat, UnionToIntersection } from "@effect-app/core/utils"
import { array, prop, struct } from "./_schema.js"
import * as MO from "./_schema.js"
import { positiveInt } from "./custom.js"

type AdaptSchema<Fields extends MO.PropertyRecord, Key extends keyof Fields> = {
  [K in Key]: Fields[K]
}

// TODO: adapt error types too; low prio
const adaptedSchema =
  <Fields extends MO.PropertyRecord>(properties: Fields) =>
  <Key extends keyof Fields>(keys: readonly Key[]): AdaptSchema<Fields, Key> =>
    D.filterWithIndex_(properties, (key) => keys.includes(key as Key)) as any

// TODO: keep existing fields
export const adaptRes = <Fields extends MO.PropertyRecord>(properties: Fields) => {
  const adapt = adaptedSchema(properties)
  return <Key extends keyof Fields>(keys: readonly Key[]) =>
    MO.struct({
      items: prop(array(struct(adapt(keys)))),
      // TODO: hide count when not asked for $count. and demand non-opt count, when asked.
      count: MO.optProp(positiveInt)
    })
}

export type Adapted<
  Fields extends MO.PropertyRecord,
  Key extends keyof Fields
> = /* copy pasted from return type of function */ MO.SchemaProperties<{
  items: MO.Property<
    MO.SchemaDefaultSchema<
      unknown,
      readonly ComputeFlat<
        UnionToIntersection<
          {
            [k in keyof AdaptSchema<Fields, Key>]: AdaptSchema<
              Fields,
              Key
            >[k] extends MO.AnyProperty ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [h in k]?:
                    | MO.To<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [h in k]: MO.To<
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
            >[k] extends MO.AnyProperty ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [h in k]?:
                    | MO.To<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [h in k]: MO.To<
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
            >[k] extends MO.AnyProperty ? AdaptSchema<Fields, Key>[k]["_optional"] extends "optional" ? {
                  readonly [
                    h in AdaptSchema<Fields, Key>[k]["_as"] extends Some<any>
                      ? AdaptSchema<Fields, Key>[k]["_as"]["value"]
                      : k
                  ]?:
                    | MO.From<AdaptSchema<Fields, Key>[k]["_schema"]>
                    | undefined
                }
              : {
                readonly [
                  h in AdaptSchema<Fields, Key>[k]["_as"] extends Some<any> ? AdaptSchema<Fields, Key>[k]["_as"]["value"]
                    : k
                ]: MO.From<AdaptSchema<Fields, Key>[k]["_schema"]>
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
