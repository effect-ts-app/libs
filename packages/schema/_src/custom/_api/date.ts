// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import * as Th from "../These.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const dateIdentifier = S.makeAnnotation<{}>()

const dateParser = (u: unknown, env: any) => {
  if (typeof u !== "string" || u == null) {
    return Th.fail(S.leafE(S.parseDateE(u)))
  }
  const ms = Date.parse(u)
  if (Number.isNaN(ms)) {
    return Th.fail(S.leafE(S.parseDateE(u)))
  }
  return Th.succeed(new Date(ms))
}

function isProbablyADate(u: unknown): u is Date {
  return (u instanceof Object && "toISOString" in u && "getTime" in u)
}

export const date: DefaultSchema<unknown, Date, Date, string, {}> = pipe(
  S.identity((u): u is Date => u instanceof Date),
  S.parser((u: unknown, env) =>
    // if it quacks like a ... Date..
    u instanceof Date || isProbablyADate(u)
      ? Number.isNaN(u.getTime())
        ? Th.fail(S.leafE(S.parseDateE(u)))
        : Th.succeed(u)
      : dateParser(u, env)
  ),
  S.arbitrary(_ => _.date()),
  S.encoder(_ => _.toISOString()),
  S.mapApi(_ => ({})),
  withDefaults,
  S.annotate(dateIdentifier, {})
)

export const dateMsIdentifier = S.makeAnnotation<{}>()

export const dateMs: DefaultSchema<unknown, Date, Date, number, {}> = pipe(
  date,
  S.parser(u =>
    typeof u === "number"
      ? Th.succeed(new Date(u))
      : Th.fail(S.leafE(S.parseDateMsE(u)))
  ),
  S.encoder(_ => _.getTime()),
  S.mapApi(_ => ({})),
  withDefaults,
  S.annotate(dateMsIdentifier, {})
)
