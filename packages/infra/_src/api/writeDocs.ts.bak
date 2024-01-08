import { typedValuesOf } from "@effect-app/core/utils"
import { writeTextFile } from "@effect-app/infra-adapters/fileUtil"
import * as Plutus from "@effect-app/infra-adapters/Openapi/atlas-plutus"
import { makeOpenApiSpecs } from "./express/makeOpenApiSpecs.js"
import type { RouteDescriptorAny } from "./express/schema/routing.js"

export function writeOpenapiDocs(rdescs: Record<string, Record<string, RouteDescriptorAny>>) {
  return writeOpenapiDocsI(
    typedValuesOf(rdescs)
      .reduce((prev, cur) => prev.concat(typedValuesOf(cur)), [] as readonly RouteDescriptorAny[])
  )
}

export function writeOpenapiDocsI(rdescs: readonly RouteDescriptorAny[]) {
  return makeOpenApiSpecs(
    rdescs.sortBy(Order.string.mapInput((a: RouteDescriptorAny) => a.path)),
    Plutus.info({
      title: "api",
      version: "X",
      pageTitle: "api"
    })
  )
    .map((_) => ({
      ..._,
      tags: [
        // add the tags here
      ]
    }))
    .flatMap((_) => writeTextFile("./openapi.json", JSON.stringify(_, undefined, 2)).orDie)
    .flatMap(() => Effect.logDebug("OpenAPI spec written to './openapi.json'"))
}
