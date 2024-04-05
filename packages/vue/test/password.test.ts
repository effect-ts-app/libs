import { S, Secret } from "effect-app"
import type { Schema } from "effect-app/schema"
import { transform, withDefaults } from "effect-app/schema"
import type { Brand } from "effect/Brand"

export interface PasswordBrand extends Brand<"Password"> {
}

export type Password = string & PasswordBrand

export type PasswordSecret = Secret.Secret & PasswordBrand

const complexity = /(?=^.{8,50}$)(?=.*\d)(?=.*[!@#$%^&*,.]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
function verifyPasswordComplexity(_: string): _ is Password {
  return !!_.match(complexity)
}

const symbols = "!@#$%^&*,."
export const passwordString = S.string.pipe(
  S.filter(
    verifyPasswordComplexity,
    {
      message: () =>
        "a Password with at least 8 characters, one uppercase, one lowercase, one number and one special character e.g. "
        + symbols
    }
  ),
  S.minLength(8),
  S.maxLength(50),
  // arbitrary removes brand benefit
  S.fromBrand(S.nominal<Password>())
)

const SecretPassword = S.SecretFromSelf as unknown as Schema<PasswordSecret>

export const Password = Object
  .assign(
    transform(
      passwordString,
      SecretPassword,
      (str) => Secret.fromString(str),
      (secret) => Secret.value(secret),
      { strict: false }
    )
      .annotations({ identifier: "Password" })
      .pipe(withDefaults),
    { symbols }
  )

it("should be true", () => {
  expect(true).toBe(true)
})
