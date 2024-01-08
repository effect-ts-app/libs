// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import { customE, leafE } from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Th from "../custom/These.js"
import { minLengthIdentifier } from "./length.js"

export function nonEmptyArray<To, ConstructorInput, From, Api>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  unknown,
  NonEmptyReadonlyArray<To>,
  NonEmptyReadonlyArray<To>,
  readonly From[],
  { self: Api }
> {
  const guardSelf = S.is(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromArray = pipe(
    S.identity(
      (u): u is NonEmptyReadonlyArray<To> => Array.isArray(u) && u.length > 0 && u.every(guardSelf)
    ),
    S.parser((ar: readonly To[]) => {
      const nar = ar.toNonEmpty
      return nar.match({ onNone: () => Th.fail(leafE(customE(ar, "a non empty array")) as any), onSome: Th.succeed })
    }),
    S.encoder((u): readonly To[] => u),
    S.arbitrary(
      (_) =>
        _.array(arbitrarySelf(_), { minLength: 1 }) as any as Arbitrary.Arbitrary<
          NonEmptyReadonlyArray<To>
        >
    )
  )

  return pipe(
    S.array(self)[">>>"](fromArray),
    S.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
    S.constructor((_: NonEmptyReadonlyArray<To>) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(minLengthIdentifier, { minLength: 1 }),
    S.annotate(S.arrayIdentifier, { self })
  )
}
