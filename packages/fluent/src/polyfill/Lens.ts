import { Lens } from "@effect-ts/monocle/Lens"

import { modify_, prop_ } from "../_ext/Lens"
import { applyFunctions } from "./util"

const BasePrototype = Lens.prototype as any

const funcs = {
  modify: modify_,
  prop: prop_,
}

applyFunctions(funcs, BasePrototype, "Lens")
