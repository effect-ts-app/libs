/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import type { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"

export const fromTupleIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

// TODO: any sized tuple
export function fromTuple<
  KeyParserInput,
  KeyTo,
  KeyConstructorInput,
  KeyFrom,
  KeyApi,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(
  key: S.Schema<
    KeyParserInput,
    KeyTo,
    KeyConstructorInput,
    KeyFrom,
    KeyApi
  >,
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  readonly (KeyParserInput | ParserInput)[],
  readonly [KeyTo, To],
  Iterable<KeyTo | To>,
  readonly [KeyFrom, From],
  { self: Api }
> {
  const keyGuard = Guard.for(key)
  const keyArb = Arbitrary.for(key)
  const keyParse = Parser.for(key)
  const keyEncode = Encoder.for(key)

  const guard = Guard.for(self)
  const arb = Arbitrary.for(self)
  const parse = Parser.for(self)
  const encode = Encoder.for(self)

  const refinement = (_: unknown): _ is readonly [KeyTo, To] => Array.isArray(_) && keyGuard(_[0]) && guard(_[1])

  const parseTup = (i: readonly (KeyParserInput | ParserInput)[], env?: ParserEnv) => {
    const e: S.OptionalIndexE<number, any>[] = []
    let err = false
    let warn = false

    let v: readonly [KeyTo, To] | undefined

    const keyParsev2 = env?.cache ? env.cache.getOrSetParser(keyParse) : keyParse
    const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse

    const keyRes = Th.result(keyParsev2(i[0] as any))
    const res = Th.result(parsev2(i[1] as any))
    if (keyRes._tag === "Right" && res._tag === "Right") {
      if (!err) {
        const keyW = keyRes.right[1]
        if (keyW._tag === "Some") {
          warn = true
          e.push(S.optionalIndexE(0, keyW.value))
        }
        const w = res.right[1]
        if (w._tag === "Some") {
          warn = true
          e.push(S.optionalIndexE(1, w.value))
        }
        v = [keyRes.right[0], res.right[0]] as const
      }
    } else {
      err = true
      if (keyRes._tag === "Left") {
        e.push(S.optionalIndexE(0, keyRes.left))
      }

      if (res._tag === "Left") {
        e.push(S.optionalIndexE(1, res.left))
      }
    }
    if (err) {
      return Th.fail(S.chunkE(e.toChunk))
    }
    if (warn) {
      return Th.warn(v!, S.chunkE(e.toChunk))
    }
    return Th.succeed(v!)
  }

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.tuple(keyArb(_), arb(_))),
    S.parser(parseTup),
    S.constructor((i: Iterable<KeyTo | To>) => {
      const t = Array.from(i)
      return refinement(t)
        ? Th.succeed(t as readonly [KeyTo, To])
        : Th.fail(S.leafE(S.unknownArrayE(t)))
    }),
    S.encoder((_) => [keyEncode(_[0]), encode(_[1])] as const),
    S.mapApi(() => ({ self: self.Api })),
    S.withDefaults,
    S.annotate(fromTupleIdentifier, { self })
  )
}

export const tupleIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function tuple<
  To,
  From,
  KeyTo,
  KeyConstructorInput,
  KeyFrom,
  KeyApi,
  ConstructorInput,
  Api
>(
  key: S.Schema<unknown, KeyTo, KeyConstructorInput, KeyFrom, KeyApi>,
  self: S.Schema<unknown, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  unknown,
  readonly [KeyTo, To],
  Iterable<KeyTo | To>,
  readonly [KeyFrom, From],
  { self: Api }
> {
  const encodeKey = Encoder.for(key)
  const encodeSelf = Encoder.for(self)
  return pipe(
    S.unknownArray[">>>"](fromTuple(key, self)),
    S.encoder((_) => [encodeKey(_[0]), encodeSelf(_[1])] as const),
    S.withDefaults,
    S.annotate(tupleIdentifier, { self })
  )
}
