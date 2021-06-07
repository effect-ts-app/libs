import { pipe } from "@effect-ts-app/core/Function"

import * as MO from "../_schema"
import { domainEE, domainResponse2, onParseOrConstruct } from "../utils"

export const fromDateIdentifier = MO.makeAnnotation<{}>()
export const fromDate: MO.DefaultSchema<Date, never, Date, Date, never, Date, {}> =
  pipe(
    MO.identity((u): u is Date => u instanceof Date),
    MO.arbitrary((_) => _.date()),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(fromDateIdentifier, {})
  )

export const FutureDateFromDate = fromDate["|>"](
  onParseOrConstruct((i) => {
    const errors: MO.AnyError[] = []
    if (i < new Date()) {
      errors.push(domainEE("Date is not in the future"))
    }
    return domainResponse2(errors, () => i)
  })
)

export const FutureDate = MO.date[">>>"](FutureDateFromDate)
export type FutureDate = MO.ParsedShapeOf<typeof FutureDate>
