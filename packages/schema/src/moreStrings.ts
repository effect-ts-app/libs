import type { Refinement } from "@effect-app/core/Function"
import { extendM } from "@effect-app/core/utils"
import type { LazyArbitrary } from "@effect/schema/Arbitrary"
import * as S from "@effect/schema/Schema"
import { pipe } from "effect"
import type { Simplify } from "effect/Types"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import validator from "validator"
import { fromBrand, nominal } from "./brand.js"
import type { WithDefaults } from "./ext.js"
import { withDefaults } from "./ext.js"
import { type B } from "./schema.js"
import { NonEmptyString } from "./strings.js"
import type { NonEmptyString255Brand, NonEmptyString2k, NonEmptyStringBrand } from "./strings.js"

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export interface NonEmptyString50Brand extends Simplify<B.Brand<"NonEmptyString50"> & NonEmptyString255Brand> {}

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export type NonEmptyString50 = string & NonEmptyString50Brand

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export const NonEmptyString50 = NonEmptyString.pipe(
  S.maxLength(50),
  fromBrand(nominal<NonEmptyString2k>(), { identifier: "NonEmptyString50", title: "NonEmptyString50", jsonSchema: {} }),
  withDefaults
)

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export interface Min3String255Brand extends Simplify<B.Brand<"Min3String255"> & NonEmptyString255Brand> {}

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export type Min3String255 = string & Min3String255Brand

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export const Min3String255 = pipe(
  S.String,
  S.minLength(3),
  S.maxLength(255),
  fromBrand(nominal<NonEmptyString2k>(), { identifier: "Min3String255", title: "Min3String255", jsonSchema: {} }),
  withDefaults
)

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export interface StringIdBrand extends Simplify<B.Brand<"StringId"> & NonEmptyString50Brand> {}

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export type StringId = string & StringIdBrand

const makeStringId = (): StringId => nanoid() as unknown as StringId
const minLength = 6
const maxLength = 50
const size = 21
const length = 10 * size
const StringIdArb = (): LazyArbitrary<string> => (fc) =>
  fc
    .uint8Array({ minLength: length, maxLength: length })
    .map((_) => customRandom(urlAlphabet, size, (size) => _.subarray(0, size))())

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export const StringId = extendM(
  pipe(
    S.String,
    S.minLength(minLength),
    S.maxLength(maxLength),
    fromBrand(nominal<StringIdBrand>(), {
      identifier: "StringId",
      title: "StringId",
      arbitrary: StringIdArb,
      jsonSchema: {}
    })
  ),
  (s) => ({
    generate: makeStringId,
    withDefault: s.pipe(S.withDefaultConstructor(makeStringId))
  })
)
  .pipe(withDefaults)

// const prefixedStringIdUnsafe = (prefix: string) => StringId(prefix + StringId.generate())

// const prefixedStringIdUnsafeThunk = (prefix: string) => () => prefixedStringIdUnsafe(prefix)

export function prefixedStringId<Brand extends StringId>() {
  return <Prefix extends string, Separator extends string = "-">(
    prefix: Prefix,
    name: string,
    separator?: Separator
  ) => {
    type FullPrefix = `${Prefix}${Separator}`
    const pref = `${prefix}${separator ?? "-"}` as FullPrefix
    const arb = (): LazyArbitrary<string & Brand> => (fc) =>
      StringIdArb()(fc).map(
        (x) => (pref + x.substring(0, 50 - pref.length)) as Brand
      )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const s: S.Schema<string & Brand, string> = StringId
      .pipe(
        S.filter((x: StringId): x is string & Brand => x.startsWith(pref), {
          arbitrary: arb,
          identifier: name,
          title: name
        })
      )
    const schema = s.pipe(withDefaults)
    const generate = () => (pref + StringId.generate().substring(0, 50 - pref.length)) as Brand

    return extendM(
      schema,
      (ex): PrefixedStringUtils<Brand, Prefix, Separator> => ({
        generate,
        /**
         * Automatically adds the prefix.
         */
        unsafeFrom: (str: string) => ex(pref + str),
        /**
         * Must provide a literal string starting with prefix.
         */
        prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => ex(str),
        prefix,
        withDefault: schema.pipe(S.withDefaultConstructor(generate))
      })
    )
  }
}

export const brandedStringId = <
  Brand extends StringIdBrand
>() =>
  withDefaults(
    Object.assign(Object.create(StringId), StringId) as S.Schema<string & Brand, string> & {
      generate: () => string & Brand
      withDefault: S.PropertySignature<":", string & Brand, never, ":", string, true, never>
    } & WithDefaults<S.Schema<string & Brand, string>>
  )

export interface PrefixedStringUtils<
  Brand extends StringId,
  Prefix extends string,
  Separator extends string
> {
  readonly generate: () => Brand
  readonly unsafeFrom: (str: string) => Brand
  prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => Brand
  readonly prefix: Prefix
  readonly withDefault: S.PropertySignature<":", Brand, never, ":", string, true, never>
}

export interface UrlBrand extends Simplify<B.Brand<"Url"> & NonEmptyStringBrand> {}

export type Url = string & UrlBrand

const isUrl: Refinement<string, Url> = (s: string): s is Url => {
  return validator.default.isURL(s, { require_tld: false })
}

export const Url = S
  .String
  .pipe(
    S.filter(isUrl, {
      arbitrary: (): LazyArbitrary<Url> => (fc) => fc.webUrl().map((_) => _ as Url),
      identifier: "Url",
      title: "Url",
      jsonSchema: { format: "uri" }
    }),
    withDefaults
  )
