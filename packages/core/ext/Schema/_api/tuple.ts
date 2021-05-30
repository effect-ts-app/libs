/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"
import * as S from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"

export const fromTupleIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

// TODO: any sized tuple
export function fromTuple<
  KeyParserInput,
  KeyParserError extends S.AnyError,
  KeyParsedShape,
  KeyConstructorInput,
  KeyConstructorError extends S.AnyError,
  KeyEncoded,
  KeyApi,
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  key: S.Schema<
    KeyParserInput,
    KeyParserError,
    KeyParsedShape,
    KeyConstructorInput,
    KeyConstructorError,
    KeyEncoded,
    KeyApi
  >,
  self: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  readonly (KeyParserInput | ParserInput)[],
  S.CollectionE<S.OptionalIndexE<number, KeyParserError | ParserError>>,
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  S.LeafE<S.UnknownArrayE>,
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
    const e = Chunk.builder<S.OptionalIndexE<number, KeyParserError | ParserError>>()
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
          e.append(S.optionalIndexE(0, keyW.value))
        }
        const w = res.right.get(1)
        if (w._tag === "Some") {
          warn = true
          e.append(S.optionalIndexE(1, w.value))
        }
        v = [keyRes.right.get(0), res.right.get(0)] as const
      }
    } else {
      err = true
      if (keyRes._tag === "Left") {
        e.append(S.optionalIndexE(0, keyRes.left))
      }

      if (res._tag === "Left") {
        e.append(S.optionalIndexE(1, res.left))
      }
    }
    if (err) {
      return Th.fail(S.chunkE(e.build()))
    }
    if (warn) {
      return Th.warn(v!, S.chunkE(e.build()))
    }
    return Th.succeed(v!)
  }

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.tuple(keyArb(_), arb(_))),
    S.parser(parseTup),
    S.constructor((i: Iterable<KeyParsedShape | ParsedShape>) => {
      const t = Array.from(i)
      return refinement(t)
        ? Th.succeed(t as readonly [KeyParsedShape, ParsedShape])
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
  KeyParserError extends S.AnyError,
  KeyParsedShape,
  KeyConstructorInput,
  KeyConstructorError extends S.AnyError,
  KeyEncoded,
  KeyApi,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  key: S.Schema<
    unknown,
    KeyParserError,
    KeyParsedShape,
    KeyConstructorInput,
    KeyConstructorError,
    KeyEncoded,
    KeyApi
  >,
  self: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.UnknownArrayE>>>
    | S.NextE<S.CollectionE<S.OptionalIndexE<number, KeyParserError | ParserError>>>
  >,
  readonly [KeyParsedShape, ParsedShape],
  Iterable<KeyParsedShape | ParsedShape>,
  S.LeafE<S.UnknownArrayE>,
  readonly [KeyEncoded, Encoded],
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
