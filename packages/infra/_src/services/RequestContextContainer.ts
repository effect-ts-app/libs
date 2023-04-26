import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus companion RequestContextContainer.Ops
 */
export abstract class RequestContextContainer extends TagClass<RequestContextContainer>() {
  abstract readonly requestContext: Effect<never, never, RequestContext>
  abstract readonly update: (f: (rc: RequestContext) => RequestContext) => Effect<never, never, void>
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
  #ref: Ref<RequestContext>
  constructor(inp: RequestContext.ConstructorInput) {
    super()
    this.#ref = Ref.unsafeMake<RequestContext>(new RequestContext(inp))
  }

  override get requestContext() {
    return this.#ref.get
  }

  override update = (f: (a: RequestContext) => RequestContext) => this.#ref.getAndUpdate(f)
}

/**
 * @tsplus static RequestContextContainer.Ops live
 */
export function live(inp: RequestContext.ConstructorInput) {
  return new RequestContextContainerImpl(inp)
}

/** @tsplus static RequestContext.Ops Tag */
export const RCTag = Tag<RequestContext>()
