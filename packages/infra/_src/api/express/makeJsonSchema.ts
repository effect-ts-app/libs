/* eslint-disable @typescript-eslint/no-explicit-any */

import { InvalidStateError } from "../../errors.js"
import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends ReadonlyArray<infer A> ? A : never

export function checkDuplicatePaths<T extends { path: string; method: string }>(
  paths: readonly T[]
): Effect<never, InvalidStateError, readonly T[]> {
  const methods = Symbol("methods")
  const params = Symbol("params")
  const subpaths = Symbol("subpaths")

  interface PathMethods {
    [methods]: string[]
    [params]: { [key: number]: PathMethods | undefined }
    [subpaths]: { [key: string]: PathMethods | undefined }
  }
  const pathMethods: PathMethods = { [methods]: [], [params]: {}, [subpaths]: {} }
  const regex = /(?:^|\/)([^/:\n]+)|:(\w+)/g

  for (const path of paths) {
    const matches = [...path.path.matchAll(regex)]
      .map((match) =>
        match[1]
          ? { _tag: "resource", value: match[1] } as const
          : { _tag: "param", value: match[2]! } as const
      )

    let pathNavigator = pathMethods
    for (let i = 0; i < matches.length;) {
      const match = matches[i]!

      switch (match._tag) {
        case "resource": {
          if (!(match.value in pathNavigator[subpaths])) {
            pathNavigator[subpaths][match.value] = { [methods]: [], [params]: {}, [subpaths]: {} }
          }
          pathNavigator = pathNavigator[subpaths][match.value]!
          i++
          break
        }
        case "param": {
          let numberOfParams = 1
          while (i < matches.length && matches[i + 1]?._tag === "param") {
            numberOfParams++
            i++
          }

          if (!(numberOfParams in pathNavigator[params])) {
            pathNavigator[params][numberOfParams] = { [methods]: [], [params]: {}, [subpaths]: {} }
          }
          pathNavigator = pathNavigator[params][numberOfParams]!
          i++
          break
        }
      }
    }

    if (pathNavigator[methods].includes(path.method)) {
      // throw duplicate path-method error
      return Effect.fail(new InvalidStateError(`Duplicate method ${path.method} for path ${path.path}`))
    }
    pathNavigator[methods].push(path.method)
  }

  return Effect.succeed(paths)
}

/**
 * Work in progress JSONSchema generator.
 */
export function makeJsonSchema(r: Iterable<RS.RouteDescriptorAny>) {
  return Chunk
    .fromIterable(r)
    .forEachEffect(RS.makeFromSchema)
    .flatMap(checkDuplicatePaths)
    .map((e) => {
      const map = ({ method, path, responses, ...rest }: _A<typeof e>) => ({
        [method]: {
          ...rest,
          responses: (responses as Array<any>).reduce(
            (prev, cur) => {
              prev[cur.statusCode] = cur.type
              return prev
            },
            {} as Record<Response["statusCode"], Response["type"]>
          )
        }
      })
      return e.reduce(
        (prev, e) => {
          const path = e.path.split("?")[0].replace(rx, (_a, b) => `{${b}}`)
          prev[path] = {
            ...prev[path],
            ...map(e) as any
          }
          return prev
        },
        {} as Record<string, Record<Methods, ReturnType<typeof map>>>
      )
    })
}

class Response {
  constructor(
    public readonly statusCode: number,
    public readonly type: any // string | JSONSchema | SubSchema
  ) {}
}
