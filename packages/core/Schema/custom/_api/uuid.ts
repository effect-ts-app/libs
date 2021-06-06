import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import type { Refinement } from "@effect-ts/core/Function"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import { parseUuidE } from "../_schema"
import { brand } from "./brand"
import { nonEmpty } from "./nonEmpty"
import type { NonEmptyString } from "./nonEmptyString"
import { fromString, string } from "./string"
import type { DefaultSchema } from "./withDefaults"

export interface UUIDBrand {
  readonly UUID: unique symbol
}

export const regexUUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type UUID = NonEmptyString & UUIDBrand

export const UUIDFromStringIdentifier = S.makeAnnotation<{}>()

const isUUID: Refinement<string, UUID> = (s: string): s is UUID => {
  return regexUUID.test(s)
}

export const UUIDFromString: DefaultSchema<
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  UUID,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  {}
> = pipe(
  fromString,
  S.arbitrary((FC) => FC.uuid()),
  nonEmpty,
  S.mapParserError((_) => Chunk.unsafeHead(_.errors).error),
  S.mapConstructorError((_) => Chunk.unsafeHead(_.errors).error),
  S.refine(isUUID, (n) => S.leafE(parseUuidE(n))),
  brand<UUID>(),
  S.annotate(UUIDFromStringIdentifier, {})
)

export const UUIDIdentifier = S.makeAnnotation<{}>()

export const UUID: DefaultSchema<
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
  UUID,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  S.ApiSelfType<UUID>
> = pipe(string[">>>"](UUIDFromString), brand<UUID>(), S.annotate(UUIDIdentifier, {}))
