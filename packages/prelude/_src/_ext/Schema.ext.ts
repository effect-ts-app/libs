import * as Schema from "../schema.js"

// We're using getters with curried functions, instead of fluent functions, so that they can be used directly in lambda callbacks

/**
 * @tsplus getter ets/Schema/Parser unsafe
 */
export const unsafe = Schema.unsafe

/**
 * @tsplus getter ets/Schema/Parser condemn
 */
export const condemn = Schema.condemn

/**
 * @tsplus getter ets/Schema/Parser condemnFail
 */
export const condemnFail = Schema.condemnFail

/**
 * @tsplus getter ets/Schema/Parser condemnDie
 */
export const condemnDie = Schema.condemnDie

/**
 * @tsplus getter ets/Schema/Parser condemnCustom
 */
export const condemnCustom = Schema.condemnCustom

/**
 * @tsplus getter ets/Schema/Parser condemnLeft
 */
export const condemnLeft = Schema.condemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseCondemnCustom
 */
export const parseCondemnCustom = Schema.parseCondemnCustom

/**
 * @tsplus getter ets/Schema/Schema parseCondemnDie
 */
export const parseCondemnDie = Schema.parseCondemnDie

/**
 * @tsplus getter ets/Schema/Schema parseECondemnFail
 */
export const parseECondemnFail = Schema.parseECondemnFail

/**
 * @tsplus getter ets/Schema/Schema parseECondemnDie
 */
export const parseECondemnDie = Schema.parseECondemnDie

/**
 * @tsplus getter ets/Schema/Schema parseECondemnCustom
 */
export const parseECondemnCustom = Schema.parseECondemnCustom

/**
 * @tsplus getter ets/Schema/Schema parseCondemnLeft
 */
export const parseCondemnLeft = Schema.parseCondemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseECondemnLeft
 */
export const parseECondemnLeft = Schema.parseECondemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseEUnsafe
 */
export const parseEUnsafe = Schema.parseEUnsafe

/**
 * @tsplus getter ets/Schema/Schema parseUnsafe
 */
export const parseUnsafe = Schema.parseUnsafe

/**
 * @tsplus getter ets/Schema/Schema parseCondemn
 */
export const parseCondemn = Schema.parseCondemn

/**
 * @tsplus getter ets/Schema/Schema parseECondemn
 */
export const parseECondemn = Schema.parseECondemn

/**
 * @tsplus getter ets/Schema/Schema withDefault
 */
export const withDefaultProp = <ParsedShape extends Schema.SupportedDefaults, ConstructorInput, Encoded, Api>(
  schema: Schema.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema.defaultProp(schema)

/**
 * @tsplus getter ets/Schema/Schema optional
 */
export const optionalProp = <ParsedShape, ConstructorInput, Encoded, Api>(
  schema: Schema.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema.optProp(schema)

/**
 * @tsplus getter ets/Schema/SchemaUnion optional
 */
export const optionalUnionProp = <Props extends Record<PropertyKey, Schema.SchemaUPI>>(
  schema: Schema.SchemaUnion<Props>
) => Schema.optProp(schema)

/**
 * @tsplus getter ets/Schema/Schema nullable
 */
export const nullableProp = <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  schema: Schema.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
) => Schema.nullable(schema)

// /**
//  * @tsplus getter ets/Schema/Schema withDefault
//  */
// export const withDefaultProp3 = <ParsedShape extends Schema.SupportedDefaults, ConstructorInput, Encoded, Api>(
//   schema: Schema.SchemaDefaultSchema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
// ) => Schema.defaultProp(schema)

// /**
//  * @tsplus fluent ets/Schema/Schema withDefaultN
//  */
// export function withDefaultPropNullable<ParsedShape extends null, ConstructorInput, Encoded, Api>(
//   schema: Schema.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
// ): null extends ParsedShape ? Schema.FromProperty<
//     Schema.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
//     "required",
//     None<any>,
//     Some<["constructor", () => ParsedShape]>
//   >
//   : ["Not a supported type, see SupportedTypes", never]
// {
//   return Schema.defaultProp(schema)
// }

/**
 * @tsplus fluent ets/Schema/Schema withDefaultMake
 */
export const withDefaultProp2 = <ParsedShape, ConstructorInput, Encoded, Api>(
  schema: Schema.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  makeDefault: () => ParsedShape
) => Schema.defaultProp(schema, makeDefault)
