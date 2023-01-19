/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-app/core/Function"
import * as MO from "@effect-app/schema"
import { These as Th } from "@effect-app/schema"
import jwt_decode from "jwt-decode"

export const jwtIdentifier = MO.makeAnnotation<{}>()

export const jwtFromString: MO.Schema<string, unknown, unknown, string, {}> = pipe(
  // MO.identity((u): u is string => typeof u === "string"),
  MO.identity((u): u is string => {
    throw new Error("Cannot id JWT: " + u)
  }),
  MO.constructor(n => Th.succeed(n)),
  //   MO.arbitrary((_) => {
  //     throw new Error("Cannot arb JWT")
  //   }), // TODO
  //   MO.encoder((_) => {
  //     throw new Error("can't encode")
  //   }),
  MO.parser((p: any) => {
    try {
      return Th.succeed(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        jwt_decode(p)
      )
    } catch (err) {
      return Th.fail(MO.leafE(MO.parseStringE(p))) // "not a JWT: " + err as anyw
    }
  }),
  MO.mapApi(() => ({})),
  MO.annotate(jwtIdentifier, {})
)

export const jwt = MO.string[">>>"](jwtFromString)
