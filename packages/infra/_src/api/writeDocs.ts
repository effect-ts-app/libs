import { typedValuesOf } from "@effect-app/core/utils"
import * as Plutus from "@effect-app/infra-adapters/Openapi/atlas-plutus"
import { writeTextFile } from "../services/simpledb/fileutil.js"
import { makeOpenApiSpecs } from "./express/makeOpenApiSpecs.js"
import type { RouteDescriptorAny } from "./express/schema/routing.js"

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
