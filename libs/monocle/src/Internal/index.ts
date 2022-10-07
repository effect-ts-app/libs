// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as E from "@effect-ts/core/Either"
import type { Predicate } from "@effect-ts/core/Function"
import { constant, flow, identity, pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import type * as P from "@effect-ts/core/Prelude"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import * as HM from "@effect-ts/system/Collections/Immutable/HashMap"
import { matchTag_ } from "@effect-ts/system/Utils"

import type { At } from "../At/index.js"
import type { Index } from "../Ix/index.js"

export class Lens<S, A> extends Tagged("Lens")<{
  readonly get: (s: S) => A
  readonly set: (a: A) => (s: S) => S
}> {
  readonly [">>>"]: {
    <B>(ab: Iso<A, B>): Lens<S, B>
    <B>(ab: Lens<A, B>): Lens<S, B>
    <B>(ab: Prism<A, B>): Optional<S, B>
    <B>(ab: Optional<A, B>): Optional<S, B>
    <B>(ab: Traversal<A, B>): Traversal<S, B>
  } = (ab) =>
    // @ts-expect-error
    matchTag_(ab, {
      Iso: (ab) => lensComposeLens(isoAsLens(ab))(this),
      Lens: (ab) => lensComposeLens(ab)(this),
      Optional: (ab) => optionalComposeOptional(ab)(lensAsOptional(this)),
      Prism: (ab) => lensComposePrism(ab)(this),
      Traversal: (ab) => traversalComposeTraversal(ab)(lensAsTraversal(this))
    })
}

export class Prism<S, A> extends Tagged("Prism")<{
  readonly getOption: (s: S) => O.Option<A>
  readonly reverseGet: (a: A) => S
}> {
  readonly [">>>"]: {
    <B>(ab: Iso<A, B>): Prism<S, B>
    <B>(ab: Lens<A, B>): Optional<S, B>
    <B>(ab: Prism<A, B>): Prism<S, B>
    <B>(ab: Optional<A, B>): Optional<S, B>
    <B>(ab: Traversal<A, B>): Traversal<S, B>
  } = (ab) =>
    //@ts-expect-error
    matchTag_(ab, {
      Iso: (ab) => composePrism(isoAsPrism(ab))(this),
      Lens: (ab) => prismComposeLens(ab)(this),
      Optional: (ab) => optionalComposeOptional(ab)(prismAsOptional(this)),
      Prism: (ab) => composePrism(ab)(this),
      Traversal: (ab) => traversalComposeTraversal(ab)(prismAsTraversal(this))
    })
}

export class Optional<S, A> extends Tagged("Optional")<{
  readonly getOption: (s: S) => O.Option<A>
  readonly set: (a: A) => (s: S) => S
}> {
  readonly [">>>"]: {
    <B>(ab: Iso<A, B>): Optional<S, B>
    <B>(ab: Lens<A, B>): Optional<S, B>
    <B>(ab: Prism<A, B>): Optional<S, B>
    <B>(ab: Optional<A, B>): Optional<S, B>
    <B>(ab: Traversal<A, B>): Traversal<S, B>
  } = (ab) =>
    // @ts-expect-error
    matchTag_(ab, {
      Iso: (ab) => optionalComposeOptional(isoAsOptional(ab))(this),
      Lens: (ab) => optionalComposeOptional(lensAsOptional(ab))(this),
      Optional: (ab) => optionalComposeOptional(ab)(this),
      Prism: (ab) => optionalComposeOptional(prismAsOptional(ab))(this),
      Traversal: (ab) => traversalComposeTraversal(ab)(optionalAsTraversal(this))
    })
}

export class Iso<S, A> extends Tagged("Iso")<{
  readonly get: (s: S) => A
  readonly reverseGet: (a: A) => S
}> {
  readonly [">>>"]: {
    <B>(ab: Iso<A, B>): Iso<S, B>
    <B>(ab: Lens<A, B>): Lens<S, B>
    <B>(ab: Prism<A, B>): Prism<S, B>
    <B>(ab: Optional<A, B>): Optional<S, B>
    <B>(ab: Traversal<A, B>): Traversal<S, B>
  } = (ab) =>
    // @ts-expect-error
    matchTag_(ab, {
      Iso: (ab) => isoComposeIso(ab)(this),
      Lens: (ab) => lensComposeLens(ab)(isoAsLens(this)),
      Optional: (ab) => optionalComposeOptional(ab)(isoAsOptional(this)),
      Prism: (ab) => composePrism(ab)(isoAsPrism(this)),
      Traversal: (ab) => traversalComposeTraversal(ab)(isoAsTraversal(this))
    })
}

export interface ModifyF<S, A> {
  <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>): <
    FK,
    FQ,
    FW,
    FX,
    FI,
    FS,
    FR,
    FE
  >(
    f: (a: A) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, A>
  ) => (s: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>
}

export class Traversal<S, A> extends Tagged("Traversal")<{
  readonly modifyF: ModifyF<S, A>
}> {
  readonly [">>>"]: {
    <B>(ab: Iso<A, B>): Traversal<S, B>
    <B>(ab: Lens<A, B>): Traversal<S, B>
    <B>(ab: Prism<A, B>): Traversal<S, B>
    <B>(ab: Optional<A, B>): Traversal<S, B>
    <B>(ab: Traversal<A, B>): Traversal<S, B>
  } = (ab) =>
    matchTag_(ab, {
      Iso: (ab) => traversalComposeTraversal(isoAsTraversal(ab))(this),
      Lens: (ab) => traversalComposeTraversal(lensAsTraversal(ab))(this),
      Optional: (ab) => traversalComposeTraversal(optionalAsTraversal(ab))(this),
      Prism: (ab) => traversalComposeTraversal(prismAsTraversal(ab))(this),
      Traversal: (ab) => traversalComposeTraversal(ab)(this)
    })
}

// -------------------------------------------------------------------------------------
// Iso
// -------------------------------------------------------------------------------------

export const isoAsLens = <S, A>(sa: Iso<S, A>): Lens<S, A> =>
  new Lens({ get: sa.get, set: flow(sa.reverseGet, constant) })

export const isoAsOptional = <S, A>(sa: Iso<S, A>): Optional<S, A> =>
  new Optional({
    getOption: flow(sa.get, O.some),
    set: flow(sa.reverseGet, constant)
  })

/**
 * Compose an `Iso` with an `Iso`
 */
export const isoComposeIso =
  <A, B>(ab: Iso<A, B>) =>
  <S>(sa: Iso<S, A>): Iso<S, B> =>
    new Iso({
      get: flow(sa.get, ab.get),
      reverseGet: flow(ab.reverseGet, sa.reverseGet)
    })

/**
 * View an `Iso` as a `Prism`
 */
export const isoAsPrism = <S, A>(sa: Iso<S, A>): Prism<S, A> =>
  new Prism({
    getOption: flow(sa.get, O.some),
    reverseGet: sa.reverseGet
  })

export const isoAsTraversal = <S, A>(sa: Iso<S, A>): Traversal<S, A> =>
  new Traversal({
    modifyF:
      <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>) =>
      <FK, FQ, FW, FX, FI, FS, FR, FE>(
        f: (a: A) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, A>
      ) =>
      (s: S): P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S> =>
        pipe(
          f(sa.get(s)),
          F.map((a) => sa.reverseGet(a))
        )
  })

