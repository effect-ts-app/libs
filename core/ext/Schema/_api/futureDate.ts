import * as S from "../_schema"
import { domainEE, domainResponse2, onParseOrConstruct } from "../utils"

export const FutureDate = S.date["|>"](
  onParseOrConstruct((i) => {
    const errors: S.AnyError[] = []
    if (i < new Date()) {
      errors.push(domainEE("Date is not in the future"))
    }
    return domainResponse2(errors, () => i)
  })
)
export type FutureDate = S.ParsedShapeOf<typeof FutureDate>
