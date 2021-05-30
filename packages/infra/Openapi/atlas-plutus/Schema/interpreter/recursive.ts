import type { RecursiveURI } from "@effect-ts/morphic/Algebra/Recursive"
import { interpreter } from "@effect-ts/morphic/HKT"
import { memo } from "@effect-ts/morphic/Utils"

import { Ref } from "../../JsonSchema"
import {
  dieMessage,
  referenced,
  SchemaApplyConfig,
  SchemaType,
  SchemaURI,
  succeed,
} from "../base"

export const SchemaRecursiveInterpreter = interpreter<SchemaURI, RecursiveURI>()(
  () => ({
    _F: SchemaURI,
    recursive: (a, config) => {
      let i = 0
      const get = memo(() => a(res))
      const res: ReturnType<typeof a> = (env) => {
        if (i === 0) {
          i++
          return new SchemaType(
            referenced(config?.extensions)(
              SchemaApplyConfig(config?.conf)(get()(env).Schema, env, {})
            )
          )
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return new SchemaType(
          config?.extensions?.openapiRef
            ? succeed(Ref(`#/components/schemas/${config?.extensions?.openapiRef}`))
            : dieMessage("recursive definitions must have a ref")
        )
      }
      return res
    },
  })
)
