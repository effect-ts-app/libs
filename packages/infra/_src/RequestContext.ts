import { Schema2 } from "@effect-app/prelude"
import { RequestId, UserProfileId } from "@effect-app/prelude/ids"
import { Class, FromClass, literal, useClassFeaturesForSchema } from "@effect-app/schema2"

@useClassFeaturesForSchema
export class RequestContextParent extends Class<
  RequestContextParent
>()({
  _tag: literal("RequestContext"),
  id: RequestId,
  name: NonEmptyString255,
  userProfile: struct({ sub: UserProfileId }).optional(),
  locale: literal("en", "de"),
  createdAt: Schema2.Date.withDefault()
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
@useClassFeaturesForSchema
export class RequestContext extends Schema2.Class<
  RequestContext
>()({
  ...RequestContextParent.omit("id"),
  id: RequestId.withDefault(),
  rootId: RequestId,
  parent: RequestContextParent.optional(),
  namespace: NonEmptyString255.optional()
}) {
  static inherit(
    this: void,
    parent: RequestContext,
    newSelf: RequestContextParent.ConstructorInput
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
