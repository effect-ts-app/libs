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

const make = Effect.sync(() => {
  const fiberRef = FiberRef.unsafeMake<RequestContext>(
    new RequestContext({ name: ReasonableString("root"), locale: "en", rootId: StringId("root-id") })
  )

  const fork = (pars: RequestContext) => Effect.suspendSucceed(() => fiberRef.set(pars))

  return {
    fork,
    get: fiberRef.get
  }
})

export interface RequestContextSvc extends Effect.Success<typeof make> {}

/**
 * @tsplus static RequestContext.Ops Tag
 */
export const tag = Tag<RequestContextSvc>()

/**
 * @tsplus static RequestContext.Ops ForkTag
 */
export const tag2 = Tag<never>()

/**
 * @tsplus static RequestContext.Ops LiveFork
 */
export const LiveRequestContextFork = (pars: RequestContext) =>
  Layer.fromEffect(tag2)(tag.get.flatMap(_ => _.fork(pars).map(_ => _ as never)))

/**
 * @tsplus static RequestContext.Ops get
 */
export const get = tag.withEffect(_ => _.get)

/**
 * @tsplus static RequestContext.Ops with
 */
export const with_ = <B>(f: (ctx: RequestContext) => B) => tag.withEffect(_ => _.get).map(f)

/**
 * @tsplus static RequestContext.Ops withEffect
 */
export const withEffect = <R, E, B>(f: (ctx: RequestContext) => Effect<R, E, B>) =>
  tag.withEffect(_ => _.get).flatMap(f)

/**
 * @tsplus static RequestContext.Ops Live
 */
export const LiveRequestContext = Layer.fromEffect(tag)(make)

/* eslint-disable */
export interface RequestContextParent {
  readonly createdAt: Date
  readonly id: RequestId
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
  readonly id: RequestId
  readonly locale: "de" | "en"
  readonly name: ReasonableString
  readonly parent?: RequestContextParent | undefined
  readonly rootId: RequestId
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
