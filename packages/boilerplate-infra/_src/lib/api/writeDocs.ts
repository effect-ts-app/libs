import { makeOpenApiSpecs } from "@effect-ts-app/infra/express/makeOpenApiSpecs"
import type { RouteDescriptorAny } from "@effect-ts-app/infra/express/schema/routing"
import * as Plutus from "@effect-ts-app/infra/Openapi/atlas-plutus"
import { writeTextFile } from "@effect-ts-app/infra/simpledb/fileutil"

import { typedValuesOf } from "@effect-ts-app/core/utils"

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
