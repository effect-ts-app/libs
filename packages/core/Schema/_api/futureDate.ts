import { pipe } from "../../Function"
import * as MO from "../_schema"
import { domainEE, domainResponse2, onParseOrConstruct } from "../utils"
import { Parser, These } from "../vendor"

export const fromDateIdentifier = MO.makeAnnotation<{}>()
export const fromDate: MO.DefaultSchema<Date, Date, Date, Date, {}> = pipe(
  MO.identity((u): u is Date => u instanceof Date),
  MO.arbitrary((_) => _.date()),
  MO.mapApi(() => ({})),
  MO.withDefaults,
  MO.annotate(fromDateIdentifier, {})
)

export const fromStringOrDateIdentifier = MO.makeAnnotation<{}>()
export const fromStringOrDate: MO.DefaultSchema<string | Date, Date, Date, string, {}> =
  pipe(
    MO.identity((u): u is Date => u instanceof Date),
    MO.parser((u) => (u instanceof Date ? These.succeed(u) : Parser.for(MO.date)(u))),
    MO.arbitrary((_) => _.date()),
    MO.encoder((_) => _.toISOString()),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(fromStringOrDateIdentifier, {})
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

export const FutureDateFromStringOrDate = fromStringOrDate["|>"](
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
