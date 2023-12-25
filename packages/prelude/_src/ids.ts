import { brandedStringId, type StringIdBrand } from "@effect-app/schema"
import type { B } from "@effect-app/schema/schema"
import type { Simplify } from "effect/Types"

export interface RequestIdBrand extends StringIdBrand {
  readonly RequestId: unique symbol
}

/**
 * @tsplus type RequestId
 */
export type RequestId = StringId
export const RequestId = StringId

export interface UserProfileIdBrand extends Simplify<B.Brand<"UserProfileId"> & StringIdBrand> {}
/**
 * @tsplus type UserProfileId
 */
export type UserProfileId = StringId & UserProfileIdBrand
export const UserProfileId = brandedStringId<UserProfileIdBrand>()
