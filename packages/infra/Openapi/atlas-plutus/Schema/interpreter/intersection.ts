import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import { identity, pipe } from "@effect-ts/core/Function"
import { interpreter } from "@effect-ts/morphic/HKT"

import * as X from "../base"

import type { IntersectionURI } from "@effect-ts/morphic/Algebra/Intersection"

export const SchemaIntersectionInterpreter = interpreter<
  X.SchemaURI,
  IntersectionURI
>()(() => ({
  _F: X.SchemaURI,
  intersection:
    (...types) =>
    (config) =>
    (env) => {
      const Schemaes = types.map((getSchema) => getSchema(env).Schema)
      return new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            Schemaes,
            X.forEach(identity),
            X.chain((allOf) => X.succeed({ allOf: CNK.toArray(allOf) }))
          ),
          env,
          {
            Schemaes: Schemaes as any,
          }
        )
      )
    },
}))
