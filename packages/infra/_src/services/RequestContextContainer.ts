import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus type RequestContextContainer
 * @tsplus companion RequestContextContainer.Ops
 */
export abstract class RequestContextContainer extends TagClass<RequestContextContainer>() {
  abstract readonly requestContext: Effect<never, never, RequestContext>
  abstract readonly update: (f: (rc: RequestContext) => RequestContext) => Effect<never, never, RequestContext>
  abstract readonly start: (f: RequestContext) => Effect<never, never, void>
  static get get(): Effect<RequestContextContainer, never, RequestContext> {
    return RequestContextContainer.flatMap((_) => _.requestContext)
  }
  static get getOption() {
    return Effect
      .contextWith((_: Context<never>) => Context.getOption(_, RequestContextContainer))
      .flatMap((requestContext) =>
        requestContext.isSome()
          ? requestContext.value.requestContext.map(Option.some)
          : Effect(Option.none)
      )
  }
}

export class RequestContextContainerImpl extends RequestContextContainer {
  #ref: FiberRef<RequestContext>
  constructor() {
    super()
    this.#ref = FiberRef.unsafeMake<RequestContext>(
      new RequestContext({ name: ReasonableString("_root_"), rootId: RequestId("_root_"), locale: "en" })
    )
  }

  override get requestContext() {
    return this.#ref.get
  }

  override update = (f: (a: RequestContext) => RequestContext) =>
    this.#ref.getAndUpdate(f).tap((rc) => Effect.annotateCurrentSpan(rc.spanAttributes))
  override start = (a: RequestContext) => this.#ref.set(a) > a.restoreStoreId
}

/**
 * @tsplus static RequestContextContainer.Ops live
 */
export const live = Effect.sync(() => new RequestContextContainerImpl()).toLayer(RequestContextContainer)

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = Tag<RequestContext>()

/**
 * @tsplus getter RequestContext spanAttributes
 */
export const spanAttributes = (ctx: RequestContext) => ({
  "request.id": ctx.id,
  "request.name": ctx.name,
  "request.locale": ctx.locale,
  "request.namespace": ctx.namespace,
  ...ctx.userProfile?.sub
    ? {
      "request.user.sub": ctx
        .userProfile
        .sub,
      "request.user.roles": "roles" in ctx
          .userProfile
        ? ctx.userProfile.roles
        : undefined
    }
    : {}
})
