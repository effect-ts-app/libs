import { pipe } from "@effect-ts/core/Function"
import type { SetURI } from "@effect-ts/morphic/Algebra/Set"
import { interpreter } from "@effect-ts/morphic/HKT"

import * as X from "../base"

export const SchemaSetInterpreter = interpreter<X.SchemaURI, SetURI>()(() => ({
  _F: X.SchemaURI,
  set: (getSchema, _ord, _eq, config) => (env) =>
    pipe(
      getSchema(env).Schema,
      (Schema) =>
        new X.SchemaType(
          X.SchemaApplyConfig(config?.conf)(
            pipe(
              Schema,
              X.chain((items) =>
                X.succeed({
                  type: "array",
                  items,
                  description: "Unique Set",
                  title: config?.name,
                  ...config?.extensions?.openapiMeta,
                })
              )
            ),
            env,
            {
              Schema,
            }
          )
        )
    ),
}))
