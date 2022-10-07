import { Lens } from "@effect-ts-app/monocle/Lens"

import { modify_, prop_ } from "../_ext/Lens.js"
import { applyFunctions } from "./util.js"

const BasePrototype = Lens.prototype as any

const funcs = {
  modify: modify_,
  prop: prop_,
}

applyFunctions(funcs, BasePrototype, "Lens")
