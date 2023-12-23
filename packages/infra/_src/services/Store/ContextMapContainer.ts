import { ContextMap, makeContextMap } from "./service.js"

// TODO: we have to create a new contextmap on every request.
// we want to share one map during startup
// but we want to make sure we don't re-use the startup map after startup
// we can call another start after startup. but it would be even better if we could Die on accessing rootmap
// we could also make the ContextMap optional, and when missing, issue a warning instead?

/**
 * @tsplus companion ContextMapContainer.Ops
 */
export class ContextMapContainer extends TagClass<ContextMapContainer, {
  get: Effect<never, never, ContextMap>
  start: Effect<never, never, void>
}>() {
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

/**
 * @tsplus static ContextMapContainer.Ops live
 */
export const live = Effect
  .sync(() => makeContextMap())
  .andThen(FiberRef.make<ContextMap>)
  .map((ref) => new ContextMapContainer({ get: ref.get, start: ContextMap.Make.flatMap((_) => ref.set(_)) }))
  .toLayerScoped(ContextMapContainer)

/** @tsplus static ContextMap.Ops Tag */
export const RCTag = Tag<ContextMap>()
