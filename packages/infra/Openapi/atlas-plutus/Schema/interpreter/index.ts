import type { AnyEnv } from "@effect-ts/morphic/HKT"
import { memo, merge } from "@effect-ts/morphic/Utils"

import { SchemaIntersectionInterpreter } from "./intersection.js"
import { SchemaNewtypeInterpreter } from "./newtype.js"
import { SchemaObjectInterpreter } from "./object.js"
import { SchemaPrimitiveInterpreter } from "./primitives.js"
import { SchemaRecordInterpreter } from "./record.js"
import { SchemaRecursiveInterpreter } from "./recursive.js"
import { SchemaRefinedInterpreter } from "./refined.js"
import { SchemaSetInterpreter } from "./set.js"
import { SchemaTaggedUnionInterpreter } from "./tagged-union.js"
import { SchemaUnionInterpreter } from "./union.js"
import { SchemaUnknownInterpreter } from "./unknown.js"

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

export { SchemaIntersectionInterpreter } from "./intersection.js"
export { SchemaNewtypeInterpreter } from "./newtype.js"
export { SchemaObjectInterpreter } from "./object.js"
export { SchemaPrimitiveInterpreter } from "./primitives.js"
export { SchemaRecordInterpreter } from "./record.js"
export { SchemaRecursiveInterpreter } from "./recursive.js"
export { SchemaRefinedInterpreter } from "./refined.js"
export { SchemaSetInterpreter } from "./set.js"
export { SchemaTaggedUnionInterpreter } from "./tagged-union.js"
export { SchemaUnionInterpreter } from "./union.js"
export { SchemaUnknownInterpreter } from "./unknown.js"
