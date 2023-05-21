/* eslint-disable @typescript-eslint/no-explicit-any */

import { InvalidStateError } from "../../errors.js"
import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends ReadonlyArray<infer A> ? A : never

export function checkPaths<T extends { path: string; method: string }>(
  paths: readonly T[]
): Effect<never, InvalidStateError, readonly T[]> {
  const methods_s = Symbol("methods")
  const params_s = Symbol("params")
  const subpaths_s = Symbol("subpaths")
  const path_s = Symbol("path")

  interface PathMethods {
    [methods_s]: string[]
    [params_s]: { [key: number]: PathMethods | undefined }
    [subpaths_s]: { [key: string]: PathMethods | undefined }
    [path_s]: string
  }
  const pathMethods: PathMethods = { [methods_s]: [], [params_s]: {}, [subpaths_s]: {}, [path_s]: "/" }
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
          // check shadowing: if 'a/:param' comes before 'a/b', then 'a/b' is shadowed
          if (pathNavigator[params_s][1]) {
            return Effect.fail(
              new InvalidStateError(
                `Path ${pathNavigator[path_s]}${match.value}/ is shadowed by ${pathNavigator[params_s][1][path_s]}`
              )
            )
          }

          if (!(match.value in pathNavigator[subpaths_s])) {
            pathNavigator[subpaths_s][match.value] = {
              [methods_s]: [],
              [params_s]: {},
              [subpaths_s]: {},
              [path_s]: `${pathNavigator[path_s]}${match.value}/`
            }
          }

          pathNavigator = pathNavigator[subpaths_s][match.value]!
          i++
          break
        }
        case "param": {
          // check shadowing: if 'a/b' comes before 'a/:param', then 'a/"param' is partially shadowed
          const subpaths = Object.getOwnPropertyNames(pathNavigator[subpaths_s])
          if (subpaths.length > 0) {
            subpaths.forEach((s) =>
              Effect.logWarning(`Path ${path.path} is partially shadowed by ${pathNavigator[subpaths_s][s]![path_s]}`)
            )
          }

          const paramsNames = [match.value]
          let numberOfParams = 1
          while (i < matches.length && matches[i + 1]?._tag === "param") {
            numberOfParams++
            i++
            paramsNames.push(matches[i]!.value)
          }

          if (!(numberOfParams in pathNavigator[params_s])) {
            pathNavigator[params_s][numberOfParams] = {
              [methods_s]: [],
              [params_s]: {},
              [subpaths_s]: {},
              [path_s]: `${pathNavigator[path_s]}:${paramsNames.join("/:")}/`
            }
          }
          pathNavigator = pathNavigator[params_s][numberOfParams]!
          i++
          break
        }
      }
    }

    if (pathNavigator[methods_s].includes(path.method)) {
      // throw duplicate path-method error
      return Effect.fail(new InvalidStateError(`Duplicate method ${path.method} for path ${path.path}`))
    }
    pathNavigator[methods_s].push(path.method)
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
    .flatMap(checkPaths)
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
