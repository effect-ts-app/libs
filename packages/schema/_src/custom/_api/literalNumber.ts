// tracing: off

import { pipe } from "@effect-app/core/Function"

import type { ApiSelfType } from "../_schema.js"
import * as S from "../_schema.js"
import * as Th from "../These.js"
import { refinement } from "./refinement.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export interface LiteralNumberApi<KS extends readonly number[]> extends ApiSelfType {
  readonly literals: KS
  readonly matchS: <A>(
    _: {
      [K in KS[number]]: (_: K) => A
    }
  ) => (ks: S.GetApiSelfType<this, KS[number]>) => A
  readonly matchW: <
    M extends {
      [K in KS[number]]: (_: K) => any
    }
  >(
    _: M
  ) => (ks: S.GetApiSelfType<this, KS[number]>) => {
    [K in keyof M]: ReturnType<M[K]>
  }[keyof M]
}

export const literalNumberIdentifier = S.makeAnnotation<{ literals: readonly number[] }>()

export function literalNumber<KS extends readonly number[]>(
  ...literals: KS
): DefaultSchema<unknown, KS[number], KS[number], KS[number], LiteralNumberApi<KS>> {
  const ko = {}
  for (const k of literals) {
    ko[k] = true
  }
  return pipe(
    refinement(
      (u): u is KS[number] => typeof u === "number" && u in ko,
      (actual) => S.leafE(S.literalNumberE(literals, actual))
    ),
    S.constructor((s: KS[number]) => Th.succeed(s)),
    S.arbitrary((_) => _.oneof(...literals.map((k) => _.constant(k)))),
    S.encoder((_) => _ as number),
    S.mapApi(
      (): LiteralNumberApi<KS> => ({
        _AS: undefined as any,
        literals,
        matchS: (m) => (k) => m[k](k),
        matchW: (m) => (k) => m[k](k)
      })
    ),
    withDefaults,
    S.annotate(literalNumberIdentifier, { literals })
  )
}
