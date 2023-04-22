import type {} from "@effect-app/prelude/_global.ext"

export const RequestId = StringId
export type RequestId = ParsedShapeOfCustom<typeof RequestId>

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
  user: props({ id: prop(StringId) }).optional,
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
