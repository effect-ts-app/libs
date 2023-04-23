// Must use the pipe in effect-ts-app cause fp-ts pipe has a single argument overload, breaking >=
import { pipe } from "@effect-app/core/_ext/pipe"

import type {} from "./ext.js"

/**
 * @tsplus operator ets/Schema/Schema >=
 * @tsplus fluent ets/Schema/Schema apply
 * @tsplus fluent ets/Schema/Schema __call
 * @tsplus macro pipe
 */
export const pipeSchema = pipe

/**
 * @tsplus operator ets/Schema/Property >=
 * @tsplus fluent ets/Schema/Property apply
 * @tsplus fluent ets/Schema/Property __call
 * @tsplus macro pipe
 */
export const pipeSchemaProperty = pipe

/**
 * @tsplus operator ets/Schema/Constructor >=
 * @tsplus fluent ets/Schema/Constructor apply
 * @tsplus fluent ets/Schema/Constructor __call
 * @tsplus macro pipe
 */
export const pipeSchemaConstructor = pipe

/**
 * @tsplus operator ets/Schema/Parser >=
 * @tsplus fluent ets/Schema/Parser apply
 * @tsplus fluent ets/Schema/Parser __call
 * @tsplus macro pipe
 */
export const pipeSchemaParser = pipe

/**
 * @tsplus operator ets/Schema/These >=
 * @tsplus fluent ets/Schema/These apply
 * @tsplus fluent ets/Schema/These __call
 * @tsplus macro pipe
 */
export const pipeSchemaThese = pipe
