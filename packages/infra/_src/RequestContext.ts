import { brandedStringId, type StringIdBrand } from "@effect-app/prelude/schema"

export interface RequestIdBrand extends StringIdBrand {
  readonly RequestId: unique symbol
}
/**
 * @tsplus type RequestId
 */
export type RequestId = StringId & RequestIdBrand
export const RequestId = brandedStringId<RequestId>()

export interface UserProfileIdBrand extends StringIdBrand {
  readonly UserProfileId: unique symbol
}
/**
 * @tsplus type UserProfileId
 */
export type UserProfileId = StringId & UserProfileIdBrand
export const UserProfileId = brandedStringId<UserProfileId>()

@useClassFeaturesForSchema
export class RequestContextParent extends MNModel<
  RequestContextParent,
  RequestContextParent.ConstructorInput,
  RequestContextParent.Encoded,
  RequestContextParent.Props
>()({
  _tag: literal("RequestContext"),
  id: RequestId,
  name: ReasonableString,
  userProfile: props({ sub: prop(UserProfileId) }).optional,
  locale: literal("en", "de"),
  createdAt: date.withDefault
}) {}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
@useClassFeaturesForSchema
export class RequestContext extends MNModel<
  RequestContext,
  RequestContext.ConstructorInput,
  RequestContext.Encoded,
  RequestContext.Props
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
   * @tsplus type RequestContextParent.Encoded
   * @tsplus companion RequestContextParent.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof RequestContextParent>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof RequestContextParent> {}
  export interface Props extends GetProvidedProps<typeof RequestContextParent> {}
}
export namespace RequestContext {
  /**
   * @tsplus type RequestContext.Encoded
   * @tsplus companion RequestContext.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof RequestContext>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof RequestContext> {}
  export interface Props extends GetProvidedProps<typeof RequestContext> {}
}
/* eslint-enable */
//
// codegen:end
//
