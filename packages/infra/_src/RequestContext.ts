import { RequestId, UserProfileId } from "@effect-app/prelude/ids"

@useClassFeaturesForSchema
export class RequestContextParent extends ExtendedClass<
  RequestContextParent,
  RequestContextParent.ConstructorInput,
  RequestContextParent.From,
  RequestContextParent.Fields
>()({
  _tag: literal("RequestContext"),
  id: RequestId,
  name: ReasonableString,
  userProfile: struct({ sub: UserProfileId }).optional,
  locale: literal("en", "de"),
  createdAt: date.withDefault
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
@useClassFeaturesForSchema
export class RequestContext extends ExtendedClass<
  RequestContext,
  RequestContext.ConstructorInput,
  RequestContext.From,
  RequestContext.Fields
>()({
  ...RequestContextParent.omit("id"),
  id: RequestId.withDefault,
  rootId: RequestId,
  parent: RequestContextParent.optional,
  namespace: ReasonableString.optional
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
  export interface ConstructorInput
    extends ConstructorInputApi<typeof RequestContextParent> {}
  export interface Fields extends FieldsClass<typeof RequestContextParent> {}
}
export namespace RequestContext {
  /**
   * @tsplus type RequestContext.From
   * @tsplus companion RequestContext.From/Ops
   */
  export class From extends FromClass<typeof RequestContext>() {}
  export interface ConstructorInput
    extends ConstructorInputApi<typeof RequestContext> {}
  export interface Fields extends FieldsClass<typeof RequestContext> {}
}
/* eslint-enable */
//
// codegen:end
//
