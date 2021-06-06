// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import * as Th from "../These"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const dateIdentifier = S.makeAnnotation<{}>()

export const date: DefaultSchema<unknown, Date, Date, string, {}> = pipe(
  S.identity((u): u is Date => u instanceof Date),
  S.parser((u: unknown) => {
    if (typeof u !== "string" || u == null) {
      return Th.fail(S.leafE(S.parseDateE(u)))
    }
    const ms = Date.parse(u)
    if (Number.isNaN(ms)) {
      return Th.fail(S.leafE(S.parseDateE(u)))
    }
    return Th.succeed(new Date(ms))
  }),
  S.arbitrary((_) => _.date()),
  S.encoder((_) => _.toISOString()),
  S.mapApi((_) => ({})),
  withDefaults,
  S.annotate(dateIdentifier, {})
)

export const dateMsIdentifier = S.makeAnnotation<{}>()

export const dateMs: DefaultSchema<unknown, Date, Date, number, {}> = pipe(
  date,
  S.parser((u) =>
    typeof u === "number"
      ? Th.succeed(new Date(u))
      : Th.fail(S.leafE(S.parseDateMsE(u)))
  ),
  S.encoder((_) => _.getTime()),
  S.mapApi((_) => ({})),
  withDefaults,
  S.annotate(dateMsIdentifier, {})
)
