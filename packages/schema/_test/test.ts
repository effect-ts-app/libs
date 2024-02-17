import type { NonEmptyString, NonEmptyString255, NonEmptyString2k } from "../src/strings.js"

declare let a: NonEmptyString
a = "a" as NonEmptyString2k
a = "a" as NonEmptyString255

declare let b: NonEmptyString2k
b = "a" as NonEmptyString
b = "a" as NonEmptyString255

declare let c: NonEmptyString255
c = "a" as NonEmptyString
c = "a" as NonEmptyString2k
c = "a" as NonEmptyString255

/*
{ // this is what we want to look for
    readonly [B.BrandTypeId]: {
      readonly NonEmptyString255: "NonEmptyString255"
    } & {
      readonly NonEmptyString2k: "NonEmptyString2k"
    } & {
      readonly NonEmptyString: "NonEmptyString"
    }
  }
*/

// export interface NonEmptyString255Brand extends
//   Id<
//     {
//       readonly [B.BrandTypeId]: {
//         readonly NonEmptyString255: "NonEmptyString255"
//       }
//     } & {
//       readonly [B.BrandTypeId]: {
//         readonly NonEmptyString2k: "NonEmptyString2k"
//       }
//     } & {
//       readonly [B.BrandTypeId]: {
//         readonly NonEmptyString: "NonEmptyString"
//       }
//     }
//   >
// {}

// export interface NonEmptyString255Brand3 {
//   readonly [B.BrandTypeId]: {
//     readonly NonEmptyString255: "NonEmptyString255"
//   } & {
//     readonly NonEmptyString2k: "NonEmptyString2k"
//   } & {
//     readonly NonEmptyString: "NonEmptyString"
//   }
// }
// export interface NonEmptyString255Brand
//   extends Id<B.Brand<"NonEmptyString255"> & NonEmptyString2kBrand>
// // {}
// export type NonEmptyString2553 = string & NonEmptyString255Brand3
// type s = NonEmptyString255[typeof B.BrandTypeId]
// type t = NonEmptyString2553[typeof B.BrandTypeId]
// type a = Unbranded<NonEmptyString255>
// type a2 = Brands2<NonEmptyString255>

// type b = Unbranded<NonEmptyString2553>
// type b2 = Brands2<NonEmptyString2553>

// type TTT = Test<NonEmptyString255Brand3>
// type a = UnionToIntersection3<
//   Test<NonEmptyString255Brand3>
// >
// export type Brands2<P> = P extends B.Brand<any> ? {
//     readonly [B.BrandTypeId]: UnionToIntersection3<
//       Test<P>
//     >
//   }
//   : never
// type bs = Brands2<NonEmptyString2553>
// type ab = Unbranded<NonEmptyString2553>
// const ab = unbranded(null as any as NonEmptyString2553)

// type UB = Unbranded<NonEmptyString255>
// type UB3 = Unbranded<NonEmptyString2553>

// type BNom = Simplify<typeof bnom>
// type BNom3 = Simplify<typeof bnom3>

// type BB = Brands<NonEmptyString255Brand>
// type C = Brands<NonEmptyString255Brand3>

// export type Brands<P> = P extends B.Brand<any> ? UnionToIntersection<
//     {
//       [k in keyof P[B.BrandTypeId]]: k extends string | symbol ? B.Brand<k>
//         : never
//     }[keyof P[B.BrandTypeId]]
//   >
//   : never

// declare let a: NonEmptyString
// a = "a" as NonEmptyString2k
// a = "a" as NonEmptyString2k

// declare let b: NonEmptyString2k
// b = "a" as NonEmptyString
// b = "a" as NonEmptyString
