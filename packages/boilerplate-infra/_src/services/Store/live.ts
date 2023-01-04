import { ContextMap } from "./service.js"

const makeMap = Effect.sync(() => {
  const fiberRef = FiberRef.unsafeMake<ROMap<string, string>>(ROMap.make([]))

  const getEtag = (id: string) => fiberRef.get.map(etags => etags.get(id))
  const setEtag = (id: string, eTag: string | undefined) =>
    fiberRef.get
      .flatMap(etags => fiberRef.set(eTag === undefined ? ROMap.remove_(etags, id) : ROMap.insert_(etags, id, eTag)))

  // const parsedCache = ROMap.make<
  //   Parser<any, any, any>,
  //   Map<unknown, These.These<unknown, unknown>>
  // >([])["|>"](ROMap.toMutable)

  // const parserCache = ROMap.make<
  //   Parser<any, any, any>,
  //   (i: any) => These.These<any, any>
  // >([])["|>"](ROMap.toMutable)

  // const setAndReturn = <I, E, A>(
  //   p: Parser<I, E, A>,
  //   np: (i: I) => These.These<E, A>
  // ) => {
  //   parserCache.set(p, np)
  //   return np
  // }

  // const parserEnv: ParserEnv = {
  //   // TODO: lax: true would turn off refinement checks, may help on large payloads
  //   // but of course removes confirming of validation rules (which may be okay for a database owned by the app, as we write safely)
  //   lax: false,
  //   cache: {
  //     getOrSetParser: p => parserCache.get(p) ?? setAndReturn(p, i => parserEnv.cache!.getOrSet(i, p)),
  //     getOrSetParsers: parsers => {
  //       return Object.entries(parsers).reduce((prev, [k, v]) => {
  //         prev[k] = parserEnv.cache!.getOrSetParser(v)
  //         return prev
  //       }, {} as any)
  //     },
  //     getOrSet: (i, parse): any => {
  //       const c = parsedCache.get(parse)
  //       if (c) {
  //         const f = c.get(i)
  //         if (f) {
  //           // console.log("$$$ cache hit", i)
  //           return f
  //         } else {
  //           const nf = parse(i, parserEnv)
  //           c.set(i, nf)
  //           return nf
  //         }
  //       } else {
  //         const nf = parse(i, parserEnv)
  //         parsedCache.set(parse, ROMap.make([[i, nf]])["|>"](ROMap.toMutable))
  //         return nf
  //       }
  //     }
  //   }
  // }

  const fork = Effect.suspendSucceed(() => fiberRef.set(ROMap.make([])))

  return {
    fork,
    get: getEtag,
    set: setEtag
    // parserEnv
  }
})

/**
 * @tsplus static ContextMap.Ops Live
 */
export const LiveContextMap = Layer.fromEffect(ContextMap)(makeMap)

const ContextMapForkTag = Tag<never>()

/**
 * @tsplus static ContextMap.Ops LiveFork
 */
export const LiveContextFork = Layer.fromEffect(ContextMapForkTag)(
  ContextMap.withEffect(_ => _.fork.map(_ => _ as never))
)
