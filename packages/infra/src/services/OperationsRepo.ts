import { Effect } from "effect-app"
import { Operation } from "effect-app/Operations"
import { makeRepo } from "./RepositoryBase.js"

export class OperationsRepo extends Effect.Service<OperationsRepo>()(
  "OperationRepo",
  {
    effect: Effect.gen(function*() {
      return yield* makeRepo("Operation", Operation, {
        config: {
          allowNamespace: () => true
        }
      })
    })
  }
) {}
