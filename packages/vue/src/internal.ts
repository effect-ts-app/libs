import { pipe } from "effect-app"
import { reportError } from "./errorReporter.js"

export const reportRuntimeError = reportError("Runtime")

// $Project/$Configuration.Index
// -> "$Project", "$Configuration", "Index"
export const makeQueryKey = ({ name }: { name: string }) =>
  pipe(name.split("/"), (split) => split.map((_) => "$" + _))
    .join(".")
    .split(".")
