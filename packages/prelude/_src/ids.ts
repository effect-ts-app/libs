import { brandedStringId, type StringIdBrand } from "@effect-app/prelude/schema"

export interface RequestIdBrand extends StringIdBrand {
  readonly RequestId: unique symbol
}

/**
 * @tsplus type RequestId
 */
export type RequestId = ReasonableString
export const RequestId = Object.assign(ReasonableString, { withDefault: defaultProp(ReasonableString, StringId.make) })

export interface UserProfileIdBrand extends StringIdBrand {
  readonly UserProfileId: unique symbol
}
/**
 * @tsplus type UserProfileId
 */
export type UserProfileId = StringId & UserProfileIdBrand
export const UserProfileId = brandedStringId<UserProfileId>()
