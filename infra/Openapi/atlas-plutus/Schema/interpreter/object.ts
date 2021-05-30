import { pipe } from "@effect-ts/core/Function"
import type { ObjectURI } from "@effect-ts/morphic/Algebra/Object"
import { interpreter } from "@effect-ts/morphic/HKT"
import { projectFieldWithEnv } from "@effect-ts/morphic/Utils"

import * as X from "../base"

export const SchemaObjectInterpreter = interpreter<X.SchemaURI, ObjectURI>()(() => ({
  _F: X.SchemaURI,
  interface: (props, config) => (env) =>
    new X.SchemaType(
      X.referenced(config?.extensions)(
        pipe(projectFieldWithEnv(props, env)("Schema"), (Schema) =>
          X.SchemaApplyConfig(config?.conf)(
            pipe(
              X.struct(Schema as any as { x: X.Schema }),
              X.chain((properties) =>
                X.succeed({
                  type: "object",
                  properties,
                  required: Object.keys(properties),
                })
              )
            ),
            env,
            {
              Schema: Schema as any,
            }
          )
        )
      )
    ),
  partial: (props, config) => (env) =>
    new X.SchemaType(
      X.referenced(config?.extensions)(
        pipe(projectFieldWithEnv(props, env)("Schema"), (Schema) =>
          X.SchemaApplyConfig(config?.conf)(
            pipe(
              X.struct(Schema as any as { x: X.Schema }),
              X.chain((properties) =>
                X.succeed({
                  type: "object",
                  properties,
                  //required: Object.keys(properties)
                })
              )
            ),
            env,
            {
              Schema: Schema as any,
            }
          )
        )
      )
    ),
  both: (props, partial, config) => (env) =>
    new X.SchemaType(
      pipe(projectFieldWithEnv(props, env)("Schema"), (Schema) =>
        pipe(projectFieldWithEnv(partial, env)("Schema"), (SchemaPartial) =>
          X.referenced(config?.extensions)(
            X.SchemaApplyConfig(config?.conf)(
              pipe(
                X.struct({
                  req: X.struct(Schema as any as { x: X.Schema }),
                  par: X.struct(SchemaPartial as any as { x: X.Schema }),
                }),
                X.chain(({ par, req }) =>
                  X.succeed({
                    type: "object",
                    properties: { ...par, ...req },
                    required: Object.keys(req),
                  })
                )
              ),
              env,
              {
                Schema: Schema as any,
                SchemaPartial: SchemaPartial as any,
              }
            )
          )
        )
      )
    ) as any,
}))