// -------------------------------------------------------------------------------------
// Lens
// -------------------------------------------------------------------------------------

export const lensAsOptional = <S, A>(sa: Lens<S, A>): Optional<S, A> =>
  new Optional({
    getOption: flow(sa.get, O.some),
    set: sa.set
  })

export const lensAsTraversal = <S, A>(sa: Lens<S, A>): Traversal<S, A> =>
  new Traversal({
    modifyF:
      <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>) =>
      <FK, FQ, FW, FX, FI, FS, FR, FE>(
        f: (a: A) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, A>
      ) =>
      (s: S): P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S> =>
        pipe(
          f(sa.get(s)),
          F.map((a) => sa.set(a)(s))
        )
  })

export const lensComposeLens =
  <A, B>(ab: Lens<A, B>) =>
  <S>(sa: Lens<S, A>): Lens<S, B> =>
    new Lens({
      get: (s) => ab.get(sa.get(s)),
      set: (b) => (s) => sa.set(ab.set(b)(sa.get(s)))(s)
    })

export const lensComposePrism =
  <A, B>(ab: Prism<A, B>) =>
  <S>(sa: Lens<S, A>): Optional<S, B> =>
    optionalComposeOptional(prismAsOptional(ab))(lensAsOptional(sa))

export const lensId = <S>(): Lens<S, S> => new Lens({ get: identity, set: constant })

export const lensProp =
  <A, P extends keyof A>(prop: P) =>
  <S>(lens: Lens<S, A>): Lens<S, A[P]> =>
    new Lens({
      get: (s) => lens.get(s)[prop],
      set: (ap) => (s) => {
        const oa = lens.get(s)
        if (ap === oa[prop]) {
          return s
        }
        return lens.set(Object.assign({}, oa, { [prop]: ap }))(s)
      }
    })

