/* eslint-disable @typescript-eslint/ban-types */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe, Refinement } from "../../Function"
import { isValidEmail } from "../../validation"
import * as MO from "../_schema"
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

export const EmailFromStringIdentifier = MO.makeAnnotation<{}>()

const isEmail: Refinement<string, Email> = (s: string): s is Email => {
  return isValidEmail(s)
}

export const EmailFromString: DefaultSchema<
  string,
  MO.CompositionE<
    | MO.NextE<MO.RefinementE<MO.LeafE<MO.ParseUuidE>>>
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<string>>>>
  >,
  Email,
  string,
  MO.CompositionE<
    | MO.NextE<MO.RefinementE<MO.LeafE<MO.ParseUuidE>>>
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<string>>>>
  >,
  string,
  {}
> = pipe(
  fromString,
  MO.arbitrary((FC) => FC.emailAddress()),
  nonEmpty,
  MO.mapParserError((_) => CNK.unsafeHead(_.errors).error),
  MO.mapConstructorError((_) => CNK.unsafeHead(_.errors).error),
  MO.refine(isEmail, (n) => MO.leafE(parseUuidE(n))),
  brand<Email>(),
  MO.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = MO.makeAnnotation<{}>()

export const Email: DefaultSchema<
  unknown,
  MO.CompositionE<
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.ParseStringE>>>
    | MO.NextE<
        MO.CompositionE<
          | MO.NextE<MO.RefinementE<MO.LeafE<MO.ParseUuidE>>>
          | MO.PrevE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<string>>>>
        >
      >
  >,
  Email,
  string,
  MO.CompositionE<
    | MO.NextE<MO.RefinementE<MO.LeafE<MO.ParseUuidE>>>
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<string>>>>
  >,
  string,
  MO.ApiSelfType<Email>
> = pipe(
  string[">>>"](EmailFromString),
  brand<Email>(),
  MO.annotate(EmailIdentifier, {})
)
