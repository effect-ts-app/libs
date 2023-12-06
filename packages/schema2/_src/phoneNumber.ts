import { isValidPhone } from "@effect-app/core/validation"
import { Numbers } from "@effect-app/schema/FastCheck"
import { fromBrand, nominal } from "./ext.js"
import { S } from "./schema.js"
import type { B } from "./schema.js"

export interface PhoneNumberBrand { //  extends Id<B.Brand<"PhoneNumber"> & NonEmptyStringBrand>
  readonly [B.BrandTypeId]: {
    readonly PhoneNumber: "PhoneNumber"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}
export type PhoneNumber = string & PhoneNumberBrand

export const PhoneNumber = S.string.pipe(
  S.filter(isValidPhone, {
    title: "PhoneNumber",
    description: "a phone number with at least 7 digits",
    arbitrary: () => Numbers(7, 10)
  }),
  fromBrand(nominal<PhoneNumber>())
)
