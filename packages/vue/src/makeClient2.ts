/* eslint-disable @typescript-eslint/no-explicit-any */
import { flow, pipe, tuple } from "@effect-app/core/Function"
import * as Sentry from "@sentry/browser"
import { Cause, Effect, Exit, Match, Option, S } from "effect-app"
import { OperationSuccess } from "effect-app/Operations"
import { dropUndefinedT } from "effect-app/utils"
import { computed, type ComputedRef } from "vue"
import type { TaggedRequestClassAny } from "./lib.js"
import type { Opts, ResponseErrors } from "./makeClient.js"
import type { MakeIntlReturn } from "./makeIntl.js"
import { mutationResultToVue } from "./mutate.js"
import type { Res } from "./mutate.js"
import type { MakeMutation2 } from "./mutate2.js"

type WithAction<A> = A & {
  action: string
}

// computed() takes a getter function and returns a readonly reactive ref
// object for the returned value from the getter.
type Resp<I, A, E, R> = readonly [
  ComputedRef<Res<A, E>>,
  WithAction<(I: I) => Effect<Exit<A, E>, never, R>>
]

type ActResp<A, E, R> = readonly [
  ComputedRef<Res<A, E>>,
  WithAction<() => Effect<Exit<A, E>, never, R>>
]

export const makeClient2 = <Locale extends string, R>(
  useIntl: MakeIntlReturn<Locale>["useIntl"],
  useToast: () => {
    error: (message: string) => void
    warning: (message: string) => void
    success: (message: string) => void
  },
  useSafeMutation: MakeMutation2,
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
      R,
      Args extends unknown[]
    >(
      f: (...args: Args) => Effect<A, E, R>,
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
        flow(
          f,
          Effect.exit,
          Effect.tap(
            Exit.matchEffect({
              onSuccess: (r) =>
                Effect.gen(function*() {
                  toast.success(
                    successMessage
                      + (S.is(OperationSuccess)(r) && r.message
                        ? "\n" + r.message
                        : "")
                  )
                }),
              onFailure: (err) =>
                Effect.gen(function*() {
                  if (Cause.isInterruptedOnly(err)) {
                    return
                  }

                  const fail = Cause.failureOption(err)
                  if (Option.isSome(fail)) {
                    if (fail.value._tag === "SuppressErrors") {
                      return Effect.succeed(void 0)
                    }

                    if (fail.value._tag === "OperationFailure") {
                      toast.warning(
                        warnMessage + fail.value.message
                          ? "\n" + fail.value.message
                          : ""
                      )
                      return
                    }

                    if (!options.suppressErrorToast) {
                      toast.error(`${errorMessage}:\n` + renderError(fail.value))
                    }

                    console.warn(fail, fail.toString())
                    return
                  }

                  const extra = {
                    action,
                    message: `Unexpected Error trying to ${action}`
                  }
                  Sentry.captureException(err, { extra })
                  console.error(err, extra)

                  toast.error(
                    intl.value.formatMessage(
                      { id: "handle.unexpected_error" },
                      {
                        action: message,
                        error: JSON.stringify(err, undefined, 2)
                      }
                    )
                  )
                })
            })
          )
        ),
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
   * Pass a function that returns an Effect, e.g from a client action, give it a name, and optionally pass an onOperationSuccess callback.
   * Returns a tuple with state ref and execution function which reports errors as Toast.
   */
  const useAndHandleMutation: {
    <I, E extends ResponseErrors, A, R, Request extends TaggedRequestClassAny>(
      self: RequestHandlerWithInput<I, A, E, R, Request>,
      action: string,
      options?: Opts<A>
    ): Resp<I, void, never, R>
    <E extends ResponseErrors, A, R, Request extends TaggedRequestClassAny>(
      self: RequestHandler<A, E, R, Request>,
      action: string,
      options?: Opts<A>
    ): ActResp<void, never, R>
  } = (self: any, action: any, options?: Opts<any>): any => {
    const handleRequestWithToast = useHandleRequestWithToast()
    const [a, b] = useSafeMutation(
      {
        ...self,
        handler: Effect.isEffect(self.handler)
          ? (pipe(
            Effect.annotateCurrentSpan({ action }),
            Effect.andThen(self.handler)
          ) as any)
          : (...args: any[]) =>
            pipe(
              Effect.annotateCurrentSpan({ action }),
              Effect.andThen(self.handler(...args))
            )
      },
      dropUndefinedT({
        queryInvalidation: options?.queryInvalidation
      })
    )

    return tuple(
      computed(() => mutationResultToVue(a.value)),
      handleRequestWithToast(b as any, action, options)
    )
  }

  function makeUseAndHandleMutation(
    defaultOptions?: Opts<any>
  ) {
    return ((self: any, action: any, options: any) => {
      return useAndHandleMutation(
        self,
        action,
        { ...defaultOptions, ...options }
      )
    }) as unknown as {
      <I, E extends ResponseErrors, A, R, Request extends TaggedRequestClassAny>(
        self: RequestHandlerWithInput<I, A, E, R, Request>,
        action: string,
        options?: Opts<A>
      ): Resp<I, A, E, R>
      <E extends ResponseErrors, A, Request extends TaggedRequestClassAny>(
        self: RequestHandler<A, E, R, Request>,
        action: string,
        options?: Opts<A>
      ): ActResp<A, E, R>
    }
  }

  const useSafeMutationWithState = <I, E, A, Request extends TaggedRequestClassAny>(
    self: RequestHandlerWithInput<I, A, E, R, Request>
  ) => {
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

export interface RequestHandler<A, E, R, Request extends TaggedRequestClassAny> {
  handler: Effect<A, E, R>
  name: string
  Request: Request
}

export interface RequestHandlerWithInput<I, A, E, R, Request extends TaggedRequestClassAny> {
  handler: (i: I) => Effect<A, E, R>
  name: string
  Request: Request
}
