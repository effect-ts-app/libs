/* eslint-disable @typescript-eslint/no-explicit-any */

import { InvalidStateError } from "../../errors.js"
import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends ReadonlyArray<infer A> ? A : never

class PathsTree {
  public readonly methods: string[]
  public readonly params: { [key: number]: PathsTree | undefined }
  public readonly subpaths: { [key: string]: PathsTree | undefined }
  public readonly path: string

  constructor(path: string) {
    this.methods = []
    this.params = {}
    this.subpaths = {}
    this.path = path
  }
}

interface Match {
  _tag: "resource" | "param"
  value: string
}

function checkShadowing(
  pathNavigator: PathsTree,
  match: Match
): Either<Effect<never, InvalidStateError, never>, Effect<never, never, void>> {
  switch (match._tag) {
    case "resource": {
      // check shadowing: if 'a/:param' comes before 'a/b', then 'a/b' is shadowed
      if (pathNavigator.params[1]) {
        return Either.left(Effect.fail(
          new InvalidStateError(
            `Path ${pathNavigator.path}${match.value}/ is shadowed by ${pathNavigator.params[1].path}`
          )
        ))
      }
      break
    }
    case "param": {
      // check shadowing: if 'a/b' comes before 'a/:param', then 'a/"param' is partially shadowed
      const subpaths = Object.getOwnPropertyNames(pathNavigator.subpaths)
      if (subpaths.length > 0) {
        return Either.right(
          Effect.all(subpaths.map((s) =>
            Effect.logInfo(
              `Path ${pathNavigator.path}:${match.value}/ is partially shadowed by ${pathNavigator.subpaths[s]!.path}`
            )
          )) > Effect.succeed(void 0 as void)
        )
      }
      break
    }
  }
  return Either.right(Effect.succeed(void 0 as void))
}

export function checkPaths<T extends { path: string; method: string }>(
  paths: readonly T[]
): Effect<never, InvalidStateError, readonly T[]> {
  const pathMethods: PathsTree = new PathsTree("/")
  const regex = /(?:^|\/)([^/:\n]+)|:(\w+)/g

  const logs: Effect<never, never, readonly T[]>[] = []

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

      const shadowing = checkShadowing(pathNavigator, match)
      if (Either.isLeft(shadowing)) {
        return shadowing.left
      } else {
        logs.push(shadowing.right.map((_) => []))
      }

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
          const paramsNames = [match.value]
          let numberOfParams = 1
          while (i < matches.length && matches[i + 1]?._tag === "param") {
            numberOfParams++
            i++
            paramsNames.push(matches[i]!.value)
          }

          if (!(numberOfParams in pathNavigator.params)) {
            pathNavigator.params[numberOfParams] = new PathsTree(
              `${pathNavigator.path}:${paramsNames.join("/:")}/`
            )
          }
          pathNavigator = pathNavigator.params[numberOfParams]!
          i++
          break
        }
      }
    }

    if (pathNavigator.methods.includes(path.method)) {
      // throw duplicate path-method error
      return Effect.fail(new InvalidStateError(`Duplicate method ${path.method} for path ${path.path}`))
    }
    pathNavigator.methods.push(path.method)
  }

  return Effect.all(logs) > Effect.succeed(paths)
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
