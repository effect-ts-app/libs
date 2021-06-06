// tracing: off
import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as O from "@effect-ts/core/Option"

import * as S from "../../_schema"

export interface CollectAnnotations {
  <Annotations extends readonly S.Annotation<any>[]>(
    ...annotations: Annotations
  ): Chunk.Chunk<
    {
      [k in keyof Annotations]: [Annotations[k]] extends [S.Annotation<infer A>]
        ? A
        : never
    }[number]
  >
}

export const interpreters: ((schema: S.SchemaAny) => O.Option<() => any>)[] = [
  O.partial((miss) => (schema: S.SchemaAny): (() => (
    ...xs: S.Annotation<any>[]
  ) => Chunk.Chunk<any>) => {
    if (S.isAnnotatedSchema(schema)) {
      return () =>
        (...xs) => {
          for (const x of xs) {
            if (schema.annotation === x) {
              return Chunk.append_(
                collectAnnotationsFor(schema.self)(...xs),
                schema.meta
              )
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
          Chunk.concat_(
            collectAnnotationsFor(schema.self)(...xs),
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
  })
]

const cache = new WeakMap()

export function collectAnnotationsFor<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  schema: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): CollectAnnotations {
  if (cache.has(schema)) {
    return cache.get(schema)
  }
  if (schema instanceof S.SchemaLazy) {
    // @ts-expect-error
    const parser: any = (...__): any => collectAnnotationsFor(schema.self())(...__)

    cache.set(schema, parser)
    return parser as any
  }
  for (const interpreter of interpreters) {
    const _ = interpreter(schema)
    if (_._tag === "Some") {
      let x: any
      // @ts-expect-error
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
    // @ts-expect-error
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
