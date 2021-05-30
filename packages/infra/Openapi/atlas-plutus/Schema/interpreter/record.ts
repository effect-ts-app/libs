import { pipe } from "@effect-ts/core/Function"
import type { RecordURI } from "@effect-ts/morphic/Algebra/Record"
import { interpreter } from "@effect-ts/morphic/HKT"

import * as X from "../base"

export const SchemaRecordInterpreter = interpreter<X.SchemaURI, RecordURI>()(() => ({
  _F: X.SchemaURI,
  record: (codomain, config) => (env) =>
    pipe(
      codomain(env).Schema,
      (Schema) =>
        new X.SchemaType(
          X.SchemaApplyConfig(config?.conf)(X.succeed({ type: "object" }), env, {
            Schema,
          })
        )
    ),
}))
