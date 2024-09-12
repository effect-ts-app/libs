import { Array, Option, pipe } from "@effect-app/core"
import { type A, type Email as EmailT, type PhoneNumber as PhoneNumberT } from "@effect-app/schema"
import * as S from "@effect-app/schema"
import { fakerArb } from "./faker.js"
import { extendM } from "./utils.js"

export * from "@effect-app/schema"

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
  Members
    extends readonly (S.Schema<{ _tag: string }, any, any> & { fields: { _tag: { literals: readonly [string] } } })[]
>(
  self: Members
) =>
  self.reduce((acc, key) => {
    const tag = key.fields._tag.literals[0]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    acc[tag as any] = key as any
    return acc
  }, {} as { [Key in Members[number] as Key["fields"]["_tag"]["literals"][0]]: Key })

export const ExtendTaggedUnion = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
) => extendM(schema, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_) /*, map: taggedUnionMap(a) */ }))

export const TaggedUnion = <
  Members extends ReadonlyArray<
    S.Schema.Any & { fields: { _tag: { literals: readonly [string] } } }
  >
>(...a: Members) =>
  pipe(S.Union(...a), (_) => extendM(_, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_), tagMap: taggedUnionMap(a) })))

export type PhoneNumber = PhoneNumberT
