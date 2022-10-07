import { Base } from "@effect-ts/core/Effect"
import { runMain } from "@effect-ts-app/node/Runtime"

const BasePrototype = Base.prototype as any

BasePrototype.runMain = function () {
  return runMain(this)
}
