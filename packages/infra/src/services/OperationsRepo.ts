import { Operation } from "effect-app/Operations"
import { RepositoryDefaultImpl } from "./RepositoryBase.js"

export class OperationsRepo extends RepositoryDefaultImpl<OperationsRepo>()(
  "Operation",
  Operation
) {}
