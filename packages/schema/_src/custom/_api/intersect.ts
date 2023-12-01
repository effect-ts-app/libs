// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import { augmentRecord } from "../_utils.js"
import * as Arbitrary from "../Arbitrary.js"
import * as Constructor from "../Constructor.js"
import * as Encoder from "../Encoder.js"
import * as Guard from "../Guard.js"
import * as Parser from "../Parser.js"
import * as Th from "../These.js"
import { lazy } from "./lazy.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export type IntersectionApi<Self, That> = Self & That extends { fields: infer X } ? { fields: { [k in keyof X]: X[k] } }
  : {}

export type IntersectionSchema<
  Self extends S.SchemaUPI,
  That extends S.SchemaUPI,
  Api
> = DefaultSchema<
  unknown,
  S.To<Self> & S.To<That>,
  S.ConstructorInputOf<Self> & S.ConstructorInputOf<That>,
  S.From<Self> & S.From<That>,
  Api
>

export const intersectIdentifier = S.makeAnnotation<{
  self: S.SchemaUPI
  that: S.SchemaUPI
}>()

export function intersect_<
  To extends {},
  ConstructorInput,
  From,
  Api,
  ThatTo extends {},
  ThatConstructorInput,
  ThatFrom,
  ThatApi
>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>,
  that: S.Schema<unknown, ThatTo, ThatConstructorInput, ThatFrom, ThatApi>
): DefaultSchema<
  unknown,
  To & ThatTo,
  ConstructorInput & ThatConstructorInput,
  From & ThatFrom,
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

  const guard = (u: unknown): u is To & ThatTo => guardSelf(u) && guardThat(u)

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

      const intersection = {} as unknown as To & ThatTo

      if (left._tag === "Left") {
        errors = errors.append(S.memberE(0, left.left))

        errored = true
      } else {
        const warnings = left.right[1]
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(0, warnings.value))

          warned = true
        }
        Object.assign(intersection, left.right[0])
      }
      if (right._tag === "Left") {
        errors = errors.append(S.memberE(1, right.left))

        errored = true
      } else {
        const warnings = right.right[1]
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(1, warnings.value))

          warned = true
        }
        Object.assign(intersection, right.right[0])
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

      const intersection = {} as unknown as To & ThatTo

      if (left._tag === "Left") {
        errors = errors.append(S.memberE(0, left.left))

        errored = true
      } else {
        const warnings = left.right[1]
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(0, warnings.value))

          warned = true
        }
        Object.assign(intersection, left.right[0])
      }
      if (right._tag === "Left") {
        errors = errors.append(S.memberE(1, right.left))

        errored = true
      } else {
        const warnings = right.right[1]
        if (warnings._tag === "Some") {
          errors = errors.append(S.memberE(1, warnings.value))

          warned = true
        }
        Object.assign(intersection, right.right[0])
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
    S.encoder((_): From & ThatFrom => ({
      ...encodeSelf(_),
      ...encodeThat(_)
    })),
    S.arbitrary((FC) => {
      const self = arbSelf(FC)
      const that = arbThat(FC)
      return self.chain((a) => that.map((b) => ({ ...a, ...b })))
    }),
    S.mapApi(() => {
      const fields = {}
      const anySelfApi = self.Api as any
      if ("fields" in anySelfApi) {
        for (const k of Object.keys(anySelfApi["fields"])) {
          fields[k] = self.Api["fields"][k]
        }
      }
      const anyThatApi = that.Api as any
      if ("fields" in anyThatApi) {
        for (const k of Object.keys(anyThatApi["fields"])) {
          fields[k] = anyThatApi["fields"][k]
        }
      }
      if (Object.keys(fields).length > 0) {
        return { fields } as IntersectionApi<Api, ThatApi>
      }
      return {} as IntersectionApi<Api, ThatApi>
    }),
    withDefaults,
    S.annotate(intersectIdentifier, { self, that })
  )
}

export function intersect<
  ThatTo extends {},
  ThatConstructorInput,
  ThatFrom,
  ThatApi
>(
  that: S.Schema<unknown, ThatTo, ThatConstructorInput, ThatFrom, ThatApi>
): <To extends {}, ConstructorInput, From, Api>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>
) => DefaultSchema<
  unknown,
  To & ThatTo,
  ConstructorInput & ThatConstructorInput,
  From & ThatFrom,
  IntersectionApi<Api, ThatApi>
> {
  return (self) => intersect_(self, that)
}

export function intersectLazy<
  ThatTo extends {},
  ThatConstructorInput,
  ThatFrom,
  ThatApi
>(
  that: () => S.Schema<
    unknown,
    ThatTo,
    ThatConstructorInput,
    ThatFrom,
    ThatApi
  >
) {
  return <To extends {}, ConstructorInput, From, Api>(
    self: S.Schema<unknown, To, ConstructorInput, From, Api>
  ): DefaultSchema<
    unknown,
    To & ThatTo,
    ConstructorInput & ThatConstructorInput,
    From & ThatFrom,
    Api
  > => {
    return pipe(
      intersect_(self, lazy(that)),
      S.mapApi(() => self.Api),
      withDefaults
    )
  }
}
