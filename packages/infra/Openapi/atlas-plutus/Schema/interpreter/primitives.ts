/* eslint-disable @typescript-eslint/no-empty-interface */
import { pipe } from "@effect-ts/core/Function"
import type { PrimitivesURI } from "@effect-ts/morphic/Algebra/Primitives"
import { interpreter } from "@effect-ts/morphic/HKT"

import type { EnumSchema, NumberEnumSchema } from "../../JsonSchema"
import * as X from "../base"

export const SchemaPrimitiveInterpreter = interpreter<X.SchemaURI, PrimitivesURI>()(
  () => ({
    _F: X.SchemaURI,
    function: (_, __, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.dieMessage("function is not supported"),
          env,
          {}
        )
      ),
    unknownE: (k, config) => (env) =>
      new X.SchemaType(X.SchemaApplyConfig(config?.conf)(k(env).Schema, env, {})),
    date: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            format: "date-time",
            title: config?.name,
            ...config?.extensions?.openapiMeta,
          }),
          env,
          {}
        )
      ),
    boolean: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "boolean",
          }),
          env,
          {}
        )
      ),
    string: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            title: config?.name,
            ...config?.extensions?.openapiMeta,
            //minLength
            //maxLength
            // format; "uri"
            // pattern regex
          }),
          env,
          {}
        )
      ),
    number: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "number",
            title: config?.name,
            ...config?.extensions?.openapiMeta,
            // minimum
            // maximum
          }),
          env,
          {}
        )
      ),
    bigint: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            format: "bigint",
          }),
          env,
          {}
        )
      ),
    stringLiteral: (_, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            enum: [_],
          }),
          env,
          {}
        )
      ),
    numberLiteral: (_, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "number",
            enum: [_],
            title: config?.name,
            ...config?.extensions?.openapiMeta,
          }),
          env,
          {}
        )
      ),
    oneOfLiterals:
      (..._ls) =>
      (config) =>
      (env) =>
        new X.SchemaType(
          X.SchemaApplyConfig(config?.conf)(
            X.succeed({
              oneOf: _ls.map((x): EnumSchema | NumberEnumSchema => ({
                type: typeof x === "string" ? "string" : "number",
                description: `${x}`,
                enum: [x] as any,
                title: config?.name,
                ...config?.extensions?.openapiMeta,
              })),
            }),
            env,
            {}
          )
        ),
    keysOf: (_keys, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            enum: Object.keys(_keys),
            title: config?.name,
            ...config?.extensions?.openapiMeta,
          }),
          env,
          {}
        )
      ),
    nullable: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          //X.dieMessage("nullable is not upported"),
          pipe(
            _getSchema(env).Schema,
            X.chain((a) =>
              X.succeed({
                ...a,
                nullable: true,
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            Schema: _getSchema(env).Schema,
          }
        )
      ),
    mutable: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(_getSchema(env).Schema, env, {
          Schema: _getSchema(env).Schema,
        })
      ),
    optional: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          //X.dieMessage("optional is not supported"),
          pipe(
            _getSchema(env).Schema,
            X.chain((a) =>
              X.succeed({
                ...a,
                nullable: true,
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            Schema: _getSchema(env).Schema,
          }
        )
      ),
    array: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            _getSchema(env).Schema,
            X.chain((items) =>
              X.succeed({
                type: "array",
                items,
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            Schema: _getSchema(env).Schema,
          }
        )
      ),
    list: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            _getSchema(env).Schema,
            X.chain((items) =>
              X.succeed({
                type: "array",
                items,
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {}
        )
      ),
    nonEmptyArray: (_getSchema, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            _getSchema(env).Schema,
            X.chain((items) =>
              X.succeed({
                type: "array",
                items,
                minItems: 1,
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            Schema: _getSchema(env).Schema,
          }
        )
      ),
    tuple:
      (..._types) =>
      (cfg) =>
      (env) =>
        new X.SchemaType(
          X.SchemaApplyConfig(cfg?.conf)(
            X.dieMessage("tuple is not supported"),
            env,
            {}
          )
        ),
    uuid: (config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          X.succeed({
            type: "string",
            format: "uuid",
            ...(config?.name ? { title: config?.name } : undefined),
            ...config?.extensions?.openapiMeta,
          }),
          env,
          {}
        )
      ),
    either: (_e, _a, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            X.struct({ e: _e(env).Schema, a: _a(env).Schema }),
            X.chain(({ a, e }) =>
              X.succeed({
                oneOf: [e, a],
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            left: _e(env).Schema,
            right: _a(env).Schema,
          }
        )
      ),
    option: (_a, config) => (env) =>
      new X.SchemaType(
        X.SchemaApplyConfig(config?.conf)(
          pipe(
            _a(env).Schema,
            X.chain((a) =>
              X.succeed({
                oneOf: [
                  a,
                  {
                    type: "object",
                    properties: { _tag: { type: "string", description: "None" } },
                  },
                ],
                ...(config?.name ? { title: config?.name } : undefined),
                ...config?.extensions?.openapiMeta,
              })
            )
          ),
          env,
          {
            Schema: _a(env).Schema,
          }
        )
      ),
  })
)