export const lensProps =
  <A, P extends keyof A>(...props: [P, P, ...Array<P>]) =>
  <S>(lens: Lens<S, A>): Lens<S, { [K in P]: A[K] }> =>
    new Lens({
      get: (s) => {
        const a = lens.get(s)
        const r: { [K in P]?: A[K] } = {}
        for (const k of props) {
          r[k] = a[k]
        }
        return r as any
      },
      set: (a) => (s) => {
        const oa = lens.get(s)
        const b: any = {}
        let mod = false
        for (const k of props) {
          if (a[k] !== oa[k]) {
            mod = true
            b[k] = a[k]
          }
        }
        if (mod) {
          return lens.set(Object.assign({}, oa, b))(s)
        }
        return s
      }
    })

export const lensComponent =
  <A extends ReadonlyArray<unknown>, P extends keyof A>(prop: P) =>
  <S>(lens: Lens<S, A>): Lens<S, A[P]> =>
    new Lens({
      get: (s) => lens.get(s)[prop],
      set: (ap) => (s) => {
        const oa = lens.get(s)
        if (ap === oa[prop]) {
          return s
        }
        const copy: A = oa.slice() as any
        copy[prop] = ap
        return lens.set(copy)(s)
      }
    })

// -------------------------------------------------------------------------------------
// Prism
// -------------------------------------------------------------------------------------

export const prismAsOptional = <S, A>(sa: Prism<S, A>): Optional<S, A> =>
  new Optional({
    getOption: sa.getOption,
    set: (a) => prismSet(a)(sa)
  })

export const prismAsTraversal = <S, A>(sa: Prism<S, A>): Traversal<S, A> =>
  new Traversal({
    modifyF: <F extends P.URIS, C = P.Auto>(
      F: P.Applicative<F, C>
    ): (<FK, FQ, FW, FX, FI, FS, FR, FE>(
      f: (a: A) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, A>
    ) => (s: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>) => {
      const succeed = DSL.succeedF(F)
      return (f) => (s) =>
        O.fold_(
          sa.getOption(s),
          () => succeed(s),
          (a) => F.map<A, S>((a) => prismSet(a)(sa)(s))(f(a))
        )
    }
  })

export const prismModifyOption =
  <A>(f: (a: A) => A) =>
  <S>(sa: Prism<S, A>) =>
  (s: S): O.Option<S> =>
    O.map_(sa.getOption(s), (o) => {
      const n = f(o)
      return n === o ? s : sa.reverseGet(n)
    })

export const prismModify =
  <A>(f: (a: A) => A) =>
  <S>(sa: Prism<S, A>): ((s: S) => S) => {
    const g = prismModifyOption(f)(sa)
    return (s) => O.getOrElse_(g(s), () => s)
  }

export const prismSet = <A>(a: A): (<S>(sa: Prism<S, A>) => (s: S) => S) =>
  prismModify(() => a)

export const prismComposeLens =
  <A, B>(ab: Lens<A, B>) =>
  <S>(sa: Prism<S, A>): Optional<S, B> =>
    optionalComposeOptional(lensAsOptional(ab))(prismAsOptional(sa))

export const prismFromNullable = <A>(): Prism<A, NonNullable<A>> =>
  new Prism({
    getOption: O.fromNullable,
    reverseGet: identity
  })

export function prismFromPredicate<A>(predicate: Predicate<A>): Prism<A, A> {
  return new Prism({
    getOption: O.fromPredicate(predicate),
    reverseGet: identity
  })
}

export const prismSome = <A>(): Prism<O.Option<A>, A> =>
  new Prism({
    getOption: identity,
    reverseGet: O.some
  })

export const prismRight = <E, A>(): Prism<E.Either<E, A>, A> =>
  new Prism({
    getOption: O.fromEither,
    reverseGet: E.right
  })

export const prismLeft = <E, A>(): Prism<E.Either<E, A>, E> =>
  new Prism({
    getOption: (s) => (E.isLeft(s) ? O.some(s.left) : O.none), // TODO: replace with E.getLeft in v3
    reverseGet: E.left
  })

// -------------------------------------------------------------------------------------
// Optional
// -------------------------------------------------------------------------------------

/**
 * Compose a `Prism` with a `Prism`
 */
export const composePrism =
  <A, B>(ab: Prism<A, B>) =>
  <S>(sa: Prism<S, A>): Prism<S, B> =>
    new Prism({
      getOption: flow(sa.getOption, O.chain(ab.getOption)),
      reverseGet: flow(ab.reverseGet, sa.reverseGet)
    })

export const optionalAsTraversal = <S, A>(sa: Optional<S, A>): Traversal<S, A> =>
  new Traversal({
    modifyF:
      <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>) =>
      <FK, FQ, FW, FX, FI, FS, FR, FE>(
        f: (a: A) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, A>
      ): ((s: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>) => {
        const succeed = DSL.succeedF(F)
        return (s) =>
          O.fold_(
            sa.getOption(s),
            () => succeed(s),
            (a) => F.map<A, S>((a: A) => sa.set(a)(s))(f(a))
          )
      }
  })

export const optionalModifyOption =
  <A>(f: (a: A) => A) =>
  <S>(optional: Optional<S, A>) =>
  (s: S): O.Option<S> =>
    O.map_(optional.getOption(s), (a) => {
      const n = f(a)
      return n === a ? s : optional.set(n)(s)
    })

export const optionalModify =
  <A>(f: (a: A) => A) =>
  <S>(optional: Optional<S, A>): ((s: S) => S) => {
    const g = optionalModifyOption(f)(optional)
    return (s) => O.getOrElse_(g(s), () => s)
  }

export const optionalComposeOptional =
  <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Optional<S, A>): Optional<S, B> =>
    new Optional({
      getOption: flow(sa.getOption, O.chain(ab.getOption)),
      set: (b) => optionalModify(ab.set(b))(sa)
    })

