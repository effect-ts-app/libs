import type { Maybe } from "@effect-ts-app/core/Maybe"
import { alt } from "@effect-ts-app/core/Maybe"

export const alt_: <A, B>(fa: Maybe<A>, fb: () => Maybe<B>) => Maybe<B | A> = (
  fa,
  fb
) => alt(fb)(fa)
