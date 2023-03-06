export const RequestId = StringId
export type RequestId = ParsedShapeOfCustom<typeof RequestId>

export class RequestContextParent extends MNModel<
  RequestContextParent,
  RequestContextParent.ConstructorInput,
  RequestContextParent.Encoded,
  RequestContextParent.Props
>()({
  _tag: prop(literal("RequestContext")),
  id: prop(RequestId),
  name: prop(ReasonableString),
  userId: optProp(ReasonableString),
  locale: prop(literal("en", "de")),
  createdAt: defaultProp(date)
}) {}
/** @ignore @internal @deprecated */
export type RequestContextParentConstructor = typeof RequestContextParent

export function makeRequestId() {
  return RequestId.make()
}

/**
 * @tsplus type RequestContext
 * @tsplus companion RequestContext.Ops
 */
export class RequestContext extends MNModel<
  RequestContext,
  RequestContext.ConstructorInput,
  RequestContext.Encoded,
  RequestContext.Props
>()({
  ...RequestContextParent.omit("id"),
  id: defaultProp(RequestId, makeRequestId),
  rootId: prop(RequestId),
  parent: optProp(RequestContextParent),
  namespace: optProp(ReasonableString)
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

/** @ignore @internal @deprecated */
export type RequestContextConstructor = typeof RequestContext

/**
 * @tsplus static RequestContext.Ops Tag
 */
export const tag = Tag<RequestContext>()

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
