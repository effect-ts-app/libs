import { isValidPhone } from "@effect-app/core/validation"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./ext.js"
import { Numbers } from "./FastCheck.js"
import { S } from "./schema.js"
import type { B } from "./schema.js"
import type { NonEmptyStringBrand } from "./strings.js"

export interface PhoneNumberBrand extends Simplify<B.Brand<"PhoneNumber"> & NonEmptyStringBrand> {}
export type PhoneNumber = string & PhoneNumberBrand

export const PhoneNumber = S
  .string
  .pipe(
    fromBrand(nominal<PhoneNumber>()),
    S.filter(isValidPhone, {
      title: "PhoneNumber",
      description: "a phone number with at least 7 digits",
      arbitrary: () => Numbers(7, 10),
      jsonSchema: { format: "phone" }
    })
  )
  .withDefaults
