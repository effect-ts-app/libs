import { S } from "@effect-app/prelude"
import { RequestId, UserProfileId } from "@effect-app/prelude/ids"

@useClassFeaturesForSchema
export class RequestContextParent extends TaggedClass<
  RequestContextParent
>()("RequestContext", {
  id: RequestId,
  name: NonEmptyString255,
  userProfile: struct({ sub: UserProfileId }).optional(),
  locale: literal("en", "de"),
  createdAt: S.Date.withDefaultMake(() => new Date()) // TODO
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
@useClassFeaturesForSchema
export class RequestContext extends S.TaggedClass<
  RequestContext
>()("RequestContext", {
  ...RequestContextParent.fields.$$.omit("id"),
  id: RequestId.withDefault(),
  rootId: RequestId,
  parent: RequestContextParent.optional(),
  namespace: NonEmptyString255.optional()
  // ...RequestContextParent.omit("id").extend({
  //   id: RequestId.withDefault(),
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
export namespace RequestContextParent {
  /**
   * @tsplus type RequestContextParent.From
   * @tsplus companion RequestContextParent.From/Ops
   */
  export class From extends FromClass<typeof RequestContextParent>() {}
}
export namespace RequestContext {
  /**
   * @tsplus type RequestContext.From
   * @tsplus companion RequestContext.From/Ops
   */
  export class From extends FromClass<typeof RequestContext>() {}
}
/* eslint-enable */
//
// codegen:end
//
