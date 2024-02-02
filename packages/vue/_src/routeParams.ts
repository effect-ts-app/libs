import type { REST, Schema } from "@effect-app/prelude/schema"
import type { ParsedQuery } from "query-string"

export function getQueryParam(search: ParsedQuery, param: string) {
  const v = search[param]
  if (Array.isArray(v)) {
    return v[0]
  }
  return v ?? null
}

export const getQueryParamO = flow(getQueryParam, Option.fromNullable)

export const parseOpt = <E, A>(t: REST.ReqRes<never, E, A>) => {
  const dec = flow(t.decodeUnknownEither, (x) =>
    x._tag === "Right"
      ? Option.some(x.right)
      : Option.none)
  return dec
}

export const parseOptUnknown = <E, A>(t: REST.ReqRes<never, E, A>) => {
  const dec = flow(t.decodeUnknownEither, (x) =>
    x._tag === "Right"
      ? Option.some(x.right)
      : Option.none)
  return dec
}

export function parseRouteParamsOption<NER extends Record<string, Schema<never, any, any>>>(
  query: Record<string, any>,
  t: NER // enforce non empty
): {
  [K in keyof NER]: Option<Schema.To<NER[K]>>
} {
  return t.$$.keys.reduce(
    (prev, cur) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prev[cur] = getQueryParamO(query, cur as string).flatMap(parseOpt(t[cur]!))

      return prev
    },
    {} as {
      [K in keyof NER]: Option<Schema.To<NER[K]>>
    }
  )
}

export function parseRouteParams<NER extends Record<string, Schema<never, any, any>>>(
  query: Record<string, any>,
  t: NER // enforce non empty
): {
  [K in keyof NER]: Schema.To<NER[K]>
} {
  return t.$$.keys.reduce(
    (prev, cur) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prev[cur] = t[cur]!.decodeUnknownSync(query[cur as any])

      return prev
    },
    {} as {
      [K in keyof NER]: Schema.To<NER[K]>
    }
  )
}
