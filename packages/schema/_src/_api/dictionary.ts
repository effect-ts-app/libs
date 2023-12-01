/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import type { Dictionary } from "@effect-app/core/Dictionary"
import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import { augmentRecord } from "../custom/_utils.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import type { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"

export const dictionaryIdentifier = S.makeAnnotation<{}>()

export type ParserErrorFromDictionary = S.CompositionE<
  S.PrevE<S.LeafE<S.UnknownRecordE>> | S.NextE<S.LeafE<S.ParseObjectE>>
> // TODO

export function dictionary<ParserInput, To, ConstructorInput, From, Api>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  unknown,
  Dictionary<To>,
  Dictionary<To>,
  Dictionary<From>,
  {}
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const parse = Parser.for(self)
  const encode = Encoder.for(self)

  function parser(
    _: unknown,
    env?: ParserEnv
  ): Th.These<ParserErrorFromDictionary, Dictionary<To>> {
    if (typeof _ !== "object" || _ === null) {
      return Th.fail(
        S.compositionE(Chunk(S.prevE(S.leafE(S.unknownRecordE(_)))))
      )
    }
    let errors = Chunk.empty<
      S.OptionalKeyE<string, unknown> | S.RequiredKeyE<string, unknown>
    >()

    let isError = false

    const result = {}

    const keys = Object.keys(_)

    const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse

    for (const key of keys) {
      const res = parsev2(_[key])

      if (res.effect._tag === "Left") {
        errors = errors.append(S.requiredKeyE(key, res.effect.left))
        isError = true
      } else {
        result[key] = res.effect.right[0]

        const warnings = res.effect.right[1]

        if (warnings._tag === "Some") {
          errors = errors.append(S.requiredKeyE(key, warnings.value))
        }
      }
    }

    if (!isError) {
      augmentRecord(result)
    }

    if (errors.isEmpty()) {
      return Th.succeed(result as Dictionary<To>)
    }

    const error_ = S.compositionE(Chunk(S.nextE(S.structE(errors))))
    const error = error_

    if (isError) {
      // @ts-expect-error doc
      return Th.fail(error)
    }

    // @ts-expect-error doc
    return Th.warn(result, error)
  }

  const refine = (u: unknown): u is Dictionary<To> =>
    typeof u === "object"
    && u != null
    && !Object.keys(u).every((x) => typeof x === "string" && Object.values(u).every(guard))

  return pipe(
    S.refinement(refine, (v) => S.leafE(S.parseObjectE(v))),
    S.constructor((s: Dictionary<To>) => Th.succeed(s)),
    S.arbitrary((_) => _.dictionary<To>(_.string(), arb(_))),
    S.parser(parser),
    S.encoder((_) =>
      Object.keys(_).reduce((prev, cur) => {
        prev[cur] = encode(_[cur])
        return prev
      }, {} as Record<string, From>)
    ),
    S.mapApi(() => ({})),
    S.withDefaults,
    S.annotate(dictionaryIdentifier, {})
  )
}
