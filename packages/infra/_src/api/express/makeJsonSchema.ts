/* eslint-disable @typescript-eslint/no-explicit-any */

import type { JSONSchema, ParameterLocation, SubSchema } from "@effect-app/infra-adapters/Openapi/atlas-plutus"
import { InvalidStateError } from "../../errors.js"
import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends ReadonlyArray<infer A> ? A : never

interface Path {
  path: string
  method: string
  tags: readonly string[] | undefined
  description: string | undefined
  summary: string | undefined
  operationId: string | undefined
  parameters: {
    name: string
    in: ParameterLocation
    required: boolean
    schema: SubSchema | undefined
  }[]
  requestBody: {
    content: {
      "application/json": {
        schema: JSONSchema
      }
    }
  } | undefined
  responses: Response[]
}

export function checkDuplicatePaths(paths: readonly Path[]): Effect<never, InvalidStateError, readonly Path[]> {
  const pathMethods: Record<string, string[]> = {}

  for (const path of paths) {
    if (!(path.path in pathMethods)) {
      pathMethods[path.path] = []
    }
    if (pathMethods[path.path]?.includes(path.method)) {
      // throw duplicate path-method error
      return Effect.fail(new InvalidStateError(`Duplicate method ${path.method} for path ${path.path}`))
    }
    pathMethods[path.path]?.push(path.method)
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
