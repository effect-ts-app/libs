import { NonEmptyString255 } from "@effect-app/schema"
import { Context, Effect, FiberRef, Layer, Option } from "effect-app"
import { RequestId } from "effect-app/ids"
import { RequestContext, spanAttributes } from "../RequestContext.js"
import { restoreFromRequestContext } from "./Store/Memory.js"

/**
 * @tsplus type RequestContextContainer
 * @tsplus companion RequestContextContainer.Ops
 */
export abstract class RequestContextContainer
  extends Context.TagId("effect-app/RequestContextContainer")<RequestContextContainer, {
    // TODO: must flow from current span/info
    requestContext: Effect<RequestContext>
    update: (f: (rc: RequestContext) => RequestContext) => Effect<RequestContext>
    start: (f: RequestContext) => Effect<void>
  }>()
{
  static get get(): Effect<RequestContext, never, RequestContextContainer> {
    return Effect.flatMap(RequestContextContainer, (_) => _.requestContext)
  }
  static get getOption() {
    return Effect.flatMap(
      Effect
        .contextWith((_: Context<never>) => Context.getOption(_, RequestContextContainer)),
      (requestContext) =>
        Option.isSome(requestContext)
          ? Effect.map(requestContext.value.requestContext, Option.some)
          : Effect.sync(() => Option.none())
    )
  }
  static readonly live = Effect
    .andThen(
      Effect
        .sync(() =>
          new RequestContext({ name: NonEmptyString255("_root_"))
        ),
      FiberRef.make<RequestContext>
    )
    .pipe(
      Effect.map((ref) =>
        RequestContextContainer.of({
          requestContext: FiberRef.get(ref),
          update: (f: (a: RequestContext) => RequestContext) =>
            Effect.tap(FiberRef.updateAndGet(ref, f), (rc) => Effect.annotateCurrentSpan(spanAttributes(rc))),
          start: (a: RequestContext) => Effect.zipRight(FiberRef.set(ref, a), restoreFromRequestContext(a))
        })
      ),
      Layer.scoped(this)
    )
}

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = Context.GenericTag<RequestContext>("@services/RCTag")
