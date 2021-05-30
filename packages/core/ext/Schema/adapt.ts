/* eslint-disable @typescript-eslint/no-explicit-any */
import * as D from "@effect-ts/core/Collections/Immutable/Dictionary"
import { None, Some } from "@effect-ts/core/Option"
import { ComputeFlat, UnionToIntersection } from "@effect-ts/core/Utils"
import { positiveInt } from "@effect-ts/schema"

import { array, prop, props } from "./_schema"
import * as S from "./_schema"

type AdaptSchema<Props extends S.PropertyRecord, Key extends keyof Props> = {
  [K in Key]: Props[K]
}

// TODO: adapt error types too; low prio
const adaptedSchema =
  <Props extends S.PropertyRecord>(properties: Props) =>
  <Key extends keyof Props>(keys: readonly Key[]): AdaptSchema<Props, Key> =>
    D.filterWithIndex_(properties, (key) => keys.includes(key as Key)) as any

// TODO: keep existing fields
export const adaptRes = <Props extends S.PropertyRecord>(properties: Props) => {
  const adapt = adaptedSchema(properties)
  return <Key extends keyof Props>(keys: readonly Key[]) =>
    props({
      items: prop(array(props(adapt(keys)))),
      // TODO: hide count when not asked for $count. and demand non-opt count, when asked.
      count: prop(positiveInt).opt(),
    })
}

export type Adapted<Props extends S.PropertyRecord, Key extends keyof Props> =
  /* copy pasted from return type of function */ S.SchemaProperties<{
    items: S.Property<
      S.SchemaDefaultSchema<
        unknown,
        S.CompositionE<
          | S.PrevE<S.RefinementE<S.LeafE<S.UnknownArrayE>>>
          | S.NextE<
              S.CollectionE<
                S.OptionalIndexE<
                  number,
                  S.ParserErrorFromProperties<AdaptSchema<Props, Key>>
                >
              >
            >
        >,
        readonly ComputeFlat<
          UnionToIntersection<
            {
              [k in keyof AdaptSchema<Props, Key>]: AdaptSchema<
                Props,
                Key
              >[k] extends S.AnyProperty
                ? AdaptSchema<Props, Key>[k]["_optional"] extends "optional"
                  ? {
                      readonly [h in k]?:
                        | S.ParsedShapeOf<AdaptSchema<Props, Key>[k]["_schema"]>
                        | undefined
                    }
                  : {
                      readonly [h in k]: S.ParsedShapeOf<
                        AdaptSchema<Props, Key>[k]["_schema"]
                      >
                    }
                : never
            }[Key]
          >
        >[],
        readonly ComputeFlat<
          UnionToIntersection<
            {
              [k in keyof AdaptSchema<Props, Key>]: AdaptSchema<
                Props,
                Key
              >[k] extends S.AnyProperty
                ? AdaptSchema<Props, Key>[k]["_optional"] extends "optional"
                  ? {
                      readonly [h in k]?:
                        | S.ParsedShapeOf<AdaptSchema<Props, Key>[k]["_schema"]>
                        | undefined
                    }
                  : {
                      readonly [h in k]: S.ParsedShapeOf<
                        AdaptSchema<Props, Key>[k]["_schema"]
                      >
                    }
                : never
            }[Key]
          >
        >[],
        never,
        readonly ComputeFlat<
          UnionToIntersection<
            {
              [k in keyof AdaptSchema<Props, Key>]: AdaptSchema<
                Props,
                Key
              >[k] extends S.AnyProperty
                ? AdaptSchema<Props, Key>[k]["_optional"] extends "optional"
                  ? {
                      readonly [h in AdaptSchema<Props, Key>[k]["_as"] extends Some<any>
                        ? AdaptSchema<Props, Key>[k]["_as"]["value"]
                        : k]?:
                        | S.EncodedOf<AdaptSchema<Props, Key>[k]["_schema"]>
                        | undefined
                    }
                  : {
                      readonly [h in AdaptSchema<Props, Key>[k]["_as"] extends Some<any>
                        ? AdaptSchema<Props, Key>[k]["_as"]["value"]
                        : k]: S.EncodedOf<AdaptSchema<Props, Key>[k]["_schema"]>
                    }
                : never
            }[Key]
          >
        >[],
        // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      >,
      "required",
      None,
      None
    >
  }>
