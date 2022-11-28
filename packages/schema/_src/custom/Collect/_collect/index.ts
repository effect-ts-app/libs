// tracing: off

import * as S from "../../_schema/index.js"

export interface CollectAnnotations {
  <Annotations extends readonly S.Annotation<any>[]>(
    ...annotations: Annotations
  ): Chunk<
    {
      [k in keyof Annotations]: [Annotations[k]] extends [S.Annotation<infer A>]
        ? A
        : never
    }[number]
  >
}

export const interpreters: ((schema: S.SchemaAny) => Maybe<() => any>)[] = [
  Maybe.partial(
    (miss) =>
      (schema: S.SchemaAny): (() => (...xs: S.Annotation<any>[]) => Chunk<any>) => {
        if (S.isAnnotatedSchema(schema)) {
          return () =>
            (...xs) => {
              for (const x of xs) {
                if (schema.annotation === x) {
                  return collectAnnotationsFor(schema.self)(...xs).append(schema.meta)
                }
              }
              return collectAnnotationsFor(schema.self)(...xs)
            }
        }
        if (schema instanceof S.SchemaNamed) {
          return () => collectAnnotationsFor(schema.self)
        }
        if (schema instanceof S.SchemaMapParserError) {
          return () => collectAnnotationsFor(schema.self)
        }
        if (schema instanceof S.SchemaIdentity) {
          return () => () => Chunk.empty<any>()
        }
        if (schema instanceof S.SchemaPipe) {
          return () =>
            (...xs) =>
              collectAnnotationsFor(schema.self)(...xs).concat(
                collectAnnotationsFor(schema.that)(...xs)
              )
        }
        if (schema instanceof S.SchemaParser) {
          return () => collectAnnotationsFor(schema.self)
        }
        if (schema instanceof S.SchemaRefinement) {
          return () => collectAnnotationsFor(schema.self)
        }
        return miss()
      }
  ),
]

const cache = new WeakMap()

export function collectAnnotationsFor<
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  schema: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): CollectAnnotations {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    //// @ts-expect-error
    const parser: any = (...__): any => collectAnnotationsFor(schema.self())(...__)

    cache.set(schema, parser)
    return parser as any
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      let x: any
      //// @ts-expect-error
      const parser: any = (...__): any => {
        if (!x) {
          x = _.value()
        }
        return x(...__)
      }
      return parser as any
    }
  }
  if (S.hasContinuation(schema)) {
    let x: any
    //// @ts-expect-error
    const parser: any = (...__): any => {
      if (!x) {
        x = collectAnnotationsFor(schema[S.SchemaContinuationSymbol])
      }
      return x(...__)
    }
    cache.set(schema, parser)
    return parser as any
  }
  throw new Error(`Missing collect annotations integration for: ${schema.constructor}`)
}

export { collectAnnotationsFor as for }
