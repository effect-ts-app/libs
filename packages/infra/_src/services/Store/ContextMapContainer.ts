import { ContextMap, makeContextMap } from "./service.js"

/**
 * @tsplus companion ContextMapContainer.Ops
 */
export abstract class ContextMapContainer extends TagClass<ContextMapContainer>() {
  abstract readonly get: Effect<never, never, ContextMap>
  abstract readonly start: Effect<never, never, void>
  static get get(): Effect<ContextMapContainer, never, ContextMap> {
    return ContextMapContainer.flatMap((_) => _.get)
  }
  static get getOption() {
    return Effect
      .contextWith((_: Context<never>) => Context.getOption(_, ContextMapContainer))
      .flatMap((ctx) =>
        ctx.isSome()
          ? ctx.value.get.map(Option.some)
          : Effect(Option.none)
      )
  }
}

export class ContextMapContainerImpl extends ContextMapContainer {
  #ref: FiberRef<ContextMap>
  constructor() {
    super()
    this.#ref = FiberRef.unsafeMake<ContextMap>(makeContextMap())
  }

  override get get() {
    return this.#ref.get
  }

  override start = ContextMap.Make.flatMap((_) => this.#ref.set(_))
}

/**
 * @tsplus static ContextMapContainer.Ops live
 */
export const live = Effect.sync(() => new ContextMapContainerImpl()).toLayer(ContextMapContainer)

/** @tsplus static ContextMap.Ops Tag */
export const RCTag = Tag<ContextMap>()
