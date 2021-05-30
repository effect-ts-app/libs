/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "@effect-ts/core"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import * as T from "@effect-ts/core/Effect"
import { _A } from "@effect-ts/core/Utils"

import * as RS from "./schema/routing"

type Methods = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

const rx = /:(\w+)/g

/**
 * Work in progress JSONSchema generator.
 */
export function makeJsonSchema(
  r: Iterable<RS.RouteDescriptor<any, any, any, any, any, any, any, any>>
) {
  return pipe(
    CNK.from(r),
    T.forEach(RS.makeFromSchema),
    T.map((e) => {
      const map = ({ method, path, responses, ...rest }: _A<typeof e>) => ({
        [method]: {
          ...rest,
          responses: A.reduce_(
            responses,
            {} as Record<Response["statusCode"], Response["type"]>,
            (prev, cur) => {
              prev[cur.statusCode] = cur.type
              return prev
            }
          ),
        },
      })
      return CNK.reduce_(
        e,
        {} as Record<string, Record<Methods, ReturnType<typeof map>>>,
        (prev, e) => {
          const path = e.path.replace(rx, (_a, b) => `{${b}}`)
          prev[path] = {
            ...prev[path],
            ...map(e),
          }
          return prev
        }
      )
    })
  )
}

class Response {
  constructor(
    public readonly statusCode: number,
    public readonly type: any //string | JSONSchema | SubSchema
  ) {}
}
