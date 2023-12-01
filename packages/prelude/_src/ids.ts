import {
  brandedStringId,
  extendWithUtils,
  nonEmptyString255FromString,
  NonEmptyString50,
  type StringIdBrand
} from "@effect-app/prelude/schema"

export interface RequestIdBrand extends StringIdBrand {
  readonly RequestId: unique symbol
}

/**
 * @tsplus type RequestId
 */
export type RequestId = NonEmptyString50
export const RequestId = Object.assign(
  extendWithUtils(
    pipe(Schema.string[">>>"](nonEmptyString255FromString), Schema.brand<NonEmptyString50>())
  ),
  {
    withDefault: defaultProp(NonEmptyString50, StringId.make),
    make: StringId.make
  }
)

export interface UserProfileIdBrand extends StringIdBrand {
  readonly UserProfileId: unique symbol
}
/**
 * @tsplus type UserProfileId
 */
export type UserProfileId = StringId & UserProfileIdBrand
export const UserProfileId = brandedStringId<UserProfileId>()
