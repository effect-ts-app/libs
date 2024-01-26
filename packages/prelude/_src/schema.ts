import { isValidEmail, isValidPhone } from "@effect-app/core/validation"
import { type A, type Email as EmailT, fromBrand, nominal, type PhoneNumber as PhoneNumberT } from "@effect-app/schema"
import { fakerArb } from "./faker.js"

export const Email = S
  .string
  .pipe(
    S.filter(isValidEmail, {
      title: "Email",
      description: "an email according to RFC 5322",
      jsonSchema: { format: "email" },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      arbitrary: (): A.Arbitrary<string> => fakerArb((faker) => faker.internet.exampleEmail)
    }),
    fromBrand(nominal<Email>(), { jsonSchema: {} })
  )
  .withDefaults

export type Email = EmailT

export const PhoneNumber = S
  .string
  .pipe(
    S.filter(isValidPhone, {
      title: "PhoneNumber",
      description: "a phone number with at least 7 digits",
      jsonSchema: { format: "phone" },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      arbitrary: (): A.Arbitrary<string> => fakerArb((faker) => faker.phone.number)
    }),
    fromBrand(nominal<PhoneNumber>(), { jsonSchema: {} })
  )
  .withDefaults

export type PhoneNumber = PhoneNumberT

export * from "@effect-app/schema"
