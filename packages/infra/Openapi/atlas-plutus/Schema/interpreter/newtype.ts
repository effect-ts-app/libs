import { pipe } from "@effect-ts/core/Function"
import type { NewtypeURI } from "@effect-ts/morphic/Algebra/Newtype"
import { interpreter } from "@effect-ts/morphic/HKT"

import { SchemaApplyConfig, SchemaType, SchemaURI } from "../base"

export const SchemaNewtypeInterpreter = interpreter<SchemaURI, NewtypeURI>()(() => ({
  _F: SchemaURI,
  newtypeIso: (_, a, config) => (env) =>
    pipe(
      a(env).Schema,
      (Schema) =>
        new SchemaType(
          SchemaApplyConfig(config?.conf)(Schema, env, {
            Schema,
          })
        )
    ),
  newtypePrism: (_, a, config) => (env) =>
    pipe(
      a(env).Schema,
      (Schema) =>
        new SchemaType(
          SchemaApplyConfig(config?.conf)(Schema, env, {
            Schema,
          })
        )
    ),
}))
