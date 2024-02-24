import { literal, NonEmptyString255, struct, TaggedClass } from "@effect-app/schema"
import { S } from "effect-app"
import { RequestId, UserProfileId } from "effect-app/ids"

export class RequestContextParent extends TaggedClass<
  RequestContextParent
>()("RequestContext", {
  id: RequestId,
  name: NonEmptyString255,
  userProfile: S.optional(struct({ sub: UserProfileId })),
  locale: literal("en", "de"),
  createdAt: S.Date.withDefault
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
export class RequestContext extends TaggedClass<
  RequestContext
>()("RequestContext", {
  ...RequestContextParent.omit("id"),
  id: RequestId.withDefault,
  rootId: RequestId,
  parent: S.optional(RequestContextParent),
  namespace: S.optional(NonEmptyString255)
  // ...RequestContextParent.omit("id").extend({
  //   id: RequestId.withDefault,
  //   rootId: RequestId,
  //   parent: RequestContextParent.optional(),
  //   namespace: NonEmptyString255.optional()
  // })
}) {
  // static Tag = Context.Tag<RequestContext>()
  static inherit(
    this: void,
    parent: RequestContext,
    newSelf: ConstructorParameters<typeof RequestContextParent>[0]
  ) {
    return new RequestContext({
      namespace: parent?.namespace,
      ...newSelf,
      rootId: parent.rootId,
      parent
    })
  }

  static toMonitoring(this: void, self: RequestContext) {
    return {
      operationName: self.name,
      locale: self.locale,
      ...(self.parent
        ? { parentOperationName: self.parent.name, parentLocale: self.parent.locale }
        : {})
    }
  }
}

// codegen:start {preset: model}
//
/* eslint-disable */
/* eslint-enable */
//
// codegen:end
//