const findMutable = <A>(predicate: Predicate<A>): Optional<Array<A>, A> =>
  new Optional({
    getOption: A.find(predicate),
    set: (a) => (s) =>
      O.fold_(
        A.findIndex(predicate)(s),
        () => s,
        (i) => A.unsafeUpdateAt(i, a)(s)
      )
  })

export const find: <A>(predicate: Predicate<A>) => Optional<ReadonlyArray<A>, A> =
  findMutable as any

// -------------------------------------------------------------------------------------
// Traversal
// -------------------------------------------------------------------------------------

export function traversalComposeTraversal<A, B>(
  ab: Traversal<A, B>
): <S>(sa: Traversal<S, A>) => Traversal<S, B> {
  return <S>(sa: Traversal<S, A>) =>
    new Traversal({
      modifyF:
        <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>) =>
        <FK, FQ, FW, FX, FI, FS, FR, FE>(
          f: (a: B) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, B>
        ): ((s: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>) =>
          sa.modifyF(F)(ab.modifyF(F)(f))
    })
}

export function fromForEach<T extends P.URIS, C = P.Auto>(
  T: P.ForEach<T, C>
): <
  A,
  K = P.Initial<C, "K">,
  Q = P.Initial<C, "Q">,
  W = P.Initial<C, "W">,
  X = P.Initial<C, "X">,
  I = P.Initial<C, "I">,
  S = P.Initial<C, "S">,
  R = P.Initial<C, "R">,
  E = P.Initial<C, "E">
>() => Traversal<P.Kind<T, C, K, Q, W, X, I, S, R, E, A>, A>
export function fromForEach<T>(
  T: P.ForEach<P.UHKT<T>>
): <A>() => Traversal<P.HKT<T, A>, A> {
  return <A>(): Traversal<P.HKT<T, A>, A> =>
    new Traversal<P.HKT<T, A>, A>({
      modifyF: T.forEachF
    })
}

// -------------------------------------------------------------------------------------
// Ix
// -------------------------------------------------------------------------------------

function indexMutableArray<A = never>(): Index<Array<A>, number, A> {
  return {
    index: (i) =>
      new Optional({
        getOption: A.get(i),
        set: (a) => (as) => O.getOrElse_(A.updateAt(i, a)(as), () => as)
      })
  }
}

export const indexArray: <A = never>() => Index<ReadonlyArray<A>, number, A> =
  indexMutableArray as any

export function indexRecord<A = never>(): Index<
  Readonly<Record<string, A>>,
  string,
  A
> {
  return {
    index: (k) =>
      new Optional({
        getOption: R.lookup(k),
        set: (a) => (r) => {
          if (r[k] === a || O.isNone(R.lookup(k)(r))) {
            return r
          }
          return R.insertAt(k, a)(r)
        }
      })
  }
}

export function indexHashMap<K = never, A = never>(): Index<
  Readonly<HM.HashMap<K, A>>,
  K,
  A
> {
  return {
    index: (k) =>
      new Optional({
        getOption: HM.get(k),
        set: (a) => (m) => {
          const x = HM.get_(m, k)
          if ((x._tag === "Some" && x.value === a) || !HM.has_(m, k)) {
            return m
          }
          return HM.set_(m, k, a)
        }
      })
  }
}

// -------------------------------------------------------------------------------------
// At
// -------------------------------------------------------------------------------------

export function atRecord<A = never>(): At<
  Readonly<Record<string, A>>,
  string,
  O.Option<A>
> {
  return {
    at: (key) =>
      new Lens({
        get: R.lookup(key),
        set: O.fold(
          () => R.deleteAt(key),
          (a) => R.insertAt(key, a)
        )
      })
  }
}

export function atHashMap<K = never, A = never>(): At<
  Readonly<HM.HashMap<K, A>>,
  K,
  O.Option<A>
> {
  return {
    at: (key) =>
      new Lens({
        get: HM.get(key),
        set: O.fold(
          () => HM.remove(key),
          (a) => HM.set(key, a)
        )
      })
  }
}
