// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type * as S from "@effect-ts/core/Sync"

declare module "@effect-ts/system/Sync/core" {
  export interface Sync<R, E, A> extends T.Effect<R, E, A> {
import { chain_ } from "@effect-ts/core/Sync"

/**
 * @tsplus fluent ets/Sync chain
 */
export const ext_chain_ = chain_

import { chain_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect chain
 */
export const ext_chain_ = chain_
