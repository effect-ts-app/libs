import { isValidEmail } from "@effect-app/core/validation"
import * as S from "@effect/schema/Schema"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal, withDefaults } from "./ext.js"
import type { B } from "./schema.js"
import type { NonEmptyStringBrand } from "./strings.js"

export interface EmailBrand extends Simplify<NonEmptyStringBrand & B.Brand<"Email">> {}

export type Email = string & EmailBrand

export const Email = S
  .string
  .pipe(
    S.filter(isValidEmail, {
      title: "Email",
      description: "an email according to RFC 5322",
      jsonSchema: { format: "email" },
      arbitrary: () => (fc) => fc.emailAddress()
    }),
    fromBrand(nominal<Email>(), { jsonSchema: {} }),
    withDefaults
  )
