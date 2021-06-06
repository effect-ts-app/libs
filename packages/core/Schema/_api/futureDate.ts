import * as MO from "../_schema"
import { domainEE, domainResponse2, onParseOrConstruct } from "../utils"

export const FutureDate = MO.date["|>"](
  onParseOrConstruct((i) => {
    const errors: unknown[] = []
    if (i < new Date()) {
      errors.push(domainEE("Date is not in the future"))
    }
    return domainResponse2(errors, () => i)
  })
)
export type FutureDate = MO.ParsedShapeOf<typeof FutureDate>
