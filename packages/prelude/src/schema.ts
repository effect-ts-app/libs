import { Option, pipe } from "@effect-app/core"
import { isValidEmail, isValidPhone } from "@effect-app/core/validation"
import { type A, type Email as EmailT, fromBrand, nominal, type PhoneNumber as PhoneNumberT } from "@effect-app/schema"
import * as S from "@effect-app/schema"
import { fakerArb } from "./faker.js"
import { extendM } from "./utils.js"

export const Email = S
  .string
  .pipe(
    S.filter(isValidEmail, {
      title: "Email",
      description: "an email according to RFC 5322",
      jsonSchema: { format: "email" },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      arbitrary: (): A.Arbitrary<string> => fakerArb((faker) => faker.internet.exampleEmail)
    }),
    fromBrand(nominal<Email>(), { jsonSchema: {} }),
    S.withDefaults
  )

export type Email = EmailT

export const PhoneNumber = S
  .string
  .pipe(
    S.filter(isValidPhone, {
      title: "PhoneNumber",
      description: "a phone number with at least 7 digits",
      jsonSchema: { format: "phone" },
      // eslint-disable-next-line @typescript-eslint/unbound-method
      arbitrary: (): A.Arbitrary<string> => fakerArb((faker) => faker.phone.number)
    }),
    fromBrand(nominal<PhoneNumber>(), { jsonSchema: {} }),
    S.withDefaults
  )

export const makeIs = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
) => {
  if (S.AST.isUnion(schema.ast)) {
    return schema.ast.types.reduce((acc, t) => {
      if (S.AST.isTransform(t)) {
        if (S.AST.isDeclaration(t.to)) {
          t = t.from
        } else {
          t = t.to
        }
      }
      if (!S.AST.isTypeLiteral(t)) return acc
      const tag = t.propertySignatures.findFirstMap((_) => {
        if (_.name === "_tag" && S.AST.isLiteral(_.type)) {
          return Option.some(_.type)
        }
        return Option.none()
      })
      const ast = tag.value
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

export const extendTaggedUnion = <A extends { _tag: string }, I, R>(
  schema: S.Schema<A, I, R>
) => extendM(schema, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_) }))

export type ExtractUnion<A extends { _tag: string }, Tags extends A["_tag"]> = Extract<A, Record<"_tag", Tags>>
export type Is<A extends { _tag: string }> = { [K in A as K["_tag"]]: (a: A) => a is K }
export type ElemType<A> = A extends Array<infer E> ? E : never
export interface IsAny<A extends { _tag: string }> {
  <Keys extends A["_tag"][]>(...keys: Keys): (a: A) => a is ExtractUnion<A, ElemType<Keys>>
}

export const taggedUnion = <Members extends readonly S.Schema<{ _tag: string }, any, any>[]>(...a: Members) =>
  pipe(S.union(...a), (_) => extendM(_, (_) => ({ is: makeIs(_), isAnyOf: makeIsAnyOf(_) })))

export type PhoneNumber = PhoneNumberT

export * from "@effect-app/schema"
