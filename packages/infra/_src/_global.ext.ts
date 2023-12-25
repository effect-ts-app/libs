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

import "@effect-app/infra/test.arbs"
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
import { S } from "@effect-app/schema/schema"

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultDate = <From>(s: S.Schema<From, Date>) => S.withDefaultConstructor(s, () => new Date())

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultNullable = <From, To>(s: S.Schema<From, To | null>) => S.withDefaultConstructor(s, () => null)

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultArray = <From, T>(s: S.Schema<From, ReadonlyArray<T>>) => S.withDefaultConstructor(s, () => [])
