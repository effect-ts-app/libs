/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import type { Dictionary } from "@effect-ts/core/Collections/Immutable/Dictionary"
import { pipe } from "@effect-ts/core/Function"

import { augmentRecord } from "../custom/_utils/index.js"
import * as Arbitrary from "../custom/Arbitrary/index.js"
import * as Encoder from "../custom/Encoder/index.js"
import * as Guard from "../custom/Guard/index.js"
import * as MO from "../custom/index.js"
import * as Parser from "../custom/Parser/index.js"
import { ParserEnv } from "../custom/Parser/index.js"
import * as Th from "../custom/These/index.js"

export const dictionaryIdentifier = MO.makeAnnotation<{}>()

export type ParserErrorFromDictionary = MO.CompositionE<
  MO.PrevE<MO.LeafE<MO.UnknownRecordE>> | MO.NextE<MO.LeafE<MO.ParseObjectE>>
> // TODO

export function dictionary<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  unknown,
  Dictionary<ParsedShape>,
  Dictionary<ParsedShape>,
  Dictionary<Encoded>,
  {}
> {
  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const parse = Parser.for(self)
  const encode = Encoder.for(self)

  function parser(
    _: unknown,
    env?: ParserEnv
  ): Th.These<ParserErrorFromDictionary, Dictionary<ParsedShape>> {
    if (typeof _ !== "object" || _ === null) {
      return Th.fail(
        MO.compositionE(Chunk.single(MO.prevE(MO.leafE(MO.unknownRecordE(_)))))
      )
    }
    let errors = Chunk.empty<
      MO.OptionalKeyE<string, unknown> | MO.RequiredKeyE<string, unknown>
    >()

    let isError = false

    const result = {}

    const keys = Object.keys(_)

    const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse

    for (const key of keys) {
      const res = parsev2(_[key])

      if (res.effect._tag === "Left") {
        errors = errors.append(MO.requiredKeyE(key, res.effect.left))
        isError = true
      } else {
        result[key] = res.effect.right.get(0)

        const warnings = res.effect.right.get(1)

        if (warnings._tag === "Some") {
          errors = errors.append(MO.requiredKeyE(key, warnings.value))
        }
      }
    }

    if (!isError) {
      augmentRecord(result)
    }

    if (errors.isEmpty) {
      return Th.succeed(result as Dictionary<ParsedShape>)
    }

    const error_ = MO.compositionE(Chunk.single(MO.nextE(MO.structE(errors))))
    const error = error_

    if (isError) {
      // @ts-expect-error doc
      return Th.fail(error)
    }

    // @ts-expect-error doc
    return Th.warn(result, error)
  }

  const refine = (u: unknown): u is Dictionary<ParsedShape> =>
    typeof u === "object" &&
    u != null &&
    !Object.keys(u).every((x) => typeof x === "string" && Object.values(u).every(guard))

  return pipe(
    MO.refinement(refine, (v) => MO.leafE(MO.parseObjectE(v))),
    MO.constructor((s: Dictionary<ParsedShape>) => Th.succeed(s)),
    MO.arbitrary((_) => _.dictionary<ParsedShape>(_.string(), arb(_))),
    MO.parser(parser),
    MO.encoder((_) =>
      Object.keys(_).reduce((prev, cur) => {
        prev[cur] = encode(_[cur])
        return prev
      }, {} as Record<string, Encoded>)
    ),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(dictionaryIdentifier, {})
  )
}
