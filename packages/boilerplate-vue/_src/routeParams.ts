import type { ParsedShapeOfCustom, ReqRes, SchemaAny } from "@effect-ts-app/boilerplate-prelude/schema"
import { EParserFor, Parser, unsafe } from "@effect-ts-app/boilerplate-prelude/schema"
import type { ParsedQuery } from "query-string"

export function getQueryParam(search: ParsedQuery, param: string) {
  const v = search[param]
  if (Array.isArray(v)) {
    return v[0]
  }
  return v ?? null
}

export const getQueryParamO = flow(getQueryParam, Opt.fromNullable)

export const parseMaybe = <E, A>(t: ReqRes<E, A>) => {
  const dec = flow(EParserFor(t), x =>
    x.effect._tag === "Right"
      ? x.effect.right.tuple[1]._tag === "None"
        ? Opt.some(x.effect.right.tuple[0])
        : Opt.none
      : Opt.none)
  return dec
}

export const parseMaybeUnknown = <E, A>(t: ReqRes<E, A>) => {
  const dec = flow(Parser.for(t), x =>
    x.effect._tag === "Right"
      ? x.effect.right.tuple[1]._tag === "None"
        ? Opt.some(x.effect.right.tuple[0])
        : Opt.none
      : Opt.none)
  return dec
}

export function parseRouteParamsOption<NER extends Record<string, SchemaAny>>(
  query: Record<string, any>,
  t: NER // enforce non empty
): {
  [K in keyof NER]: Opt<ParsedShapeOfCustom<NER[K]>>
} {
  return t.$$.keys.reduce(
    (prev, cur) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prev[cur] = getQueryParamO(query, cur as string).flatMap(parseOpt(t[cur]!))

      return prev
    },
    {} as {
      [K in keyof NER]: Opt<ParsedShapeOfCustom<NER[K]>>
    }
  )
}

export function parseRouteParams<NER extends Record<string, SchemaAny>>(
  query: Record<string, any>,
  t: NER // enforce non empty
): {
  [K in keyof NER]: ParsedShapeOfCustom<NER[K]>
} {
  return t.$$.keys.reduce(
    (prev, cur) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prev[cur] = unsafe(EParserFor(t[cur]!))(query[cur as any])

      return prev
    },
    {} as {
      [K in keyof NER]: ParsedShapeOfCustom<NER[K]>
    }
  )
}
