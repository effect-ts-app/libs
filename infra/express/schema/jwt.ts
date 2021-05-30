/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-ts-app/core/ext/Function"
import * as S from "@effect-ts-app/core/ext/Schema"
import { These as Th } from "@effect-ts-app/core/ext/Schema"
import jwt_decode from "jwt-decode"

export const jwtIdentifier = S.makeAnnotation<{}>()

export const jwtFromString: S.Schema<
  string,
  any, //err
  unknown,
  unknown,
  never,
  string,
  {}
> = pipe(
  //S.identity((u): u is string => typeof u === "string"),
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
      return Th.succeed(jwt_decode(p))
    } catch (err) {
      return Th.fail(S.leafE(S.parseStringE(p))) // "not a JWT: " + err as anyw
    }
  }),
  S.mapApi(() => ({})),
  S.annotate(jwtIdentifier, {})
)

export const jwt = S.string[">>>"](jwtFromString)
