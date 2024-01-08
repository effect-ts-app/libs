import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import { domainEE, domainResponse2, onParseOrConstruct } from "../utils.js"
import { Parser, These } from "../vendor.js"
import { extendWithUtils } from "./_shared.js"

export const fromDateIdentifier = S.makeAnnotation<{}>()
export const fromDate: S.DefaultSchema<Date, Date, Date, Date, {}> = pipe(
  S.identity((u): u is Date => u instanceof Date),
  S.arbitrary((_) => _.date()),
  S.mapApi(() => ({})),
  S.withDefaults,
  S.annotate(fromDateIdentifier, {})
)

const parseDate = Parser.for(S.date)

export const fromStringOrDateIdentifier = S.makeAnnotation<{}>()
export const fromStringOrDate: S.DefaultSchema<string | Date, Date, Date, string, {}> = pipe(
  S.identity((u): u is Date => u instanceof Date),
  S.parser((u, env) => (u instanceof Date ? These.succeed(u) : parseDate(u, env))),
  S.arbitrary((_) => _.date()),
  S.encoder((_) => _.toISOString()),
  S.mapApi(() => ({})),
  S.withDefaults,
  S.annotate(fromStringOrDateIdentifier, {})
)

export const FutureDateFromDate = fromDate.pipe(
  onParseOrConstruct((i) => {
    const errors: S.AnyError[] = []
    if (i < new Date()) {
      errors.push(domainEE("Date is not in the future"))
    }
    return domainResponse2(errors, () => i)
  })
)

export const FutureDateFromStringOrDate = fromStringOrDate.pipe(
  onParseOrConstruct((i) => {
    const errors: S.AnyError[] = []
    if (i < new Date()) {
      errors.push(domainEE("Date is not in the future"))
    }
    return domainResponse2(errors, () => i)
  })
)

export const FutureDate = extendWithUtils(S.date[">>>"](FutureDateFromDate))
export type FutureDate = S.To<typeof FutureDate>
