/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-app/core/Function"
import * as S from "@effect-app/schema"
import { These as Th } from "@effect-app/schema"
import { jwtDecode } from "jwt-decode"

export const jwtIdentifier = S.makeAnnotation<{}>()

export const jwtFromString: S.Schema<string, unknown, unknown, string, {}> = pipe(
  // S.identity((u): u is string => typeof u === "string"),
  S.identity((u): u is string => {
    throw new Error("Cannot id JWT: " + u)
  }),
  S.constructor((n) => Th.succeed(n)),
  //   S.arbitrary((_) => {
  //     throw new Error("Cannot arb JWT")
  //   }), // TODO
  //   S.encoder((_) => {
  //     throw new Error("can't encode")
  //   }),
  S.parser((p: any) => {
    try {
      return Th.succeed(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        jwtDecode(p)
      )
    } catch (err) {
      return Th.fail(S.leafE(S.parseStringE(p))) // "not a JWT: " + err as anyw
    }
  }),
  S.mapApi(() => ({})),
  S.annotate(jwtIdentifier, {})
)

export const jwt = S.string[">>>"](jwtFromString)
