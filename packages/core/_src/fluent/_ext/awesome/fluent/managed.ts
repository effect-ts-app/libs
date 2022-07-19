/* eslint-disable @typescript-eslint/no-namespace */
// ets_tracing: off

import { fromManaged_, fromRawManaged } from "@effect-ts/core/Effect/Layer"
import {
  as_,
  catchAll_,
  chain_,
  makeExit_,
  map_,
  tap_,
  tapBoth_,
  tapCause_,
  tapError_,
  tapM_,
  use_,
} from "@effect-ts/core/Effect/Managed"

// import { pipe } from "@effect-ts/core/Effect/Managed"
// /**
//  * @tsplus fluent ets/Managed gen
//  */
// export const ext_pipe = pipe

/**
 * @tsplus fluent ets/Managed makeExit
 */
export const ext_makeExit_ = makeExit_

/**
 * @tsplus fluent ets/Managed as
 */
export const ext_as_ = as_

/**
 * @tsplus fluent ets/Managed map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Managed flatMap
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Managed tap
 */
export const ext_tapM_ = tapM_

/**
 * @tsplus fluent ets/Managed tap
 */
export const ext_tap_ = tap_

/**
 * @tsplus fluent ets/Managed tapError
 */
export const ext_tapError_ = tapError_

/**
 * @tsplus fluent ets/Managed tapCause
 */
export const ext_tapCause_ = tapCause_

/**
 * @tsplus fluent ets/Managed tapBoth
 */
export const ext_tapBoth_ = tapBoth_

/**
 * @tsplus fluent ets/Managed catchAll
 */
export const ext_catchAll_ = catchAll_

/**
 * @tsplus fluent ets/Managed use
 */
export const ext_use_ = use_

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromRawManaged = fromRawManaged

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromManaged_ = fromManaged_
