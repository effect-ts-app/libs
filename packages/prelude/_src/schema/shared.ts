/* eslint-disable @typescript-eslint/ban-types */
import { pipe } from "@effect-app/core/Function"
import type { Refinement } from "@effect-app/core/Function"
import type {
  ApiOf,
  ApiSelfType,
  DefaultSchema,
  Field,
  NonEmptyString,
  Parser,
  SchemaDefaultSchema,
  SchemaUPI,
  Utils
} from "@effect-app/schema"
import {
  annotate,
  brand,
  defaultProp,
  EParserFor,
  extendWithUtils,
  extendWithUtilsAnd,
  leafE,
  literal,
  makeAnnotation,
  named,
  nonEmptyStringFromString,
  refine
} from "@effect-app/schema"
import type * as FC from "fast-check"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import validator from "validator"
import { curriedMagix } from "../Function.js"
import type { ReasonableStringBrand, To, UnionBrand } from "./_schema.js"
import {
  Arbitrary,
  arbitrary,
  customE,
  Email as Email_,
  fakerArb,
  fromString,
  makeConstrainedFromString,
  PositiveInt,
  ReasonableString,
  string,
  stringNumber,
  withDefaults
} from "./_schema.js"

export function tag<K extends string>(tag: K) {
  return literal(tag)
}

export const stringPositiveIntIdentifier = makeAnnotation<{}>()

export const StringPositiveInt: DefaultSchema<unknown, PositiveInt, PositiveInt, string, {}> = pipe(
  stringNumber[">>>"](PositiveInt),
  withDefaults,
  annotate(stringPositiveIntIdentifier, {})
)
export type StringPositiveInt = PositiveInt

/**
 * A string that is at least 3 character long and a maximum of 50.
 */
export interface ShortStringBrand extends ReasonableStringBrand {
  readonly ShortString: unique symbol
}

/**
 * A string that is at least 3 character long and a maximum of 50.
 */
export type ShortString = string & ShortStringBrand

/**
 * A string that is at least 3 character long and a maximum of 50.
 */
export const shortStringFromString = pipe(
  makeConstrainedFromString<ShortString>(3, 50),
  arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 50 && x.length >= 3)
      .map((x) => x as ShortString)
  ),
  // arbitrary removes brand benefit
  brand<ShortString>()
)

/**
 * A string that is at least 3 character long and a maximum of 50.
 */
export const ShortString = extendWithUtils(
  pipe(string[">>>"](shortStringFromString), brand<ShortString>())
)

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export interface ReasonableString3Brand extends ReasonableStringBrand {
  readonly ReasonableString3: unique symbol
}

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export type ReasonableString3 = string & ReasonableString3Brand

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export const reasonableString3FromString = pipe(
  makeConstrainedFromString<ReasonableString3>(3, 255),
  arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 255 && x.length >= 3)
      .map((x) => x as ReasonableString3)
  ),
  // arbitrary removes brand benefit
  brand<ReasonableString3>()
)

/**
 * A string that is at least 3 character long and a maximum of 255.
 */
export const ReasonableString3 = extendWithUtils(
  pipe(string[">>>"](reasonableString3FromString), brand<ReasonableString3>())
)

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export interface StringIdBrand extends ReasonableStringBrand {
  readonly StringId: unique symbol
}

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export type StringId = string & StringIdBrand

const MIN_LENGTH = 6
const MAX_LENGTH = 50
const size = 21
const length = 10 * size
export const stringIdFromString = pipe(
  makeConstrainedFromString<StringId>(MIN_LENGTH, MAX_LENGTH),
  arbitrary((FC) =>
    FC
      .uint8Array({ minLength: length, maxLength: length })
      .map((_) => customRandom(urlAlphabet, size, (size) => _.subarray(0, size))() as StringId)
  ),
  // arbitrary removes the benefit of Brand,
  brand<StringId>()
)

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export interface StringIdSchema extends
  SchemaDefaultSchema<
    unknown,
    StringId,
    string,
    string,
    ApiSelfType<StringId>
  >
{}
const StringIdSchema: StringIdSchema = string[">>>"](stringIdFromString).pipe(
  brand<StringId>()
)
const makeStringId = (): StringId => nanoid() as unknown as StringId
export const StringId = extendWithUtilsAnd(StringIdSchema, () => ({
  make: makeStringId,
  withDefault: defaultProp(StringIdSchema, makeStringId)
}))

const stringIdArb = Arbitrary.for(StringId)

export const prefixedStringIdUnsafe = (prefix: string) => StringId(prefix + StringId.make())

export const prefixedStringIdUnsafeThunk = (prefix: string) => () => prefixedStringIdUnsafe(prefix)

export interface PrefixedStringIdSchema<
  Brand extends StringId,
  Prefix extends string,
  Separator extends string
> extends
  SchemaWithUtils<
    SchemaDefaultSchema<unknown, Brand, string, string, ApiSelfType<StringId>>
  >,
  PrefixedStringUtils<Brand, Prefix, Separator>
{}

export type SchemaWithUtils<Schema extends SchemaUPI> = Schema & Utils<Schema>

