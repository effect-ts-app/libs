/* eslint-disable @typescript-eslint/no-explicit-any */

import * as RS from "./schema/routing.js"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

type _A<C> = C extends Chunk<infer A> ? A : never

/**
 * Work in progress JSONSchema generator.
 */
export function makeJsonSchema(r: Iterable<RS.RouteDescriptorAny>) {
  return Chunk.from(r)
    .forEachEffect(RS.makeFromSchema)
    .map((e) => {
      const map = ({ method, path, responses, ...rest }: _A<typeof e>) => ({
        [method]: {
          ...rest,
          responses: ROArray.reduce_(
            responses,
            {} as Record<Response["statusCode"], Response["type"]>,
            (prev, cur) => {
              prev[cur.statusCode] = cur.type
              return prev
            }
          ),
        },
      })
      return e.reduce(
        {} as Record<string, Record<Methods, ReturnType<typeof map>>>,
        (prev, e) => {
          const path = e.path.split("?")[0].replace(rx, (_a, b) => `{${b}}`)
          prev[path] = {
            ...prev[path],
            ...map(e),
          }
          return prev
        }
      )
    })
}

class Response {
  constructor(
    public readonly statusCode: number,
    public readonly type: any //string | JSONSchema | SubSchema
  ) {}
}
