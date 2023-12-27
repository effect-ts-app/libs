import type { Refinement } from "@effect-app/core/Function"
import { extendM } from "@effect-app/core/utils"
import type { Arbitrary } from "@effect/schema/Arbitrary"
import { pipe } from "effect"
import type { Simplify } from "effect/Types"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import validator from "validator"
import type { WithDefaults } from "./ext.js"
import { fromBrand, nominal } from "./ext.js"
import { type B, S } from "./schema.js"
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
export const NonEmptyString50 = pipe(
  NonEmptyString,
  fromBrand(nominal<NonEmptyString2k>()),
  S.maxLength(50, { title: "NonEmptyString50" })
)
  .withDefaults

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
  fromBrand(nominal<NonEmptyString2k>()),
  S.minLength(3),
  S.maxLength(255, { title: "Min3String255" })
)
  .withDefaults

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
const StringIdArb = (): Arbitrary<string> => (fc) =>
  fc
    .uint8Array({ minLength: length, maxLength: length })
    .map((_) => customRandom(urlAlphabet, size, (size) => _.subarray(0, size))())

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export const StringId = extendM(
  pipe(
    S.string,
    fromBrand(nominal<StringIdBrand>()),
    S.minLength(minLength),
    S.maxLength(maxLength, { title: "StringId", arbitrary: StringIdArb })
  ),
  (s) => ({
    make: makeStringId,
    withDefault: () => S.withDefaultConstructor(s, makeStringId)
  })
)
  .withDefaults

// const prefixedStringIdUnsafe = (prefix: string) => StringId(prefix + StringId.make())

// const prefixedStringIdUnsafeThunk = (prefix: string) => () => prefixedStringIdUnsafe(prefix)

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
    const schema = StringId
      .pipe(
        S.filter((x: StringId): x is Brand => x.startsWith(pref), { arbitrary: arb, title: name })
      )
      .withDefaults
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
        withDefault: () => S.withDefaultConstructor(schema, make)
      })
    )
  }
}

export const brandedStringId = <
  Brand extends StringIdBrand
>() => (Object.assign({}, StringId) as S.Schema<string, string & Brand> & {
  make: () => string & Brand
  withDefault: () => S.ConstructorPropertyDescriptor<string, string & Brand>
} & WithDefaults<S.Schema<string, string & Brand>>)

export interface PrefixedStringUtils<
  Brand extends StringId,
  Prefix extends string,
  Separator extends string
> {
  readonly make: () => Brand
  readonly unsafeFrom: (str: string) => Brand
  prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => Brand
  readonly prefix: Prefix
  readonly withDefault: () => S.ConstructorPropertyDescriptor<string, Brand>
}

export interface UrlBrand extends Simplify<B.Brand<"Url"> & NonEmptyStringBrand> {}

export type Url = NonEmptyString & UrlBrand

const isUrl: Refinement<string, Url> = (s: string): s is Url => {
  return validator.default.isURL(s, { require_tld: false })
}

export const Url = NonEmptyString
  .pipe(
    fromBrand(nominal<UrlBrand>()),
    S.filter(isUrl, {
      arbitrary: (): Arbitrary<string> => (fc) => fc.webUrl(),
      title: "Url",
      jsonSchema: { format: "uri" }
    })
  )
  .withDefaults

export const PositiveInt = S.Int.pipe(S.positive()).withDefaults
export type PositiveInt = S.Schema.To<typeof PositiveInt>
