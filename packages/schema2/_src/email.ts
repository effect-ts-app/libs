import { isValidEmail } from "@effect-app/core/validation"
import { fromBrand, nominal } from "./ext.js"
import { S } from "./schema.js"
import type { B } from "./schema.js"

export interface EmailBrand { //  extends Id<B.Brand<"Email"> & NonEmptyStringBrand>
  readonly [B.BrandTypeId]: {
    readonly Email: "Email"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}
export type Email = string & EmailBrand

export const Email = S.string.pipe(
  S.filter(isValidEmail, {
    title: "Email",
    description: "an email according to RFC 5322",
    arbitrary: () => (fc) => fc.emailAddress()
  }),
  fromBrand(nominal<Email>())
)
