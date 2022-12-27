import type { Opt } from "@effect-ts-app/core/Opt"
import { alt } from "@effect-ts-app/core/Opt"

export const alt_: <A, B>(fa: Opt<A>, fb: () => Opt<B>) => Opt<B | A> = (
  fa,
  fb
) => alt(fb)(fa)
