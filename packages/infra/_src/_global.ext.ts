/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/services/Emailer/fake"
/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/services/Emailer/Sendgrid"
/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/services/Operations/live"
/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/services/QueueMaker/errors"
// /**
//  * @tsplus global
//  */
// import type {} from "@effect-app/infra/test.arbs"
/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/_ext/Array"
/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/rateLimit"

/**
 * @tsplus global
 */
import type {} from "@effect-app/infra/api/setupRequest"

/**
 * @tsplus global
 */
import {} from "@effect-app/infra/api/reportError"
import { S } from "@effect-app/schema2/schema"
import type { ParseOptions } from "@effect/schema/AST"

/**
 * @tsplus fluent effect/schema/Schema __call
 */
export const parseSync = <I, A>(self: S.Schema<I, A>, u: I, options?: ParseOptions | undefined) =>
  S.parseSync(self)(u, options)
