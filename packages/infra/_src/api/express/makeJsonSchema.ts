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

export function arePathsEqual(path1: string, path2: string): boolean {
  const normalizedPath1 = normalizePath(path1)
  const normalizedPath2 = normalizePath(path2)

  if (normalizedPath1 === normalizedPath2) {
    return true
  } else {
    // parameters' name does not matter

    const renameParam = (m: Match) => m._tag === "param" ? { ...m, value: ":parameter" } : m
    const toValue = (m: Match) => m.value

    const renamedParams1 = normalizePath(
      splitPath(normalizedPath1)
        .map(flow(renameParam, toValue))
        .join("/")
    )

    const renamedParams2 = normalizePath(
      splitPath(normalizedPath2)
        .map(flow(renameParam, toValue))
        .join("/")
    )

    return renamedParams1 === renamedParams2
  }
}

export function normalizePath(path: string): string {
  return `${path.startsWith("/") ? "" : "/"}${path}${path.endsWith("/") ? "" : "/"}`
}

interface Match {
  _tag: "resource" | "param"
  value: string
}

export function splitPath(path: string): Match[] {
  return [...path.matchAll(/(?:^|\/)([^/:\n]+)|:(\w+)/g)]
    .map((match) =>
      match[1]
        ? { _tag: "resource", value: match[1] } as const
        : { _tag: "param", value: match[2]! } as const
    )
}

function checkPartialShadowing<T extends { path: string; method: string }>(
  pathNavigator: PathsTree,
  matches: Match[],
  path: T
): Effect<never, never, void> {
  return Effect.gen(function*($) {
    // base case
    if (matches.length === 0) {
      return undefined
    }

    const method = path.method.toUpperCase()

    // base case
    if (
      matches.length === 1
      && pathNavigator.methods.includes(path.method)
    ) {
      // yield error

      return yield* $(Effect.logInfo(
        `Method: ${method} - Path ${normalizePath(path.path)} is partially shadowed by ${
          normalizePath(pathNavigator.path)
        }`
      ))
    }

    // recursive case
    // if there is shadowing with the rest of the matches, there is a partial shadowing one level up

    // poltrone sofà artigiani della qualità
    const shadowingPath = yield* $(pipe(
      checkShadowing(pathNavigator, matches.slice(1), path, false),
      Effect.map(() => ""),
      Effect.catchTag("InvalidStateError", (e) => {
        const message = e.message
        const shadowingPath = message.includes("is a duplicate")
          ? message.split("is a duplicate of ")[1]
          : message.split("is shadowed by ")[1]

        return Effect.succeed(shadowingPath)
      })
    ))

    if (shadowingPath) {
      return yield* $(Effect.logInfo(
        `Method: ${method} - Path ${normalizePath(path.path)} is partially shadowed by ${shadowingPath}`
      ))
    } else {
      // otherwise discard current level and check recursively in subpaths

      // if there is a param it doesn't matter if next match is a resource or a param
      pathNavigator.param && (yield* $(checkPartialShadowing(pathNavigator.param, matches.slice(1), path)))

      // for subpaths it does matter: if next match is a resource it must be the same,
      // if it is a param there is no problem, all subpaths can be checked
      const subpaths = Object.getOwnPropertyNames(pathNavigator.subpaths).filter((s) => {
        const nextMatch = matches[1]
        return nextMatch?._tag === "resource" && nextMatch.value === s
          || nextMatch?._tag === "param" // in this case all subpaths must be checked
          || false // in this case there is no match, so no subpath must be checked
      })
      if (subpaths.length > 0) {
        yield* $(
          subpaths.forEachEffect((s) => checkPartialShadowing(pathNavigator.subpaths[s]!, matches.slice(1), path))
        )
      }
    }
  })
}

function checkShadowing<T extends { path: string; method: string }>(
  pathNavigator: PathsTree,
  matches: Match[],
  path: T,
  doCheckPartialShadowing = true
): Effect<never, InvalidStateError, void> {
  return Effect.gen(function*($) {
    const errorOut = (path: T, shadowedBy: string) => {
      const shadowedPathNormalized = normalizePath(shadowedBy)
      const pathNormalized = normalizePath(path.path)
      const method = path.method.toUpperCase()

      const message = arePathsEqual(
          shadowedPathNormalized,
          pathNormalized
        )
        ? `Method: ${method} - Path ${pathNormalized} is a duplicate of ${shadowedPathNormalized}`
        : `Method: ${method} - Path ${pathNormalized} is shadowed by ${shadowedPathNormalized}`

      return Effect.fail(
        new InvalidStateError(
          message
        )
      )
    }

    for (let i = 0; i < matches.length;) {
      const match = matches[i]!

      switch (match._tag) {
        case "resource": {
          if (pathNavigator.subpaths[match.value]) {
            if (i === matches.length - 1 && pathNavigator.subpaths[match.value]!.methods.includes(path.method)) {
              // at the end of matches there is a correspondence with a param
              return yield* $(errorOut(path, pathNavigator.subpaths[match.value]!.path))
            }

            yield* $(
              checkShadowing(pathNavigator.subpaths[match.value]!, matches.slice(i + 1), path, doCheckPartialShadowing)
            )

            // but if there isn't a shadow with a subpath, I have to retry looking at the param
          }

          if (pathNavigator.param) {
            if (i === matches.length - 1 && pathNavigator.param.methods.includes(path.method)) {
              // at the end of matches there is a correspondence with a param
              return yield* $(errorOut(path, pathNavigator.param.path))
            }

            // there could be shadowing but with a parameter, if not there are no other possibilities
            i++
            pathNavigator = pathNavigator.param
          } else {
            return yield* $(Effect.unit)
          }

          break
        }
        case "param": {
          if (pathNavigator.param) {
            if (i === matches.length - 1 && pathNavigator.param.methods.includes(path.method)) {
              // at the end of matches there is a correspondence with a param
              return yield* $(errorOut(path, pathNavigator.param.path))
            }

            // there could be shadowing but with a parameter, if not there are no other possibilities of error
            // but there could still be partial shadowing
            i++
            pathNavigator = pathNavigator.param
          } else {
            if (doCheckPartialShadowing) {
              // if there aren't other more serious type of shadowing
              // just look for partial shadowing: if 'a/b' comes before 'a/:param', then 'a/"param' is partially shadowed
              const subpaths = Object.getOwnPropertyNames(pathNavigator.subpaths)
              if (subpaths.length > 0) {
                yield* $(
                  subpaths.forEachEffect((s) =>
                    checkPartialShadowing(pathNavigator.subpaths[s]!, matches.slice(i), path)
                  )
                )
              }
            }

            return undefined
          }
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

    for (const path of paths) {
      const matches = splitPath(path.path)

      let pathNavigator = pathsTree

      yield* $(checkShadowing(pathNavigator, matches, path))

      // add path to the tree
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
                // TODO: :param instead of the param name? there could be more than one during insertion
                // but with this I store only the first one
                `${pathNavigator.path}:${paramName}/`
              )
            }
            pathNavigator = pathNavigator.param!
            i++
            break
          }
        }
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
