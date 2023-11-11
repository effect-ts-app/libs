import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"

export interface RequestContextContainerId {
  readonly _: unique symbol
}

/**
 * @tsplus companion RequestContextContainer.Ops
 */
export abstract class RequestContextContainer extends TagClass<RequestContextContainerId, RequestContextContainer>() {
  abstract readonly requestContext: Effect<never, never, RequestContext>
  abstract readonly update: (f: (rc: RequestContext) => RequestContext) => Effect<never, never, RequestContext>
  abstract readonly start: (f: RequestContext) => Effect<never, never, void>
  static get get(): Effect<RequestContextContainerId, never, RequestContext> {
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

  override update = (f: (a: RequestContext) => RequestContext) => this.#ref.getAndUpdate(f)
  override start = (a: RequestContext) => this.#ref.set(a)
}

/**
 * @tsplus static RequestContextContainer.Ops live
 */
export const live = Effect.sync(() => new RequestContextContainerImpl()).toLayer(RequestContextContainer)

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = Tag<RequestContext>()
