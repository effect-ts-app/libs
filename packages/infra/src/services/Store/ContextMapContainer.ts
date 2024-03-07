import { Context, Effect, FiberRef, Layer, Option } from "effect-app"
import { TagClassId } from "effect-app/service"
import { ContextMap } from "./service.js"

// TODO: we have to create a new contextmap on every request.
// we want to share one map during startup
// but we want to make sure we don't re-use the startup map after startup
// we can call another start after startup. but it would be even better if we could Die on accessing rootmap
// we could also make the ContextMap optional, and when missing, issue a warning instead?

/**
 * @tsplus companion ContextMapContainer.Ops
 */
export abstract class ContextMapContainer extends TagClassId("effect-app/ContextMapContainer")<ContextMapContainer, {
  get: Effect<ContextMap>
  start: Effect<void>
}>() {
  static get getOption() {
    return Effect.flatMap(
      Effect
        .contextWith((_: Context<never>) => Context.getOption(_, ContextMapContainer)),
      (ctx) =>
        Option.isSome(ctx)
          ? Effect.map(ctx.value.get, Option.some)
          : Effect.sync(() => Option.none())
    )
  }

  static readonly live = Effect
    .flatMap(
      ContextMap.make,
      FiberRef.make<ContextMap>
    )
    .pipe(
      Effect
        .map((ref) =>
          ContextMapContainer.of({
            get: FiberRef.get(ref),
            start: Effect.flatMap(ContextMap.make, (_) => FiberRef.set(ref, _))
          })
        ),
      Layer.scoped(this)
    )
}

/** @tsplus static ContextMap.Ops Tag */
export const RCTag = Context.GenericTag<ContextMap>("@services/RCTag")
