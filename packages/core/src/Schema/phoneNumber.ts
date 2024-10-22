import type { Refinement } from "@effect-app/core/Function"
import { isValidPhone } from "@effect-app/core/validation"
import * as S from "effect/Schema"
import type { Simplify } from "effect/Types"
import { withDefaultMake } from "./ext.js"
import { Numbers } from "./FastCheck.js"
import type { B } from "./schema.js"
import type { NonEmptyStringBrand } from "./strings.js"

export interface PhoneNumberBrand extends Simplify<B.Brand<"PhoneNumber"> & NonEmptyStringBrand> {}
export type PhoneNumber = string & PhoneNumberBrand

export const PhoneNumber = S
  .String
  .pipe(
    S.filter(isValidPhone as Refinement<string, PhoneNumber>, {
      identifier: "PhoneNumber",
      title: "PhoneNumber",
      description: "a phone number with at least 7 digits",
      arbitrary: () => (fc) => Numbers(7, 10)(fc).map((_) => _ as PhoneNumber),
      jsonSchema: { format: "phone" }
    }),
    withDefaultMake
  )
