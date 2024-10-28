/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from "@sentry/browser"
import type { Either } from "effect-app"
import { Cause, Effect, Match, Runtime, S } from "effect-app"
import { type SupportedErrors } from "effect-app/client"
import { flow, pipe, tuple } from "effect-app/Function"
import type { OperationFailure } from "effect-app/Operations"
import { OperationSuccess } from "effect-app/Operations"
import { dropUndefinedT } from "effect-app/utils"
import { computed, type ComputedRef } from "vue"
import type { MakeIntlReturn } from "./makeIntl.js"
import type { MakeMutation, MutationOptions, Res } from "./mutate.js"
import { mutationResultToVue } from "./mutate.js"

/**
 * Use this after handling an error yourself, still continueing on the Error track, but the error will not be reported.
 */
export class SuppressErrors extends Cause.YieldableError {
  readonly _tag = "SuppressErrors"
}

export type ResponseErrors = S.ParseResult.ParseError | SupportedErrors | SuppressErrors | OperationFailure

export interface Opts<A, I = void> extends MutationOptions<A, I> {
  suppressErrorToast?: boolean
  suppressSuccessToast?: boolean
  successToast?: (a: A) => any
}

/** @deprecated - use mapHandler */
export const withSuccess: {
  <I, A, E, X, R>(
    self: {
      handler: (i: I) => Effect<A, E, R>
      name: string
    },
    onSuccess: (a: A, i: I) => Promise<X>
  ): {
    handler: (i: I) => Effect<X, E, R>
    name: string
  }
  <A, E, X, R>(
    self: {
      handler: Effect<A, E, R>
      name: string
    },
    onSuccess: (_: A) => Promise<X>
  ): {
    handler: Effect<X, E, R>
    name: string
  }
} = (self: any, onSuccess: any): any => ({
  ...self,
  handler: typeof self.handler === "function"
    ? (i: any) =>
      pipe(
        (
          self.handler as (
            i: any
          ) => Effect<any, any, any>
        )(i),
        Effect.flatMap((_) =>
          Effect.promise(() => onSuccess(_, i)).pipe(
            Effect.withSpan("onSuccess")
          )
        )
      )
    : Effect.flatMap(self.handler, (_) => Effect.promise(() => onSuccess(_)).pipe(Effect.withSpan("onSuccess")))
})

/** @deprecated - use mapHandler */
export const withSuccessE: {
  <I, E, A, E2, X, R>(
    self: {
      handler: (i: I) => Effect<A, E, R>
      name: string
    },
    onSuccessE: (_: A, i: I) => Effect<X, E2>
  ): {
    handler: (i: I) => Effect<X, E | E2, R>
    name: string
  }
  <E, A, E2, X, R>(
    self: {
      handler: Effect<A, E, R>
      name: string
    },
    onSuccessE: (_: A) => Effect<X, E2>
  ): {
    handler: Effect<X, E | E2, R>
    name: string
  }
} = (self: any, onSuccessE: any): any => {
  return {
    ...self,
    handler: typeof self.handler === "function"
      ? (i: any) =>
        pipe(
          self.handler(i),
          Effect.flatMap((_) => onSuccessE(_, i))
        )
      : Effect.flatMap(self.handler, (_) => onSuccessE(_))
  }
}

type WithAction<A> = A & {
  action: string
}

// computed() takes a getter function and returns a readonly reactive ref
// object for the returned value from the getter.
type Resp<I, E, A> = readonly [
  ComputedRef<Res<A, E>>,
  WithAction<(I: I) => Promise<void>>
]

type ActResp<E, A> = readonly [
  ComputedRef<Res<A, E>>,
  WithAction<() => Promise<void>>
]

