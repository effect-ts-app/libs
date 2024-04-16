import { ExtendedTaggedClass, NonEmptyString255 } from "@effect-app/schema"
import { S } from "effect-app"
import { RequestId, UserProfileId } from "effect-app/ids"

export class RequestContextParent extends ExtendedTaggedClass<
  RequestContextParent,
  RequestContextParent.From
>()("RequestContext", {
  id: RequestId,
  name: NonEmptyString255,
  userProfile: S.optional(S.Struct({ sub: UserProfileId })),
  locale: S.Literal("en", "de"),
  createdAt: S.Date.withDefault
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
export class RequestContext extends ExtendedTaggedClass<
  RequestContext,
  RequestContext.From
>()("RequestContext", {
  ...RequestContextParent.omit("_tag", "id"),
  id: RequestId.withDefault,
  rootId: RequestId,
  sourceId: S.optional(NonEmptyString255),
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

export const spanAttributes = (ctx: RequestContext) => ({
  "request.id": ctx.id,
  "request.root.id": ctx.rootId,
  "request.name": ctx.name,
  "request.locale": ctx.locale,
  "request.namespace": ctx.namespace,
  ...ctx.sourceId ? { "request.source.id": ctx.sourceId } : {},
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

// codegen:start {preset: model}
//
/* eslint-disable */
export namespace RequestContextParent {
  export interface From extends S.Struct.Encoded<typeof RequestContextParent["fields"]> {}
}
export namespace RequestContext {
  export interface From extends S.Struct.Encoded<typeof RequestContext["fields"]> {}
}
/* eslint-enable */
//
// codegen:end
//
