import type { UnknownURI } from "@effect-ts/morphic/Algebra/Unknown"
import { interpreter } from "@effect-ts/morphic/HKT"

import * as X from "../base"

export const SchemaUnknownInterpreter = interpreter<X.SchemaURI, UnknownURI>()(() => ({
  _F: X.SchemaURI,
  unknown: (config) => (env) =>
    new X.SchemaType(
      X.SchemaApplyConfig(config?.conf)(X.succeed({ type: "object" }), env, {})
    ),
}))
