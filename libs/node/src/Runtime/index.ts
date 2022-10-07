// ets_tracing: off

import * as L from "@effect/core/Collections/Immutable/List"
import { defaultRuntime } from "@effect/core/io/Effect"
import * as S from "@effect/core/Sync"
import * as path from "path"

export function defaultTeardown(
  status: number,
  id: Fiber.FiberID,
  onExit: (status: number) => void
) {
  Fiber.interruptAllAs(Supervisor.mainFibers, id).unsafeRunAsyncWith(() => {
    setTimeout(() => {
      if (Supervisor.mainFibers.size === 0) {
        onExit(status)
      } else {
        defaultTeardown(status, id, onExit)
      }
    }, 0)
  })
}

export const defaultHook =
  (cont: NodeJS.SignalsListener): ((signal: NodeJS.Signals) => void) =>
  (signal) =>
    cont(signal)

export const nodeTracer = (trace: Fiber.Trace) =>
  prettyTraceNode(trace, (path) =>
    path.replace("/esm/_traced/", "/").replace("/_traced/", "/")
  )

export function prettyTraceNode(
  trace: Fiber.Trace,
  adapt: (path: string, mod?: string) => string
): string {
  return S.run(prettyTraceNodeSafe(trace, adapt))
}

export function prettyLocationNode(
  traceElement: Fiber.SourceLocation,
  adapt: (path: string, mod?: string) => string
) {
  try {
    const isModule = traceElement.location.match(/\((.*)\): (.*):(\d+):(\d+)/)

    if (isModule) {
      const [, mod, file, line_, col] = isModule
      const line = parseInt(line_)
      const modulePath = require.resolve(`${mod}/package.json`)
      const realPath = adapt(path.join(modulePath, "..", file), mod)

      return `${realPath}:${line}:${col}`
    } else {
      const isPath = traceElement.location.match(/(.*):(\d+):(\d+)/)
      if (isPath) {
        const [, file, line_, col] = isPath
        const line = parseInt(line_)
        return `${path.join(process.cwd(), file)}:${line}:${col}`
      }
    }
  } catch {
    //
  }
  return traceElement.location
}

export function prettyTraceNodeSafe(
  trace: Fiber.Trace,
  adapt: (path: string, mod?: string) => string
): S.UIO<string> {
  return S.gen(function* ($) {
    const exec = L.filter_(
      trace.executionTrace,
      (t): t is Fiber.SourceLocation => t._tag === "SourceLocation"
    )
    const stack = L.filter_(
      trace.stackTrace,
      (t): t is Fiber.SourceLocation => t._tag === "SourceLocation"
    )
    const execTrace = !L.isEmpty(exec)
    const stackTrace = !L.isEmpty(stack)

    const execPrint = execTrace
      ? [
          `Fiber: ${Fiber.prettyFiberId(trace.fiberId)} Execution trace:`,
          "",
          ...L.toArray(L.map_(exec, (a) => `  ${prettyLocationNode(a, adapt)}`))
        ]
      : [`Fiber: ${Fiber.prettyFiberId(trace.fiberId)} Execution trace: <empty trace>`]

    const stackPrint = stackTrace
      ? [
          `Fiber: ${Fiber.prettyFiberId(trace.fiberId)} was supposed to continue to:`,
          "",
          ...L.toArray(
            L.map_(
              stack,
              (e) => `  a future continuation at ${prettyLocationNode(e, adapt)}`
            )
          )
        ]
      : [
          `Fiber: ${Fiber.prettyFiberId(
            trace.fiberId
          )} was supposed to continue to: <empty trace>`
        ]

    const parent = trace.parentTrace

    const ancestry =
      parent._tag === "None"
        ? [`Fiber: ${Fiber.prettyFiberId(trace.fiberId)} was spawned by: <empty trace>`]
        : [
            `Fiber: ${Fiber.prettyFiberId(trace.fiberId)} was spawned by:\n`,
            yield* $(prettyTraceNodeSafe(parent.value, adapt))
          ]

    return ["", ...stackPrint, "", ...execPrint, "", ...ancestry].join("\n")
  })
}

export class NodeRuntime<R, X> {
  constructor(readonly custom: CustomRuntime<R, X>) {
    this.runMain = this.runMain.bind(this)
  }

  /**
   * Runs effect until completion listening for system level termination signals that
   * triggers cancellation of the process, in case errors are found process will
   * exit with a status of 1 and cause will be pretty printed, if interruption
   * is found without errors the cause is pretty printed and process exits with
   * status 0. In the success scenario process exits with status 0 witout any log.
   *
   * Note: this should be used only in node.js as it depends on global process
   */
  runMain<E, A>(
    effect: Effect<R, E, A>,
    customHook: (cont: NodeJS.SignalsListener) => NodeJS.SignalsListener = defaultHook,
    customTeardown: typeof defaultTeardown = defaultTeardown
  ): void {
    const onExit = (s: number) => {
      process.exit(s)
    }

    const context = this.custom.runFiber(effect)

    context.runAsync((exit) => {
      switch (exit._tag) {
        case "Failure": {
          if (Cause.interruptedOnly(exit.cause)) {
            customTeardown(0, context.id, onExit)
            break
          } else {
            console.error(Cause.pretty(exit.cause, this.custom.platform.value.renderer))
            customTeardown(1, context.id, onExit)
            break
          }
        }
        case "Success": {
          customTeardown(0, context.id, onExit)
          break
        }
      }
    })

    const interrupted = new AtomicBoolean(false)

    const handler: NodeJS.SignalsListener = (signal) => {
      customHook(() => {
        process.removeListener("SIGTERM", handler)
        process.removeListener("SIGINT", handler)

        if (interrupted.compareAndSet(false, true)) {
          this.custom.run(context.interruptAs(context.id))
        }
      })(signal)
    }

    process.once("SIGTERM", handler)
    process.once("SIGINT", handler)
  }
}

export const nodeRuntime = new NodeRuntime(
  defaultRuntime.traceRenderer({
    renderTrace: nodeTracer,
    renderError: Cause.defaultRenderer.renderError,
    renderUnknown: Cause.defaultRenderer.renderUnknown
  })
)

export const {
  custom: { run, runCancel, runFiber, runPromise, runPromiseExit },
  runMain
} = nodeRuntime
