import type { ReasonableString as RST } from "@effect-ts-app/schema"

export const ReasonableString = Schema.string
  .minLength(1)
  .maxLength(255)
  .title("ReasonableString")
  .filter((s): s is ReasonableString => true)

export type ReasonableString = RST
