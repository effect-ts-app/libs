import { RequestId } from "effect-app/ids"
import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus type RequestContextContainer
 * @tsplus companion RequestContextContainer.Ops
 */
export class RequestContextContainer extends TagClassId("effect-app/RequestContextContainer")<RequestContextContainer, {
  requestContext: Effect<RequestContext>
  update: (f: (rc: RequestContext) => RequestContext) => Effect<RequestContext>
  start: (f: RequestContext) => Effect<void>
}>() {
  static get get(): Effect<RequestContext, never, RequestContextContainer> {
    return RequestContextContainer.flatMap((_) => _.requestContext)
  }
  static get getOption() {
    return Effect
      .contextWith((_: Context<never>) => Context.getOption(_, RequestContextContainer))
      .flatMap((requestContext) =>
        requestContext.isSome()
          ? requestContext.value.requestContext.map(Option.some)
          : Effect.sync(() => Option.none())
      )
  }
  static readonly live = Effect
    .sync(() => new RequestContext({ name: NonEmptyString255("_root_"), rootId: RequestId("_root_"), locale: "en" }))
    .andThen(FiberRef.make<RequestContext>)
    .map((ref) =>
      new RequestContextContainer({
        requestContext: ref.get,
        update: (f: (a: RequestContext) => RequestContext) =>
          ref.getAndUpdate(f).tap((rc) => Effect.annotateCurrentSpan(rc.spanAttributes)),
        start: (a: RequestContext) => ref.set(a).andThen(a.restoreStoreId)
      })
    )
    .toLayerScoped(this)
}

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = GenericTag<RequestContext>("@services/RCTag")

/**
 * @tsplus getter RequestContext spanAttributes
 */
export const spanAttributes = (ctx: RequestContext) => ({
  "request.id": ctx.id,
  "request.name": ctx.name,
  "request.locale": ctx.locale,
  "request.namespace": ctx.namespace,
  ...(ctx.userProfile?.sub
    ? {
      "request.user.sub": ctx
        .userProfile
        .sub,
      "request.user.roles": "roles" in ctx
          .userProfile
        ? ctx.userProfile.roles
        : undefined
    }
    : {})
})
