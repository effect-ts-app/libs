import * as Schema from "@effect-app/schema-legacy"

// We're using getters with curried functions, instead of fluent functions, so that they can be used directly in lambda callbacks

/**
 * @tsplus getter ets/Schema/Parser unsafe
 */
export const { unsafe } = Schema

/**
 * @tsplus getter ets/Schema/Parser condemn
 */
export const { condemn } = Schema

/**
 * @tsplus getter ets/Schema/Parser condemnFail
 */
export const { condemnFail } = Schema

/**
 * @tsplus getter ets/Schema/Parser condemnDie
 */
export const { condemnDie } = Schema
