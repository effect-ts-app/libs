import type { LongString as LST, NonEmptyString as NST, ReasonableString as RST } from "@effect-ts-app/schema"
import { pipe } from "@effect-ts/core"
import type { ParseOptions } from "@fp-ts/schema/Parser"
import { Annotations } from "./Annotations.js"

export interface Constructor<I, A> {
  (a: I): A
}
export interface ConstructorSchema<I, A> extends Schema<A>, Constructor<I, A> {}
export interface StringConstructorSchema<A> extends Schema<A>, Constructor<string, A> {}

export function makeConstructorSchema<I, A>(schema: Schema<A>): ConstructorSchema<I, A> {
  const decode = pipe(schema, Schema.$.decodeOrThrow) as (a: I, options?: ParseOptions) => A
  return Object.assign(decode, schema)
}
export const makeStringConstructorSchema: <A>(schema: Schema<A>) => StringConstructorSchema<A> = makeConstructorSchema
export function makeConstructorFromSchema<I, A>(
  schema: Schema<I>,
  transform: (s: Schema<I>) => Schema<A>
): ConstructorSchema<I, A> {
  return makeConstructorSchema<I, A>(transform(schema))
}

export const NonEmptyString: StringConstructorSchema<NonEmptyString> = makeConstructorFromSchema(
  Schema.string,
  s =>
    s
      .minLength(1)
      .title("NonEmptyString")
      .filter((s): s is NonEmptyString => !!s)
      .annotations({
        [Annotations.CustomId]: { type: "NonEmptyString" }
      })
)

export type NonEmptyString = NST

export const ReasonableString: StringConstructorSchema<ReasonableString> = makeStringConstructorSchema(
  NonEmptyString
    .maxLength(255)
    .title("ReasonableString")
    .filter((s): s is ReasonableString => !!s)
    .annotations({
      [Annotations.CustomId]: { type: "ReasonableString" }
    })
)

export type ReasonableString = RST

export const LongString: StringConstructorSchema<LongString> = makeStringConstructorSchema(
  NonEmptyString
    .maxLength(2048)
    .title("LongString")
    .filter((s): s is LongString => !!s)
    .annotations({
      [Annotations.CustomId]: { type: "LongString" }
    })
)

export type LongString = LST
