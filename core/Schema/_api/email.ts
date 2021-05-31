/* eslint-disable @typescript-eslint/ban-types */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe, Refinement } from "../../Function"
import { isValidEmail } from "../../validation"
import * as S from "../_schema"
import {
  brand,
  DefaultSchema,
  fromString,
  nonEmpty,
  NonEmptyString,
  parseUuidE,
  string,
} from "../_schema"

// TODO: openapi meta: format: email

export interface EmailBrand {
  readonly Email: unique symbol
}

export type Email = NonEmptyString & EmailBrand

export const EmailFromStringIdentifier = S.makeAnnotation<{}>()

const isEmail: Refinement<string, Email> = (s: string): s is Email => {
  return isValidEmail(s)
}

export const EmailFromString: DefaultSchema<
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  Email,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  {}
> = pipe(
  fromString,
  S.arbitrary((FC) => FC.emailAddress()),
  nonEmpty,
  S.mapParserError((_) => CNK.unsafeHead(_.errors).error),
  S.mapConstructorError((_) => CNK.unsafeHead(_.errors).error),
  S.refine(isEmail, (n) => S.leafE(parseUuidE(n))),
  brand<Email>(),
  S.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = S.makeAnnotation<{}>()

export const Email: DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.ParseStringE>>>
    | S.NextE<
        S.CompositionE<
          | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
          | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
        >
      >
  >,
  Email,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  S.ApiSelfType<Email>
> = pipe(
  string[">>>"](EmailFromString),
  brand<Email>(),
  S.annotate(EmailIdentifier, {})
)
