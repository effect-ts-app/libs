/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-ts-app/core/Function"
import * as MO from "@effect-ts-app/schema"
import { These as Th } from "@effect-ts-app/schema"
import jwt_decode from "jwt-decode"

export const jwtIdentifier = MO.makeAnnotation<{}>()

export const jwtFromString: MO.Schema<string, unknown, unknown, string, {}> = pipe(
  //MO.identity((u): u is string => typeof u === "string"),
  MO.identity((u): u is string => {
    throw new Error("Cannot id JWT: " + u)
  }),
  MO.constructor((n) => Th.succeed(n)),
  //   MO.arbitrary((_) => {
  //     throw new Error("Cannot arb JWT")
  //   }), // TODO
  //   MO.encoder((_) => {
  //     throw new Error("can't encode")
  //   }),
  MO.parser((p: any) => {
    try {
      return Th.succeed(jwt_decode(p))
    } catch (err) {
      return Th.fail(MO.leafE(MO.parseStringE(p))) // "not a JWT: " + err as anyw
    }
  }),
  MO.mapApi(() => ({})),
  MO.annotate(jwtIdentifier, {})
)

export const jwt = MO.string[">>>"](jwtFromString)
