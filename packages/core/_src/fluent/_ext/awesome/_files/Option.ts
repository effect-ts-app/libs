/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-duplicates */
// ets_tracing: off
import { toNullable } from "@effect-ts/core/Option"
import { toUndefined } from "@effect-ts/core/Option"
import { encaseOption_ } from "@effect-ts-app/core/Effect"
import { alt_ } from "@effect-ts-app/core/fluent/_ext/Option"
import { tryCatchOption_ } from "@effect-ts-app/core/Sync"

/**
 * @tsplus getter ets/Option val
 */
export const ext_toNullable = toNullable

/**
 * @tsplus getter ets/Option value
 */
export const ext_toUndefined = toUndefined

/**
 * @tsplus fluent ets/Option alt
 */
export const ext_alt_ = alt_

/**
 * @tsplus fluent ets/Option encaseInSync
 */
export const ext_tryCatchOption_ = tryCatchOption_

/**
 * @tsplus fluent ets/Option encaseInEffect
 */
export const ext_tryCatchOptionEffect_ = encaseOption_
