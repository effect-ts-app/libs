/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Effect, FiberRef } from "effect"

type Levels = "info" | "debug" | "warn" | "error"
export const LogLevels = FiberRef.unsafeMake(new Map<string, Levels>())
export const makeLog = (namespace: string, defaultLevel: Levels = "warn") => {
  const level = LogLevels.pipe(Effect.andThen((levels) => levels.get(namespace) ?? defaultLevel))
  return {
    logWarning: (...message: ReadonlyArray<any>) =>
      level.pipe(
        Effect.andThen((l) =>
          l === "info" || l === "debug" || l === "warn" ? Effect.logWarning(...message) : Effect.void
        )
      ),
    logError: Effect.logError,
    logFatal: Effect.logFatal,
    logInfo: (...message: ReadonlyArray<any>) =>
      level.pipe(Effect.andThen((l) => l === "info" || l === "debug" ? Effect.logInfo(...message) : Effect.void)),
    logDebug: (...message: ReadonlyArray<any>) =>
      level.pipe(Effect.andThen((l) => l === "debug" ? Effect.logDebug(...message) : Effect.void))
  }
}