export const makeClient = <Locale extends string, R>(
  useIntl: MakeIntlReturn<Locale>["useIntl"],
  useToast: () => {
    error: (message: string) => void
    warning: (message: string) => void
    success: (message: string) => void
  },
  useSafeMutation: MakeMutation<R>,
  messages: Record<string, string | undefined> = {}
) => {
  const useHandleRequestWithToast = () => {
    const toast = useToast()
    const { intl } = useIntl()

    return handleRequestWithToast
    /**
     * Pass a function that returns a Promise.
     * Returns an execution function which reports errors as Toast.
     */
    function handleRequestWithToast<
      E extends ResponseErrors,
      A,
      Args extends unknown[]
    >(
      f: (...args: Args) => Promise<Either<A, E>>,
      action: string,
      options: Opts<A> = { suppressErrorToast: false }
    ) {
      const message = messages[action] ?? action
      const warnMessage = intl.value.formatMessage(
        { id: "handle.with_warnings" },
        { action: message }
      )
      const successMessage = intl.value.formatMessage(
        { id: "handle.success" },
        { action: message }
      )
      const errorMessage = intl.value.formatMessage(
        { id: "handle.with_errors" },
        { action: message }
      )
      return Object.assign(
        flow(f, (p) =>
          p.then(
            (r) => {
              if (r._tag === "Right") {
                if (options.suppressSuccessToast) {
                  return
                }
                return Promise
                  .resolve(
                    toast.success(
                      successMessage
                        + (S.is(OperationSuccess)(r.right) && r.right.message
                          ? "\n" + r.right.message
                          : "")
                    )
                  )
                  .then((_) => {})
              }
              if (r.left._tag === "SuppressErrors") {
                return Promise.resolve(void 0)
              }

              if (r.left._tag === "OperationFailure") {
                return toast.warning(
                  warnMessage + r.left.message
                    ? "\n" + r.left.message
                    : ""
                )
              }
              if (!options.suppressErrorToast) {
                toast.error(`${errorMessage}:\n` + renderError(r.left))
              }

              console.warn(r.left, r.left.toString())
            },
            (err) => {
              if (
                Cause.isInterruptedException(err)
                || (Runtime.isFiberFailure(err)
                  && Cause.isInterruptedOnly(err[Runtime.FiberFailureCauseId]))
              ) {
                return
              }
              const extra = {
                action,
                message: `Unexpected Error trying to ${action}`
              }
              Sentry.captureException(err, {
                extra
              })
              console.error(err, extra)

              return toast.error(
                intl.value.formatMessage(
                  { id: "handle.unexpected_error" },
                  {
                    action: message,
                    error: JSON.stringify(err, undefined, 2)
                  }
                )
              )
            }
          )),
        { action }
      )
    }

    function renderError(e: ResponseErrors): string {
      return Match.value(e).pipe(
        Match.tags({
          // HttpErrorRequest: e =>
          //   intl.value.formatMessage(
          //     { id: "handle.request_error" },
          //     { error: `${e.error}` },
          //   ),
          // HttpErrorResponse: e =>
          //   e.response.status >= 500 ||
          //   e.response.body._tag !== "Some" ||
          //   !e.response.body.value
          //     ? intl.value.formatMessage(
          //         { id: "handle.error_response" },
          //         {
          //           error: `${
          //             e.response.body._tag === "Some" && e.response.body.value
          //               ? parseError(e.response.body.value)
          //               : "Unknown"
          //           } (${e.response.status})`,
          //         },
          //       )
          //     : intl.value.formatMessage(
          //         { id: "handle.unexpected_error" },
          //         {
          //           error:
          //             JSON.stringify(e.response.body, undefined, 2) +
          //             "( " +
          //             e.response.status +
          //             ")",
          //         },
          //       ),
          // ResponseError: e =>
          //   intl.value.formatMessage(
          //     { id: "handle.response_error" },
          //     { error: `${e.error}` },
          //   ),
          ParseError: (e) => {
            console.warn(e.toString())
            return intl.value.formatMessage({ id: "validation.failed" })
          }
        }),
        Match.orElse((e) =>
          intl.value.formatMessage(
            { id: "handle.unexpected_error" },
            {
              error: `${e.message ?? e._tag ?? e}`
            }
          )
        )
      )
    }
  }

  /**
   * Pass a function that returns an Effect, e.g from a client action, give it a name, and optionally pass an onSuccess callback.
   * Returns a tuple with state ref and execution function which reports errors as Toast.
   */
  const useAndHandleMutation: {
    <I, E extends ResponseErrors, A>(
      self: {
        handler: (i: I) => Effect<A, E, R>
        name: string
      },
      action: string,
      options?: Opts<A, I>
    ): Resp<I, A, E>
    <E extends ResponseErrors, A>(
      self: {
        handler: Effect<A, E, R>
        name: string
      },
      action: string,
      options?: Opts<A>
    ): ActResp<E, A>
  } = (self: any, action: any, options?: Opts<any>) => {
    const handleRequestWithToast = useHandleRequestWithToast()
    const [a, b] = useSafeMutation(
      {
        handler: Effect.isEffect(self.handler)
          ? (pipe(
            Effect.annotateCurrentSpan({ action }),
            Effect.andThen(self.handler)
          ) as any)
          : (...args: any[]) =>
            pipe(
              Effect.annotateCurrentSpan({ action }),
              Effect.andThen(self.handler(...args))
            ),
        name: self.name
      },
      dropUndefinedT({
        queryInvalidation: options?.queryInvalidation,
        onSuccess: options?.onSuccess
      })
    )

    return tuple(
      computed(() => mutationResultToVue(a.value)),
      handleRequestWithToast(b as any, action, options)
    )
  }

  function makeUseAndHandleMutation(
    onSuccess?: () => Promise<void>,
    defaultOptions?: Opts<any>
  ) {
    return ((self: any, action: any, options: any) => {
      return useAndHandleMutation(
        {
          handler: typeof self.handler === "function"
            ? onSuccess
              ? (i: any) => Effect.tap(self.handler(i), () => Effect.promise(onSuccess))
              : self.handler
            : onSuccess
            ? (Effect.tap(self.handler, () => Effect.promise(onSuccess)) as any)
            : self.handler,
          name: self.name
        },
        action,
        { ...defaultOptions, ...options }
      )
    }) as {
      <I, E extends ResponseErrors, A>(
        self: {
          handler: (i: I) => Effect<A, E, R>
          name: string
        },
        action: string,
        options?: Opts<A, I>
      ): Resp<I, A, E>
      <E extends ResponseErrors, A>(
        self: {
          handler: Effect<A, E, R>
          name: string
        },
        action: string,
        options?: Opts<A>
      ): ActResp<E, A>
    }
  }

  const useSafeMutationWithState = <I, E, A>(self: {
    handler: (i: I) => Effect<A, E, R>
    name: string
  }) => {
    const [a, b] = useSafeMutation(self)

    return tuple(
      computed(() => mutationResultToVue(a.value)),
      b
    )
  }

  return {
    useSafeMutationWithState,
    useAndHandleMutation,
    makeUseAndHandleMutation,
    useHandleRequestWithToast
  }
}
