import type { NonEmptyReadonlyArray, Tracer } from "effect-app"
import { Option, pipe } from "effect-app"
import { fakerArb } from "./faker.js"
import { S } from "./lib.js"
import { type Email as EmailT } from "./Schema/email.js"
import { type PhoneNumber as PhoneNumberT } from "./Schema/phoneNumber.js"
import type { A } from "./Schema/schema.js"
import { extendM } from "./utils.js"

export * from "effect/Schema"

export * from "./Schema/Class.js"
export { Class, TaggedClass } from "./Schema/Class.js"

export { fromBrand, nominal } from "./Schema/brand.js"
export {
  Array,
  Boolean,
  Date,
  NonEmptyArray,
  NullOr,
  Number,
  ReadonlyMap,
  ReadonlySet,
  Struct,
  Tuple
} from "./Schema/ext.js"
export { Int } from "./Schema/numbers.js"

export * from "./Schema/email.js"
export * from "./Schema/ext.js"
export * from "./Schema/moreStrings.js"
export * from "./Schema/numbers.js"
export * from "./Schema/phoneNumber.js"
export * from "./Schema/schema.js"
export * from "./Schema/strings.js"
export { NonEmptyString } from "./Schema/strings.js"

export * as ParseResult from "effect/ParseResult"

export { Void as Void_ } from "effect/Schema"

export const SpanId = Symbol()
export type SpanId = typeof SpanId

export interface WithOptionalSpan {
  [SpanId]?: Tracer.Span
}

export const Email = S
  .Email
  .pipe(
    S.annotations({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      arbitrary: (): A.LazyArbitrary<Email> => (fc) => fakerArb((faker) => faker.internet.exampleEmail)(fc).map(Email)
    }),
    S.withDefaultMake
  )

export type Email = EmailT

export const PhoneNumber = S
  .PhoneNumber
  .pipe(
    S.annotations({
      arbitrary: (): A.LazyArbitrary<PhoneNumber> => (fc) =>
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fakerArb((faker) => faker.phone.number)(fc).map(PhoneNumber)
    }),
    S.withDefaultMake
  )

export const makeIs = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
) => {
  if (S.AST.isUnion(schema.ast)) {
    return schema.ast.types.reduce((acc, t) => {
      if (S.AST.isTransformation(t)) {
        if (S.AST.isDeclaration(t.to)) {
          t = t.from
        } else {
          t = t.to
        }
      }
      if (!S.AST.isTypeLiteral(t)) return acc
      const tag = Array.findFirst(t.propertySignatures, (_) => {
        if (_.name === "_tag" && S.AST.isLiteral(_.type)) {
          return Option.some(_.type)
        }
        return Option.none()
      })
      const ast = Option.getOrUndefined(tag)
      if (!ast) {
        return acc
      }
      return {
        ...acc,
        [String(ast.literal)]: (x: { _tag: string }) => x._tag === ast.literal
      }
    }, {} as Is<A>)
  }
  throw new Error("Unsupported")
}

export const makeIsAnyOf = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
): IsAny<A> => {
  if (S.AST.isUnion(schema.ast)) {
    return <Keys extends A["_tag"][]>(...keys: Keys) => (a: A): a is ExtractUnion<A, ElemType<Keys>> =>
      keys.includes(a._tag)
  }
  throw new Error("Unsupported")
}

export type ExtractUnion<A extends { _tag: string }, Tags extends A["_tag"]> = Extract<A, Record<"_tag", Tags>>
export type Is<A extends { _tag: string }> = { [K in A as K["_tag"]]: (a: A) => a is K }
export type ElemType<A> = A extends Array<infer E> ? E : never
export interface IsAny<A extends { _tag: string }> {
  <Keys extends A["_tag"][]>(...keys: Keys): (a: A) => a is ExtractUnion<A, ElemType<Keys>>
}

export const taggedUnionMap = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Members extends readonly (S.Schema<{ _tag: string }, any, any> & { fields: { _tag: S.tag<string> } })[]
>(
  self: Members
) =>
  self.reduce((acc, key) => {
    // TODO: check upstream what's going on with literals of _tag
    const ast = key.fields._tag.ast as S.PropertySignatureDeclaration
    const tag = (ast.type as S.AST.Literal).literal as string // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    ;(acc as any)[tag] = key as any
    return acc
  }, {} as { [Key in Members[number] as ReturnType<Key["fields"]["_tag"][S.TypeId]["_A"]>]: Key })

export const tags = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Members extends NonEmptyReadonlyArray<(S.Schema<{ _tag: string }, any, any> & { fields: { _tag: S.tag<string> } })>
>(
  self: Members
) =>
  S.Literal(...self.map((key) => {
    const ast = key.fields._tag.ast as S.PropertySignatureDeclaration
    const tag = (ast.type as S.AST.Literal).literal
    return tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any as S.Literal<
    {
      [Index in keyof Members]: S.Schema.Type<Members[Index]["fields"]["_tag"]>
    }
  >
export const ExtendTaggedUnion = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
) => extendM(schema, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_) /*, map: taggedUnionMap(a) */ }))

export const TaggedUnion = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Members extends S.AST.Members<S.Schema.Any & { fields: { _tag: S.tag<any> } }>
>(...a: Members) =>
  pipe(
    S.Union(...a),
    (_) => extendM(_, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_), tagMap: taggedUnionMap(a), tags: tags(a) }))
  )

export type PhoneNumber = PhoneNumberT
