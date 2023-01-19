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
