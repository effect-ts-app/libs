export const RequestId = LongString
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
  locale: prop(literal("en", "de")),
  createdAt: defaultProp(date)
}) {}
/** @ignore @internal @deprecated */
export type RequestContextParentConstructor = typeof RequestContextParent

export function makeRequestId() {
  return RequestId(StringId.make())
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
  parent: optProp(RequestContextParent)
}) {
  static inherit(
    this: void,
    parent: RequestContext,
    newSelf: RequestContextParent.ConstructorInput
  ) {
    return new RequestContext({
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

/**
 * @tsplus static RequestContext.Ops Live
 */
export const LiveRequestContext = (pars: RequestContext) => Layer.fromValue(tag, pars)

/* eslint-disable */
export interface RequestContextParent {
  readonly createdAt: Date
  readonly id: LongString
  readonly locale: "de" | "en"
  readonly name: ReasonableString
}
export namespace RequestContextParent {
  /**
   * @tsplus type RequestContextParent.Encoded
   */
  export interface Encoded {
    readonly createdAt: string
    readonly id: string
    readonly locale: "de" | "en"
    readonly name: string
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type RequestContextParent.Encoded.Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type RequestContextParent.Encoded.Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof RequestContextParent> {}
  export interface Props extends GetProvidedProps<typeof RequestContextParent> {}
}
export interface RequestContext {
  readonly createdAt: Date
  readonly id: LongString
  readonly locale: "de" | "en"
  readonly name: ReasonableString
  readonly parent?: RequestContextParent | undefined
  readonly rootId: LongString
}
export namespace RequestContext {
  /**
   * @tsplus type RequestContext.Encoded
   */
  export interface Encoded {
    readonly createdAt: string
    readonly id: string
    readonly locale: "de" | "en"
    readonly name: string
    readonly parent?: RequestContextParent.Encoded | undefined
    readonly rootId: string
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type RequestContext.Encoded.Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type RequestContext.Encoded.Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof RequestContext> {}
  export interface Props extends GetProvidedProps<typeof RequestContext> {}
}
/* eslint-enable */
