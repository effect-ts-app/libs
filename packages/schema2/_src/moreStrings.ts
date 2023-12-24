import type { Refinement } from "@effect-app/core/Function"
import { extendM } from "@effect-app/core/utils"
import type { Arbitrary } from "@effect/schema/Arbitrary"
import { TitleAnnotationId } from "@effect/schema/AST"
import { pipe } from "effect"
import type { Simplify } from "effect/Types"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import validator from "validator"
import { fromBrand, nominal } from "./ext.js"
import { A, type B, S } from "./schema.js"
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
  S.string,
  S.minLength(3),
  S.maxLength(255),
  S.annotations({ [TitleAnnotationId]: "Min3String255" }),
  fromBrand(nominal<NonEmptyString2k>())
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
const StringIdArb = (): Arbitrary<string> => (fc) =>
  fc
    .uint8Array({ minLength, maxLength })
    .map((_) => customRandom(urlAlphabet, maxLength, (size) => _.subarray(0, size))())

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export const StringId = extendM(
  pipe(
    S.string,
    S.minLength(minLength),
    S.maxLength(maxLength),
    S.annotations({
      [TitleAnnotationId]: "StringId",
      [A.ArbitraryHookId]: StringIdArb
    }),
    fromBrand(nominal<StringIdBrand>())
  ),
  (s) => ({
    make: makeStringId,
    withDefault: S.optional(s, { default: makeStringId })
  })
)

const prefixedStringIdUnsafe = (prefix: string) => StringId(prefix + StringId.make())

const prefixedStringIdUnsafeThunk = (prefix: string) => () => prefixedStringIdUnsafe(prefix)

export function prefixedStringId<Brand extends StringId>() {
  return <Prefix extends string, Separator extends string = "-">(
    prefix: Prefix,
    name: string,
    separator?: Separator
  ) => {
    type FullPrefix = `${Prefix}${Separator}`
    // type PrefixedId = `${FullPrefix}${string}`

    const pref = `${prefix}${separator ?? "-"}` as FullPrefix
    // const fromString = pipe(
    //   stringIdFromString,
    //   refine(
    //     refinement,
    //     (n) => leafE(customE(n, `a StringId prefixed with '${pref}'`))
    //   ),
    //   arbitrary((FC) =>
    //     stringIdArb(FC).map(
    //       (x) => (pref + x.substring(0, 50 - pref.length)) as Brand
    //     )
    //   )
    // )
    const arb = (): Arbitrary<string> => (fc) =>
      StringIdArb()(fc).map(
        (x) => (pref + x.substring(0, 50 - pref.length)) as Brand
      )
    const schema = StringId.pipe(
      S.filter((x: StringId): x is Brand => x.startsWith(pref), { arbitrary: arb, title: name })
    )
    const make = () => (pref + StringId.make().substring(0, 50 - pref.length)) as Brand

    return extendM(
      schema,
      (ex): PrefixedStringUtils<Brand, Prefix, Separator> => ({
        make,
        /**
         * Automatically adds the prefix.
         */
        unsafeFrom: (str: string) => ex(pref + str),
        /**
         * Must provide a literal string starting with prefix.
         */
        prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => ex(str),
        prefix,
        withDefault: S.optional(schema, { default: make })
      })
    )
  }
}

// export const brandedStringId = <Brand extends StringId>() =>
//   extendM(StringId.pipe(S.brand<Brand>()), (s) => {
//     const make = (): Brand => StringId.make() as unknown as Brand

//     return ({
//       make,
//       withDefault: S.optional(s, { default: make })
//     })
//   })

export interface PrefixedStringUtils<
  Brand extends StringId,
  Prefix extends string,
  Separator extends string
> {
  readonly make: () => Brand
  readonly unsafeFrom: (str: string) => Brand
  prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => Brand
  readonly prefix: Prefix
  readonly withDefault: S.PropertySignature<string | undefined, true, Brand, false>
}

export interface UrlBrand extends Simplify<B.Brand<"Url"> & NonEmptyStringBrand> {}

export type Url = NonEmptyString & UrlBrand

const isUrl: Refinement<string, Url> = (s: string): s is Url => {
  return validator.default.isURL(s, { require_tld: false })
}

export const Url = NonEmptyString.pipe(
  S.annotations({ [A.ArbitraryHookId]: (): Arbitrary<string> => (fc) => fc.webUrl() }),
  S.filter(isUrl),
  fromBrand(nominal<UrlBrand>())
)
