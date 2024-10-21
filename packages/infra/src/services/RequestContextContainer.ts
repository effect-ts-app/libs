import { NonEmptyString255 } from "@effect-app/schema"
import { Context, Effect, FiberRef, Layer, Option } from "effect-app"
import { LocaleRef, RequestContext } from "../RequestContext.js"
import { storeId } from "./Store/Memory.js"

/**
 * @tsplus type RequestContextContainer
 * @tsplus companion RequestContextContainer.Ops
 */
export abstract class RequestContextContainer
  extends Context.TagId("effect-app/RequestContextContainer")<RequestContextContainer, {
    requestContext: Effect<RequestContext>
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
    .sync(() =>
      RequestContextContainer.of({
        requestContext: Effect
          .all({
            span: Effect.currentSpan.pipe(Effect.orDie),
            locale: FiberRef.get(LocaleRef),
            namespace: FiberRef.get(storeId)
          })
          .pipe(
            Effect.map(({ locale, namespace, span }) =>
              new RequestContext({
                span,
                locale,
                namespace,
                // TODO: get through span context, or don't care at all.
                name: NonEmptyString255("_root_")
              })
            )
          )
      })
    )
    .pipe(
      Layer.effect(this)
    )
}

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = Context.GenericTag<RequestContext>("@services/RCTag")