export function prefixedStringId<Brand extends StringId>() {
  return <Prefix extends string, Separator extends string = "-">(
    prefix: Prefix,
    name: string,
    separator?: Separator
  ): PrefixedStringIdSchema<Brand, Prefix, Separator> => {
    type FullPrefix = `${Prefix}${Separator}`
    // type PrefixedId = `${FullPrefix}${string}`

    const pref = `${prefix}${separator ?? "-"}` as FullPrefix
    const refinement = (x: StringId): x is Brand => x.startsWith(pref)
    const fromString = pipe(
      stringIdFromString,
      refine(
        refinement,
        (n) => leafE(customE(n, `a StringId prefixed with '${pref}'`))
      ),
      arbitrary((FC) =>
        stringIdArb(FC).map(
          (x) => (pref + x.substring(0, MAX_LENGTH - pref.length)) as Brand
        )
      )
    )

    const schema = string[">>>"](fromString).pipe(named(name)).pipe(brand<Brand>())
    const make = () => (pref + StringId.make()) as Brand

    return extendWithUtilsAnd(
      schema,
      (ex): PrefixedStringUtils<Brand, Prefix, Separator> => ({
        EParser: EParserFor(ex),
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
        eq: Equivalence.string as Equivalence<Brand>,
        withDefault: defaultProp(schema, make)
      })
    )
  }
}

export const brandedStringId = <Brand extends StringId>() =>
  extendWithUtilsAnd(StringId.pipe(brand<Brand>()), (s) => {
    const make = (): Brand => StringId.make() as unknown as Brand

    return ({
      EParser: EParserFor(s),
      make,
      eq: Equivalence.string as Equivalence<Brand>,
      withDefault: defaultProp(s, make)
    })
  })

export interface PrefixedStringUtils<
  Brand extends StringId,
  Prefix extends string,
  Separator extends string
> {
  readonly EParser: Parser.Parser<string, any, Brand>
  readonly make: () => Brand
  readonly unsafeFrom: (str: string) => Brand
  prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => Brand
  readonly prefix: Prefix
  eq: Equivalence<Brand>
  readonly withDefault: Field<
    SchemaDefaultSchema<unknown, Brand, string, string, ApiOf<PrefixedStringIdSchema<Brand, Prefix, Separator>>>,
    "required",
    None<any>,
    Some<["constructor", () => Brand]>
  >
}

export interface UrlBrand {
  readonly Url: unique symbol
}

export type Url = NonEmptyString & UrlBrand
// eslint-disable-next-line @typescript-eslint/ban-types
export const UrlFromStringIdentifier = makeAnnotation<{}>()

const isUrl: Refinement<string, Url> = (s: string): s is Url => {
  return validator.default.isURL(s, { require_tld: false })
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const UrlFromString: DefaultSchema<string, Url, string, string, {}> = pipe(
  fromString,
  arbitrary((FC) => FC.webUrl()),
  refine(isUrl, (n) => leafE(customE(n, "a valid Web URL according to | RFC 3986 and | WHATWG URL Standard"))),
  brand<Url>(),
  annotate(UrlFromStringIdentifier, {})
)
// eslint-disable-next-line @typescript-eslint/ban-types
export const UrlIdentifier = makeAnnotation<{}>()

export const Url = extendWithUtils(
  pipe(
    string[">>>"](UrlFromString),
    // eslint-disable-next-line @typescript-eslint/unbound-method
    arbitrary((FC) => fakerArb((faker) => faker.internet.url)(FC) as FC.Arbitrary<Url>),
    brand<Url>(),
    annotate(UrlIdentifier, {})
  )
)

export const avatarUrl = pipe(string[">>>"](nonEmptyStringFromString))
  .pipe(
    arbitrary(
      // eslint-disable-next-line @typescript-eslint/unbound-method
      (FC) => fakerArb((faker) => faker.internet.avatar)(FC) as FC.Arbitrary<Url>
    )
  )
  .pipe(brand<avatarUrl>())

export type avatarUrl = NonEmptyString & UnionBrand

export const customUrlFromString = (pool: readonly Url[]) =>
  pipe(
    UrlFromString,
    arbitrary((FC) => FC.oneof(...pool.map(FC.constant))),
    brand<Url>()
  )

export const customUrl = (pool: readonly Url[]) => pipe(string[">>>"](customUrlFromString(pool)), brand<Url>())

// for now be less restrictive about the PhoneNumber
const PhoneNumber_ = StringId
export const PhoneNumber = PhoneNumber_
  .pipe(
    arbitrary((FC) =>
      // eslint-disable-next-line @typescript-eslint/unbound-method
      fakerArb((faker) => faker.phone.number)(FC).map((x) => x as StringId)
    )
  )
  .pipe(brand<PhoneNumber>())

export type PhoneNumber = StringId & UnionBrand

const endsWith = curriedMagix(
  (e: Email) => (s: string) => e.toLowerCase().endsWith(s.toLowerCase())
)
const Email__ = Object.assign(
  extendWithUtils(
    Email_
      .pipe(
        arbitrary((FC) =>
          // eslint-disable-next-line @typescript-eslint/unbound-method
          fakerArb((faker) => faker.internet.email)(FC).map((x) => x as Email)
        )
      )
      .pipe(brand<Email>())
  ),
  {
    eq: { equals: (a: Email, b: Email) => a.toLowerCase() === b.toLowerCase() },
    endsWith,
    toDomain: (email: Email) => ReasonableString(email.split("@")[1]),
    isDomain: curriedMagix(
      (e: Email) => (domain: string) => endsWith._("@" + domain, e)
    ),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    toDisplayName: (e: Email) => e.split("@")[0]
  }
)
type EmailSchema__ = typeof Email__
export interface EmailSchema extends EmailSchema__ {}
export const Email: EmailSchema = Email__
export type Email = To<typeof Email_> & {
  split: (separator: "@") => [ReasonableString, ReasonableString]
}
