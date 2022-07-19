// ets_tracing: off

import { succeed } from "@effect-ts/core/Effect/Layer"
import { deriveFunctions } from "@effect-ts/core/Has"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_succeed = succeed

/**
 * @tsplus fluent ets/Has deriveLifted
 */
export const ext_deriveFunctions = deriveFunctions
