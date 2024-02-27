import { isValidPhone } from "@effect-app/core/validation"
import * as S from "@effect/schema/Schema"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./brand.js"
import { withDefaults } from "./ext.js"
import { Numbers } from "./FastCheck.js"
import type { B } from "./schema.js"
import type { NonEmptyStringBrand } from "./strings.js"

export interface PhoneNumberBrand extends Simplify<B.Brand<"PhoneNumber"> & NonEmptyStringBrand> {}
export type PhoneNumber = string & PhoneNumberBrand

export const PhoneNumber = S
  .string
  .pipe(
    S.filter(isValidPhone, {
      title: "PhoneNumber",
      description: "a phone number with at least 7 digits",
      arbitrary: () => Numbers(7, 10),
      jsonSchema: { format: "phone" }
    }),
    fromBrand(nominal<PhoneNumber>(), { jsonSchema: {} }),
    S.identifier("PhoneNumber"),
    withDefaults
  )
