/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as MO from "../custom/index.js"
import * as Arbitrary from "../custom/Arbitrary/index.js"
import * as Encoder from "../custom/Encoder/index.js"
import * as Guard from "../custom/Guard/index.js"
import * as Parser from "../custom/Parser/index.js"
import { ParserEnv } from "../custom/Parser/index.js"
import * as Th from "../custom/These/index.js"

export const fromTupleIdentifier = MO.makeAnnotation<{ self: MO.SchemaAny }>()

// TODO: any sized tuple
export function fromTuple<
  KeyParserInput,
  KeyParsedShape,
  KeyConstructorInput,
  KeyEncoded,
  KeyApi,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  key: MO.Schema<
    KeyParserInput,
    KeyParsedShape,
    KeyConstructorInput,
    KeyEncoded,
    KeyApi
  >,
  self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  readonly (KeyParserInput | ParserInput)[],
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  readonly [KeyEncoded, Encoded],
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

  const refinement = (_: unknown): _ is readonly [KeyParsedShape, ParsedShape] =>
    Array.isArray(_) && keyGuard(_[0]) && guard(_[1])

  const parseTup = (i: readonly (KeyParserInput | ParserInput)[], env?: ParserEnv) => {
    const e = Chunk.builder<MO.OptionalIndexE<number, any>>()
    let err = false
    let warn = false

    let v: readonly [KeyParsedShape, ParsedShape] | undefined

    const keyParsev2 = env?.cache ? env.cache.getOrSetParser(keyParse) : keyParse
    const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse

    const keyRes = Th.result(keyParsev2(i[0] as any))
    const res = Th.result(parsev2(i[1] as any))
    if (keyRes._tag === "Right" && res._tag === "Right") {
      if (!err) {
        const keyW = keyRes.right.get(1)
        if (keyW._tag === "Some") {
          warn = true
          e.append(MO.optionalIndexE(0, keyW.value))
        }
        const w = res.right.get(1)
        if (w._tag === "Some") {
          warn = true
          e.append(MO.optionalIndexE(1, w.value))
        }
        v = [keyRes.right.get(0), res.right.get(0)] as const
      }
    } else {
      err = true
      if (keyRes._tag === "Left") {
        e.append(MO.optionalIndexE(0, keyRes.left))
      }

      if (res._tag === "Left") {
        e.append(MO.optionalIndexE(1, res.left))
      }
    }
    if (err) {
      return Th.fail(MO.chunkE(e.build()))
    }
    if (warn) {
      return Th.warn(v!, MO.chunkE(e.build()))
    }
    return Th.succeed(v!)
  }

  return pipe(
    MO.identity(refinement),
    MO.arbitrary((_) => _.tuple(keyArb(_), arb(_))),
    MO.parser(parseTup),
    MO.constructor((i: Iterable<KeyParsedShape | ParsedShape>) => {
      const t = Array.from(i)
      return refinement(t)
        ? Th.succeed(t as readonly [KeyParsedShape, ParsedShape])
        : Th.fail(MO.leafE(MO.unknownArrayE(t)))
    }),
    MO.encoder((_) => [keyEncode(_[0]), encode(_[1])] as const),
    MO.mapApi(() => ({ self: self.Api })),
    MO.withDefaults,
    MO.annotate(fromTupleIdentifier, { self })
  )
}

export const tupleIdentifier = MO.makeAnnotation<{ self: MO.SchemaAny }>()

export function tuple<
  ParsedShape,
  Encoded,
  KeyParsedShape,
  KeyConstructorInput,
  KeyEncoded,
  KeyApi,
  ConstructorInput,
  Api
>(
  key: MO.Schema<unknown, KeyParsedShape, KeyConstructorInput, KeyEncoded, KeyApi>,
  self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  unknown,
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  readonly [KeyEncoded, Encoded],
  { self: Api }
> {
  const encodeKey = Encoder.for(key)
  const encodeSelf = Encoder.for(self)
  return pipe(
    MO.unknownArray[">>>"](fromTuple(key, self)),
    MO.encoder((_) => [encodeKey(_[0]), encodeSelf(_[1])] as const),
    MO.withDefaults,
    MO.annotate(tupleIdentifier, { self })
  )
}
