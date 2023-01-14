import * as SchemaLegacy from "../schema.js"

// We're using getters with curried functions, instead of fluent functions, so that they can be used directly in lambda callbacks

/**
 * @tsplus getter ets/Schema/Parser unsafe
 */
export const unsafe = SchemaLegacy.unsafe

/**
 * @tsplus getter ets/Schema/Parser condemn
 */
export const condemn = SchemaLegacy.condemn

/**
 * @tsplus getter ets/Schema/Parser condemnFail
 */
export const condemnFail = SchemaLegacy.condemnFail

/**
 * @tsplus getter ets/Schema/Parser condemnDie
 */
export const condemnDie = SchemaLegacy.condemnDie

/**
 * @tsplus getter ets/Schema/Parser condemnCustom
 */
export const condemnCustom = SchemaLegacy.condemnCustom

/**
 * @tsplus getter ets/Schema/Parser condemnLeft
 */
export const condemnLeft = SchemaLegacy.condemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseCondemnCustom
 */
export const parseCondemnCustom = SchemaLegacy.parseCondemnCustom

/**
 * @tsplus getter ets/Schema/Schema parseCondemnDie
 */
export const parseCondemnDie = SchemaLegacy.parseCondemnDie

/**
 * @tsplus getter ets/Schema/Schema parseECondemnFail
 */
export const parseECondemnFail = SchemaLegacy.parseECondemnFail

/**
 * @tsplus getter ets/Schema/Schema parseECondemnDie
 */
export const parseECondemnDie = SchemaLegacy.parseECondemnDie

/**
 * @tsplus getter ets/Schema/Schema parseECondemnCustom
 */
export const parseECondemnCustom = SchemaLegacy.parseECondemnCustom

/**
 * @tsplus getter ets/Schema/Schema parseCondemnLeft
 */
export const parseCondemnLeft = SchemaLegacy.parseCondemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseECondemnLeft
 */
export const parseECondemnLeft = SchemaLegacy.parseECondemnLeft

/**
 * @tsplus getter ets/Schema/Schema parseEUnsafe
 */
export const parseEUnsafe = SchemaLegacy.parseEUnsafe

/**
 * @tsplus getter ets/Schema/Schema parseUnsafe
 */
export const parseUnsafe = SchemaLegacy.parseUnsafe

/**
 * @tsplus getter ets/Schema/Schema parseCondemn
 */
export const parseCondemn = SchemaLegacy.parseCondemn

/**
 * @tsplus getter ets/Schema/Schema parseECondemn
 */
export const parseECondemn = SchemaLegacy.parseECondemn
