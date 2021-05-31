/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"
import * as MO from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"

export const fromTupleIdentifier = MO.makeAnnotation<{ self: MO.SchemaAny }>()

// TODO: any sized tuple
export function fromTuple<
  KeyParserInput,
  KeyParserError extends MO.AnyError,
  KeyParsedShape,
  KeyConstructorInput,
  KeyConstructorError extends MO.AnyError,
  KeyEncoded,
  KeyApi,
  ParserInput,
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api
>(
  key: MO.Schema<
    KeyParserInput,
    KeyParserError,
    KeyParsedShape,
    KeyConstructorInput,
    KeyConstructorError,
    KeyEncoded,
    KeyApi
  >,
  self: MO.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): MO.DefaultSchema<
  readonly (KeyParserInput | ParserInput)[],
  MO.CollectionE<MO.OptionalIndexE<number, KeyParserError | ParserError>>,
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  MO.LeafE<MO.UnknownArrayE>,
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

  const parseTup = (i: readonly (KeyParserInput | ParserInput)[]) => {
    const e = Chunk.builder<MO.OptionalIndexE<number, KeyParserError | ParserError>>()
    let err = false
    let warn = false

    let v: readonly [KeyParsedShape, ParsedShape] | undefined

    const keyRes = Th.result(keyParse(i[0] as any))
    const res = Th.result(parse(i[1] as any))
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
  KeyParserError extends MO.AnyError,
  KeyParsedShape,
  KeyConstructorInput,
  KeyConstructorError extends MO.AnyError,
  KeyEncoded,
  KeyApi,
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api
>(
  key: MO.Schema<
    unknown,
    KeyParserError,
    KeyParsedShape,
    KeyConstructorInput,
    KeyConstructorError,
    KeyEncoded,
    KeyApi
  >,
  self: MO.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): MO.DefaultSchema<
  unknown,
  MO.CompositionE<
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.UnknownArrayE>>>
    | MO.NextE<MO.CollectionE<MO.OptionalIndexE<number, KeyParserError | ParserError>>>
  >,
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  MO.LeafE<MO.UnknownArrayE>,
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
