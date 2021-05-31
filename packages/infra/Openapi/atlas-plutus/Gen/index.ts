import * as T from "@effect-ts/core/Effect"
import { makeRef } from "@effect-ts/core/Effect/Ref"
import type { _R, UnionToIntersection } from "@effect-ts/core/Utils"
import { mapRecord } from "@effect-ts/morphic/Utils"

import type { JSONSchema, SubSchema } from "../JsonSchema"
import { References, schema } from "../Schema"
import type {
  AnyOperation,
  Api,
  BodyEnv,
  ContactInfo,
  License,
  Parameter,
  RequestBody,
  Response,
  Type,
} from "../Spec"

export interface OpenApiSpec {
  openapi: "3.0.0"
  info: {
    title: string
    description?: string
    termsOfService?: string
    contact:
      | {
          name: string
          email: string
          url: string
        }
      | undefined
    license:
      | {
          name: string
          url: string
        }
      | undefined
    version: string
  }
  tags: {
    name: string
    description: string
    externalDocs: string
  }[]
  paths: Record<string, any>
  components: Record<string, any>
}

export function generate<X extends Api<any, any>>(
  api: X
): T.RIO<BodyEnv<X>, OpenApiSpec> {
  return T.gen(function* (_) {
    const ref = yield* _(makeRef<Map<string, JSONSchema | SubSchema>>(new Map()))
    const withRef = T.provideService(References)({ ref })
    const paths: Record<string, any> = {}

    const parameterRefs: Record<string, any> = {}

    for (const k of Object.keys(api.paths)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const pathSpec = api.paths[k]!

      const path: Record<string, any> = {
        description: pathSpec?.description,
        summary: pathSpec?.summary,
      }

      for (const methodName of Object.keys(pathSpec.methods)) {
        const methodSpec: AnyOperation<typeof pathSpec["path"]> =
          pathSpec.methods[methodName]

        const responses: Record<string, any> = {}
        const parameters: any[] = []

        for (const code of Object.keys(methodSpec.responses)) {
          const responseSpec: Response<any> = methodSpec.responses[code]
          const content: Type<any, any> = responseSpec.content

          const contentSchema = yield* _(withRef(schema(content)))

          responses[code] = {
            description: responseSpec.description,
            content: {
              "application/json": {
                schema: contentSchema,
              },
            },
          }
        }

        for (const in_ of Object.keys(methodSpec.parameters)) {
          for (const param of Object.keys(methodSpec.parameters[in_])) {
            const paramSpec: Parameter<any, any> = methodSpec.parameters[in_][param]

            if (paramSpec.ref === true) {
              parameters.push({
                $ref: `#/components/parameters/${param}`,
              })
              parameterRefs[param] = {
                name: param,
                in: in_,
                description: paramSpec.description,
                required: paramSpec.required,
                schema: yield* _(withRef(schema(paramSpec.content))),
              }
            } else {
              parameters.push({
                name: param,
                in: in_,
                description: paramSpec.description,
                required: paramSpec.required,
                schema: yield* _(withRef(schema(paramSpec.content))),
              })
            }
          }
        }

        let requestBody = undefined

        if (methodSpec.requestBody) {
          const body: RequestBody<BodyEnv<X>, any, any> = methodSpec.requestBody

          requestBody = {
            description: body.description,
            required: body.required,
            content: {
              "application/json": {
                schema: yield* _(withRef(schema(yield* _(body.content)))),
                ...(body.examples
                  ? { examples: mapRecord(body.examples, (v) => ({ value: v })) }
                  : {}),
              },
            },
          }
        }

        const method = {
          description: methodSpec.description,
          externalDocs: methodSpec.externalDocs,
          operationId: methodSpec.operationId,
          summary: methodSpec.summary,
          tags: methodSpec.tags,
          responses,
          parameters,
          requestBody,
        }

        path[methodName.toLocaleLowerCase()] = method
      }

      if (api.info.prefix) {
        paths[`${api.info.prefix}${k}`] = path
      } else {
        paths[k] = path
      }
    }

    const refs = yield* _(ref.get)

    const schemas: Record<string, any> = {}
    const components = { schemas, parameters: parameterRefs }

    for (const entry of refs.entries()) {
      schemas[entry[0]] = entry[1]
    }

    return {
      openapi: "3.0.0",
      info: {
        title: api.info.title,
        description: api.info.description,
        termsOfService: api.info.tos,
        contact: api.info.contact
          ? {
              name: api.info.contact.name,
              email: api.info.contact.email,
              url: api.info.contact.url,
            }
          : undefined,
        license: api.info.license
          ? {
              name: api.info.license.name,
              url: api.info.license.url,
            }
          : undefined,
        version: api.info.version,
      },
      tags: api.tags.map((tag: any) => ({
        name: tag.name,
        description: tag.description,
        externalDocs: tag.externalDocs,
      })),
      paths,
      components,
    }
  })
}

export interface GeneralInfo {
  readonly title: string
  readonly pageTitle: string
  readonly version: string
  readonly description?: string
  readonly tos?: string
  readonly contact?: ContactInfo
  readonly license?: License
}

export function generateMerged(info: GeneralInfo) {
  return <Apis extends readonly Api<any, any>[]>(
    ...specs: Apis
  ): T.RIO<
    UnionToIntersection<
      {
        [k in keyof Apis]: Apis[k] extends Api<any, any>
          ? unknown extends BodyEnv<Apis[k]>
            ? never
            : BodyEnv<Apis[k]>
          : never
      }[number]
    >,
    OpenApiSpec
  > =>
    T.gen(function* (_) {
      const schemas = yield* _(T.forEach_(specs, generate))
      const paths: Record<string, any> = {}
      const tags: any[] = []
      const refsSchemas = {}
      const refsParameters = {}
      for (const schema of schemas) {
        for (const path of Object.keys(schema.paths)) {
          paths[path] = schema.paths[path]
        }
        tags.push(...schema.tags)
        Object.assign(refsSchemas, schema.components.schemas)
        Object.assign(refsParameters, schema.components.parameters)
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
        tags,
        paths,
        components: { schemas: refsSchemas, parameters: refsParameters },
      }
    })
}
