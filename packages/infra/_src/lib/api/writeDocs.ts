import { makeOpenApiSpecs } from "@effect-app/infra-adapters/express/makeOpenApiSpecs"
import type { RouteDescriptorAny } from "@effect-app/infra-adapters/express/schema/routing"
import * as Plutus from "@effect-app/infra-adapters/Openapi/atlas-plutus"
import { writeTextFile } from "@effect-app/infra-adapters/simpledb/fileutil"

import { typedValuesOf } from "@effect-app/core/utils"

export function writeOpenapiDocs(rdescs: Record<string, Record<string, RouteDescriptorAny>>) {
  return makeOpenApiSpecs(
    typedValuesOf(rdescs).reduce((prev, cur) => prev.concat(typedValuesOf(cur)), [] as readonly RouteDescriptorAny[])
      .sortWith(Ord.string.contramap((a: RouteDescriptorAny) => a.path)),
    Plutus.info({
      title: "api",
      version: "X",
      pageTitle: "api"
    })
  )
    .map(_ => ({
      ..._,
      tags: [
        // add the tags here
      ]
    }))
    .flatMap(_ => writeTextFile("./openapi.json", JSON.stringify(_, undefined, 2)).orDie)
    .flatMap(() => Effect.logInfo("OpenAPI spec written to './openapi.json'"))
}
