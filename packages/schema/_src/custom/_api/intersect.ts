// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import { augmentRecord } from "../_utils/index.js"
import * as Arbitrary from "../Arbitrary/index.js"
import * as Constructor from "../Constructor/index.js"
import * as Encoder from "../Encoder/index.js"
import * as Guard from "../Guard/index.js"
import * as Parser from "../Parser/index.js"
import * as Th from "../These/index.js"
import { lazy } from "./lazy.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export type IntersectionApi<Self, That> = Self & That extends { props: infer X }
  ? { props: { [k in keyof X]: X[k] } }
  : {}

export type IntersectionSchema<
  Self extends S.SchemaUPI,
  That extends S.SchemaUPI,
  Api
> = DefaultSchema<
  unknown,
  S.ParsedShapeOf<Self> & S.ParsedShapeOf<That>,
  S.ConstructorInputOf<Self> & S.ConstructorInputOf<That>,
  S.EncodedOf<Self> & S.EncodedOf<That>,
  Api
>

export const intersectIdentifier = S.makeAnnotation<{
  self: S.SchemaUPI
  that: S.SchemaUPI
}>()

export function intersect_<
  ParsedShape extends {},
  ConstructorInput,
  Encoded,
  Api,
  ThatParsedShape extends {},
  ThatConstructorInput,
  ThatEncoded,
  ThatApi
>(
  self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  that: S.Schema<unknown, ThatParsedShape, ThatConstructorInput, ThatEncoded, ThatApi>
): DefaultSchema<
  unknown,
  ParsedShape & ThatParsedShape,
  ConstructorInput & ThatConstructorInput,
  Encoded & ThatEncoded,
  IntersectionApi<Api, ThatApi>
> {
  const guardSelf = Guard.for(self)
  const guardThat = Guard.for(that)
  const parseSelf = Parser.for(self)
  const parseThat = Parser.for(that)
  const constructSelf = Constructor.for(self)
  const constructThat = Constructor.for(that)
  const encodeSelf = Encoder.for(self)
  const encodeThat = Encoder.for(that)
  const arbSelf = Arbitrary.for(self)
  const arbThat = Arbitrary.for(that)

  const guard = (u: unknown): u is ParsedShape & ThatParsedShape =>
    guardSelf(u) && guardThat(u)

  return pipe(
    S.identity(guard),
    S.parser((u, env) => {
      const left = Th.result(
        (env?.cache ? env.cache.getOrSetParser(parseSelf) : parseSelf)(u)
      )
      const right = Th.result(
        (env?.cache ? env.cache.getOrSetParser(parseThat) : parseThat)(u)
      )

      let errors = Chunk.empty<S.MemberE<0, any> | S.MemberE<1, any>>()

      let errored = false
      let warned = false

      const intersection = {} as unknown as ParsedShape & ThatParsedShape

      if (left._tag === "Left") {
        errors = errors.append(S.memberE(0, left.left as any))

        errored = true
      } else {
        const warnings = left.right.get(1)
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(0, warnings.value as any))

          warned = true
        }
        Object.assign(intersection, left.right.get(0))
      }
      if (right._tag === "Left") {
        errors = errors.append(S.memberE(1, right.left as any))

        errored = true
      } else {
        const warnings = right.right.get(1)
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(1, warnings.value as any))

          warned = true
        }
        Object.assign(intersection, right.right.get(0))
      }

      if (errored) {
        return Th.fail(S.intersectionE(errors))
      }

      augmentRecord(intersection as {})

      if (warned) {
        return Th.warn(intersection, S.intersectionE(errors))
      }

      return Th.succeed(intersection)
    }),
    S.constructor((u: ConstructorInput & ThatConstructorInput) => {
      const left = Th.result(constructSelf(u))
      const right = Th.result(constructThat(u))

      let errors = Chunk.empty<S.MemberE<0, any> | S.MemberE<1, any>>()

      let errored = false
      let warned = false

      const intersection = {} as unknown as ParsedShape & ThatParsedShape

      if (left._tag === "Left") {
        errors = errors.append(S.memberE(0, left.left as any))

        errored = true
      } else {
        const warnings = left.right.get(1)
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(0, warnings.value as any))

          warned = true
        }
        Object.assign(intersection, left.right.get(0))
      }
      if (right._tag === "Left") {
        errors = errors.append(S.memberE(1, right.left as any))

        errored = true
      } else {
        const warnings = right.right.get(1)
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(1, warnings.value as any))

          warned = true
        }
        Object.assign(intersection, right.right.get(0))
      }

      if (errored) {
        return Th.fail(S.intersectionE(errors))
      }

      augmentRecord(intersection as unknown as {})

      if (warned) {
        return Th.warn(intersection, S.intersectionE(errors))
      }

      return Th.succeed(intersection)
    }),
    S.encoder((_): Encoded & ThatEncoded => ({
      ...encodeSelf(_),
      ...encodeThat(_),
    })),
    S.arbitrary((FC) => {
      const self = arbSelf(FC)
      const that = arbThat(FC)
      return self.chain((a) => that.map((b) => ({ ...a, ...b })))
    }),
    S.mapApi(() => {
      const props = {}
      const anySelfApi = self.Api as any
      if ("props" in anySelfApi) {
        for (const k of Object.keys(anySelfApi["props"])) {
          props[k] = self.Api["props"][k]
        }
      }
      const anyThatApi = that.Api as any
      if ("props" in anyThatApi) {
        for (const k of Object.keys(anyThatApi["props"] as any)) {
          props[k] = anyThatApi["props"][k]
        }
      }
      if (Object.keys(props).length > 0) {
        return { props } as IntersectionApi<Api, ThatApi>
      }
      return {} as IntersectionApi<Api, ThatApi>
    }),
    withDefaults,
    S.annotate(intersectIdentifier, { self, that })
  )
}

export function intersect<
  ThatParsedShape extends {},
  ThatConstructorInput,
  ThatEncoded,
  ThatApi
>(
  that: S.Schema<unknown, ThatParsedShape, ThatConstructorInput, ThatEncoded, ThatApi>
): <ParsedShape extends {}, ConstructorInput, Encoded, Api>(
  self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) => DefaultSchema<
  unknown,
  ParsedShape & ThatParsedShape,
  ConstructorInput & ThatConstructorInput,
  Encoded & ThatEncoded,
  IntersectionApi<Api, ThatApi>
> {
  return (self) => intersect_(self, that)
}

export function intersectLazy<
  ThatParsedShape extends {},
  ThatConstructorInput,
  ThatEncoded,
  ThatApi
>(
  that: () => S.Schema<
    unknown,
    ThatParsedShape,
    ThatConstructorInput,
    ThatEncoded,
    ThatApi
  >
) {
  return <ParsedShape extends {}, ConstructorInput, Encoded, Api>(
    self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
  ): DefaultSchema<
    unknown,
    ParsedShape & ThatParsedShape,
    ConstructorInput & ThatConstructorInput,
    Encoded & ThatEncoded,
    Api
  > => {
    return pipe(
      intersect_(self, lazy(that)),
      S.mapApi(() => self.Api),
      withDefaults
    )
  }
}
