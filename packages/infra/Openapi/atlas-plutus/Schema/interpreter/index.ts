import type { AnyEnv } from "@effect-ts/morphic/HKT"
import { memo, merge } from "@effect-ts/morphic/Utils"

import { SchemaIntersectionInterpreter } from "./intersection"
import { SchemaNewtypeInterpreter } from "./newtype"
import { SchemaObjectInterpreter } from "./object"
import { SchemaPrimitiveInterpreter } from "./primitives"
import { SchemaRecordInterpreter } from "./record"
import { SchemaRecursiveInterpreter } from "./recursive"
import { SchemaRefinedInterpreter } from "./refined"
import { SchemaSetInterpreter } from "./set"
import { SchemaTaggedUnionInterpreter } from "./tagged-union"
import { SchemaUnionInterpreter } from "./union"
import { SchemaUnknownInterpreter } from "./unknown"

export const allModelSchema = <Env extends AnyEnv>() =>
  merge(
    SchemaRefinedInterpreter<Env>(),
    SchemaNewtypeInterpreter<Env>(),
    SchemaUnknownInterpreter<Env>(),
    SchemaPrimitiveInterpreter<Env>(),
    SchemaIntersectionInterpreter<Env>(),
    SchemaObjectInterpreter<Env>(),
    SchemaTaggedUnionInterpreter<Env>(),
    SchemaRecursiveInterpreter<Env>(),
    SchemaSetInterpreter<Env>(),
    SchemaRecordInterpreter<Env>(),
    SchemaUnionInterpreter<Env>()
  )

export const modelSchemaInterpreter = memo(allModelSchema) as typeof allModelSchema

export { SchemaIntersectionInterpreter } from "./intersection"
export { SchemaNewtypeInterpreter } from "./newtype"
export { SchemaObjectInterpreter } from "./object"
export { SchemaPrimitiveInterpreter } from "./primitives"
export { SchemaRecordInterpreter } from "./record"
export { SchemaRecursiveInterpreter } from "./recursive"
export { SchemaRefinedInterpreter } from "./refined"
export { SchemaSetInterpreter } from "./set"
export { SchemaTaggedUnionInterpreter } from "./tagged-union"
export { SchemaUnionInterpreter } from "./union"
export { SchemaUnknownInterpreter } from "./unknown"
