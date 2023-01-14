import type { ReasonableString as RST } from "@effect-ts-app/schema"
import { CustomId } from "@fp-ts/schema/annotation/AST"

export const ReasonableString: Schema<ReasonableString> = Schema.string
  .minLength(1)
  .maxLength(255)
  .title("ReasonableString")
  .filter((s): s is ReasonableString => !!s)
  .annotations({
    [CustomId]: { type: "ReasonableString" }
  })

export type ReasonableString = RST
