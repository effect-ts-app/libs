import type * as T from "@effect-ts/core/Effect"
import type { Has } from "@effect-ts/core/Has"
import type { M, Summoner } from "@effect-ts/morphic/Batteries/summoner"
import { summonFor } from "@effect-ts/morphic/Batteries/summoner"
import type { Materialized } from "@effect-ts/morphic/Batteries/usage/materializer"
import type {
  SummonerEnv,
  SummonerInterpURI,
  SummonerProgURI,
} from "@effect-ts/morphic/Batteries/usage/summoner"

import type { JSONSchema, SubSchema } from "../JsonSchema"

import type { References, SchemaURI } from "./base"
import { modelSchemaInterpreter } from "./interpreter"

export function deriveFor<S extends Summoner<any>>(_S: S) {
  return (
      _: {
        [k in SchemaURI & keyof SummonerEnv<S>]: SummonerEnv<S>[k]
      }
    ) =>
    <L, A>(
      F: Materialized<SummonerEnv<S>, L, A, SummonerProgURI<S>, SummonerInterpURI<S>>
    ) =>
      F.derive(modelSchemaInterpreter<SummonerEnv<S>>())(_).Schema
}

const Schemaes = new Map<any, any>()
const defDerive = deriveFor(summonFor({}).make)({})

export function schema<E, A>(
  F: M<{}, E, A>
): T.RIO<Has<References>, JSONSchema | SubSchema> {
  if (Schemaes.has(F)) {
    return Schemaes.get(F)
  }
  const d = defDerive(F)
  Schemaes.set(F, d)
  return d
}

export * from "./base"
