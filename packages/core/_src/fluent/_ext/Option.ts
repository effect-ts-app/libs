import { alt, Option } from "@effect-ts/core/Option"

export const alt_: <A, B>(fa: Option<A>, fb: () => Option<B>) => Option<B | A> = (
  fa,
  fb
) => alt(fb)(fa)
