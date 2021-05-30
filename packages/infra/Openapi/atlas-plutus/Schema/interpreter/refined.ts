import { pipe } from "@effect-ts/core/Function"
import type { RefinedURI } from "@effect-ts/morphic/Algebra/Refined"
import { interpreter } from "@effect-ts/morphic/HKT"

import { SchemaApplyConfig, SchemaType, SchemaURI } from "../base"

export const SchemaRefinedInterpreter = interpreter<SchemaURI, RefinedURI>()(() => ({
  _F: SchemaURI,
  refined: (getSchema, _ref, config) => (env) => {
    return pipe(
      getSchema(env).Schema,
      (Schema) => ({
        ...Schema,
        val: {
          ...(Schema as any).val!,
          ...(config?.name ? { title: config?.name } : undefined),
          ...config?.extensions?.openapiMeta,
        },
      }),
      (Schema) =>
        new SchemaType(
          SchemaApplyConfig(config?.conf)(Schema, env, {
            Schema,
            SchemaRefined: Schema,
          })
        )
    )
  },
  constrained: (getSchema, _ref, config) => (env) =>
    pipe(
      getSchema(env).Schema,
      (Schema) =>
        new SchemaType(
          SchemaApplyConfig(config?.conf)(Schema, env, {
            Schema,
          })
        )
    ),
}))
