/* eslint-disable @typescript-eslint/no-explicit-any */

import { InvalidStateError } from "../../errors.js"
import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends ReadonlyArray<infer A> ? A : never

class PathsTree {
  public methods: string[]
  public param: PathsTree | undefined
  public subpaths: { [key: string]: PathsTree | undefined }
  public path: string

  constructor(path: string) {
    this.methods = []
    this.param = undefined
    this.subpaths = {}
    this.path = path
  }
}

interface Match {
  _tag: "resource" | "param"
  value: string
}

function checkShadowing<T extends { path: string; method: string }>(
  pathNavigator: PathsTree,
  matches: Match[],
  path: T
) {
  return Effect.gen(function*($) {
    const errorOut = (path: T, shadowedBy: string) => (Effect.fail(
      new InvalidStateError(
        `Method: ${path.method.toUpperCase()} - Path ${path.path.startsWith("/") ? "" : "/"}${path.path}${
          path.path.endsWith("/") ? "" : "/"
        } is shadowed by ${shadowedBy}`
      )
    ))

    for (let i = 0; i < matches.length;) {
      const match = matches[i]!

      switch (match._tag) {
        case "resource": {
          if (pathNavigator.subpaths[match.value]) {
            if (i === matches.length - 1 && pathNavigator.subpaths[match.value]!.methods.includes(path.method)) {
              // at the end of matches there is a correspondence with a param
              return yield* $(errorOut(path, pathNavigator.subpaths[match.value]!.path))
            }

            i++
            pathNavigator = pathNavigator.subpaths[match.value]!

            // but if there isn't I should retry looking at params
          } else if (pathNavigator.param) {
            if (i === matches.length - 1 && pathNavigator.param.methods.includes(path.method)) {
              // at the end of matches there is a correspondence with a param
              return yield* $(errorOut(path, pathNavigator.param.path))
            }

            // try, there could be shadowing but with a parameter at this level
            i++
            pathNavigator = pathNavigator.param
          } else {
            return yield* $(Effect.unit)
          }

          break
        }
        case "param": {
          i++
          // check shadowing: if 'a/b' comes before 'a/:param', then 'a/"param' is partially shadowed
          // const subpaths = Object.getOwnPropertyNames(pathNavigator.subpaths)
          // if (subpaths.length > 0) {
          //   yield* $(subpaths.forEachEffect((s) =>
          //     Effect.logInfo(
          //       `Path ${pathNavigator.path}:${match.value}/ is partially shadowed by ${pathNavigator.subpaths[s]!.path}`
          //     )
          //   ))
          // }
          // break
        }
      }
    }

    return yield* $(Effect.unit)
  })
}

export function checkPaths<T extends { path: string; method: string }>(
  paths: readonly T[]
) {
  return Effect.gen(function*($) {
    const pathsTree = new PathsTree("/")
    const regex = /(?:^|\/)([^/:\n]+)|:(\w+)/g
    for (const path of paths) {
      const matches = [...path.path.matchAll(regex)]
        .map((match) =>
          match[1]
            ? { _tag: "resource", value: match[1] } as const
            : { _tag: "param", value: match[2]! } as const
        )

      let pathNavigator = pathsTree

      yield* $(checkShadowing(pathNavigator, matches, path))

      for (let i = 0; i < matches.length;) {
        const match = matches[i]!

        switch (match._tag) {
          case "resource": {
            if (!(match.value in pathNavigator.subpaths)) {
              pathNavigator.subpaths[match.value] = new PathsTree(`${pathNavigator.path}${match.value}/`)
            }

            pathNavigator = pathNavigator.subpaths[match.value]!
            i++
            break
          }
          case "param": {
            const paramName = match.value

            if (!pathNavigator.param) {
              pathNavigator.param = new PathsTree(
                `${pathNavigator.path}:${paramName}/`
              )
            }
            pathNavigator = pathNavigator.param!
            i++
            break
          }
        }
      }

      if (pathNavigator.methods.includes(path.method)) {
        // throw duplicate path-method error
        return yield* $(Effect.fail(new InvalidStateError(`Duplicate method ${path.method} for path ${path.path}`)))
      }
      pathNavigator.methods.push(path.method)
    }

    return paths
  })
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
