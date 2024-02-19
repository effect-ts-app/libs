import { ContextMap } from "./service.js"

// TODO: we have to create a new contextmap on every request.
// we want to share one map during startup
// but we want to make sure we don't re-use the startup map after startup
// we can call another start after startup. but it would be even better if we could Die on accessing rootmap
// we could also make the ContextMap optional, and when missing, issue a warning instead?

/**
 * @tsplus companion ContextMapContainer.Ops
 */
export class ContextMapContainer extends TagClassId("effect-app/ContextMapContainer")<ContextMapContainer, {
  get: Effect<ContextMap>
  start: Effect<void>
}>() {
  static get get(): Effect<ContextMap, never, ContextMapContainer> {
    return ContextMapContainer.flatMap((_) => _.get)
  }
  static get getOption() {
    return Effect
      .contextWith((_: Context<never>) => Context.getOption(_, ContextMapContainer))
      .flatMap((ctx) =>
        ctx.isSome()
          ? ctx.value.get.map(Option.some)
          : Effect.sync(() => Option.none())
      )
  }

  static readonly live = ContextMap
    .make
    .flatMap(FiberRef.make<ContextMap>)
    .map((ref) => new ContextMapContainer({ get: ref.get, start: ContextMap.make.flatMap((_) => ref.set(_)) }))
    .toLayerScoped(this)
}

/** @tsplus static ContextMap.Ops Tag */
export const RCTag = GenericTag<ContextMap>("@services/RCTag")
