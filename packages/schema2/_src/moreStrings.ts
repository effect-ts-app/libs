import { extendM } from "@effect-app/core/utils"
import type { Arbitrary } from "@effect/schema/Arbitrary"
import { pipe } from "effect"
import type { Simplify } from "effect/Types"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import { fromBrand, nominal } from "./ext.js"
import { A, type B, S } from "./schema.js"
import type { NonEmptyString255Brand, NonEmptyString2k } from "./strings.js"

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
/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export const StringId = extendM(
  pipe(
    S.string,
    S.minLength(3),
    S.maxLength(50),
    S.annotations({
      [A.ArbitraryHookId]: (): Arbitrary<string> => (fc) =>
        fc
          .uint8Array({ minLength, maxLength })
          .map((_) => customRandom(urlAlphabet, maxLength, (size) => _.subarray(0, size))())
    }),
    fromBrand(nominal<StringIdBrand>())
  ),
  (s) => ({
    make: makeStringId,
    withDefault: S.optional(s, { default: makeStringId })
  })
)

// export const prefixedStringIdUnsafe = (prefix: string) => StringId(prefix + StringId.make())

// export const prefixedStringIdUnsafeThunk = (prefix: string) => () => prefixedStringIdUnsafe(prefix)

// export interface PrefixedStringIdSchema<
//   Brand extends StringId,
//   Prefix extends string,
//   Separator extends string
// > extends
//   SchemaWithUtils<
//     SchemaDefaultSchema<unknown, Brand, string, string, ApiSelfType<StringId>>
//   >,
//   PrefixedStringUtils<Brand, Prefix, Separator>
// {}

// export type SchemaWithUtils<Schema extends SchemaUPI> = Schema & Utils<Schema>

// export function prefixedStringId<Brand extends StringId>() {
//   return <Prefix extends string, Separator extends string = "-">(
//     prefix: Prefix,
//     name: string,
//     separator?: Separator
//   ): PrefixedStringIdSchema<Brand, Prefix, Separator> => {
//     type FullPrefix = `${Prefix}${Separator}`
//     // type PrefixedId = `${FullPrefix}${string}`

//     const pref = `${prefix}${separator ?? "-"}` as FullPrefix
//     const refinement = (x: StringId): x is Brand => x.startsWith(pref)
//     const fromString = pipe(
//       stringIdFromString,
//       refine(
//         refinement,
//         (n) => leafE(customE(n, `a StringId prefixed with '${pref}'`))
//       ),
//       arbitrary((FC) =>
//         stringIdArb(FC).map(
//           (x) => (pref + x.substring(0, MAX_LENGTH - pref.length)) as Brand
//         )
//       )
//     )

//     const schema = FC.string[">>>"](fromString).pipe(named(name)).pipe(brand<Brand>())
//     const make = () => (pref + StringId.make()) as Brand

//     return extendWithUtilsAnd(
//       schema,
//       (ex): PrefixedStringUtils<Brand, Prefix, Separator> => ({
//         EParser: EParserFor(ex),
//         make,
//         /**
//          * Automatically adds the prefix.
//          */
//         unsafeFrom: (str: string) => ex(pref + str),
//         /**
//          * Must provide a literal string starting with prefix.
//          */
//         prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => ex(str),
//         prefix,
//         eq: Equivalence.string as Equivalence<Brand>,
//         withDefault: defaultProp(schema, make)
//       })
//     )
//   }
// }

// export const brandedStringId = <Brand extends StringId>() =>
//   extendWithUtilsAnd(StringId.pipe(brand<Brand>()), (s) => {
//     const make = (): Brand => StringId.make() as unknown as Brand

//     return ({
//       EParser: EParserFor(s),
//       make,
//       eq: Equivalence.string as Equivalence<Brand>,
//       withDefault: defaultProp(s, make)
//     })
//   })

// export interface PrefixedStringUtils<
//   Brand extends StringId,
//   Prefix extends string,
//   Separator extends string
// > {
//   readonly EParser: Parser.Parser<string, any, Brand>
//   readonly make: () => Brand
//   readonly unsafeFrom: (str: string) => Brand
//   prefixSafe: <REST extends string>(str: `${Prefix}${Separator}${REST}`) => Brand
//   readonly prefix: Prefix
//   eq: Equivalence<Brand>
//   readonly withDefault: Field<
//     SchemaDefaultSchema<unknown, Brand, string, string, ApiOf<PrefixedStringIdSchema<Brand, Prefix, Separator>>>,
//     "required",
//     None<any>,
//     Option.Some<["constructor", () => Brand]>
//   >
// }

// export interface UrlBrand {
//   readonly Url: unique symbol
// }

// export type Url = NonEmptyString & UrlBrand
// // eslint-disable-next-line @typescript-eslint/ban-types
// export const UrlFromStringIdentifier = makeAnnotation<{}>()

// const isUrl: Refinement<string, Url> = (s: string): s is Url => {
//   return validator.default.isURL(s, { require_tld: false })
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export const UrlFromString: DefaultSchema<string, Url, string, string, {}> = pipe(
//   fromString,
//   arbitrary((FC) => FC.webUrl()),
//   refine(isUrl, (n) => leafE(customE(n, "a valid Web URL according to | RFC 3986 and | WHATWG URL Standard"))),
//   brand<Url>(),
//   annotate(UrlFromStringIdentifier, {})
// )
// // eslint-disable-next-line @typescript-eslint/ban-types
// export const UrlIdentifier = makeAnnotation<{}>()

// export const Url = extendWithUtils(
//   pipe(
//     FC.string[">>>"](UrlFromString),
//     // eslint-disable-next-line @typescript-eslint/unbound-method
//     arbitrary((FC) => fakerArb((faker) => faker.internet.url)(FC) as FC.Arbitrary<Url>),
//     brand<Url>(),
//     annotate(UrlIdentifier, {})
//   )
// )
