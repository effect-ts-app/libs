/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeRef } from "@effect-ts/core/Effect/Ref"
import { Effect } from "@effect-ts-app/core/Prelude"

import * as Plutus from "../Openapi/atlas-plutus/index.js"
import { JSONSchema, SubSchema } from "../Openapi/atlas-plutus/JsonSchema/index.js"
import { References } from "../Openapi/atlas-plutus/Schema/index.js"
import { makeJsonSchema } from "./makeJsonSchema.js"
import { RouteDescriptorAny } from "./schema/routing.js"

export function makeOpenApiSpecs(
  rdescs: Iterable<RouteDescriptorAny>,
  info: Plutus.Info
) {
  return Effect.gen(function* ($) {
    const ref = yield* $(makeRef<Map<string, JSONSchema | SubSchema>>(new Map()))
    const withRef = Effect.provideService(References)({ ref })
    const paths = yield* $(pipe(makeJsonSchema(rdescs), withRef))
    const refs = yield* $(ref.get)
    const parameterRefs: Record<string, any> = {} // todos
    const schemas: Record<string, any> = {}
    const securitySchemes = {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    } // { basicAuth: { type: "http", scheme: "basic" } }
    const components = { securitySchemes, schemas, parameters: parameterRefs }

    for (const entry of refs.entries()) {
      // eslint-disable-next-line prefer-destructuring
      schemas[entry[0]] = entry[1]
    }

    return {
      openapi: "3.0.0",
      info: {
        title: info.title,
        description: info.description,
        termsOfService: info.tos,
        contact: info.contact
          ? {
              name: info.contact.name,
              email: info.contact.email,
              url: info.contact.url,
            }
          : undefined,
        license: info.license
          ? {
              name: info.license.name,
              url: info.license.url,
            }
          : undefined,
        version: info.version,
      },
      tags: [],
      paths,
      components,
      //test,
    }
  })
}
