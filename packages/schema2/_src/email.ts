import { isValidEmail } from "@effect-app/core/validation"
import type { Brands2, Id, Unbranded } from "./ext.js"
import { fromBrand, nominal } from "./ext.js"
import { S } from "./schema.js"
import type { B } from "./schema.js"
import type { NonEmptyStringBrand } from "./strings.js"

export interface EmailBrand extends Id<B.Brand<"Email"> & NonEmptyStringBrand> {
}

type aa = Unbranded<Email>
type bb = Brands2<EmailBrand>
type a = EmailBrand[B.BrandTypeId]
export type Email = string & EmailBrand

export const Email = S.string.pipe(
  S.filter(isValidEmail, {
    title: "Email",
    description: "an email according to RFC 5322",
    arbitrary: () => (fc) => fc.emailAddress()
  }),
  fromBrand(nominal<Email>())
)
