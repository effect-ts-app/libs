/* eslint-disable @typescript-eslint/no-explicit-any */
import { Either, type Equal, flow, Option } from "@effect-app/core"
import type { Refinement } from "@effect-app/core/Function"
import * as Optic from "@effect-app/core/Optic"
import type { Clone } from "@fp-ts/optic"
import { InvalidStateError } from "./client.js"
import { clone, copy } from "./utils.js"

/**
 * @tsplus getter function asCollectable
 */
export function asCollectable<T, T2 extends T>(refinement: Refinement<T, T2>) {
  return Option.liftPredicate(refinement)
}

/**
 * @tsplus fluent function as
 */
export function as<T, T2 extends T>(refinement: Refinement<T, T2>, name: string) {
  return flow(
    asCollectable(refinement),
    (_) => Either.fromOption(_, () => new InvalidStateError(`Cannot be ${name}`))
  )
}

/**
 * @tsplus fluent function refinements
 */
export function makeAwesome<T, T2 extends T>(refinement: Refinement<T, T2>, name: string) {
  const _as = as(refinement, name)
  const validate = {
    is: refinement,
    collect: asCollectable(refinement),
    as: _as,
    lens: Optic.id<T2>()
  }
  function validatei(item: T) {
    return {
      get collect() {
        return validate.collect(item)
      },
      get as() {
        return validate.as(item)
      }
    }
  }
  return {
    ...validate,
    $item: validatei
  }
}

// The idea is that such refinements are dynamic
export interface Collect<A, B extends A> {
  (a: A): Option<B>
}

/**
 * @tsplus fluent function as
 */
export function asOption<T, T2 extends T>(collect: Collect<T, T2>, name: string) {
  return flow(collect, Either.fromOption(() => new InvalidStateError({ message: `Cannot be ${name}` })))
}

/**
 * @tsplus fluent function refinements
 */
export function makeAwesomeCollect<T extends Object, T2 extends T>(collect: Collect<T, T2>, name: string) {
  const _as = asOption(collect, name)
  function is(item: T): item is T2 {
    return Option.isSome(collect(item))
  }
  const validate = {
    collect,
    is,
    as: _as,
    lens: Optic.id<T2>(),
    copy: (item: T2, _copy: Partial<Omit<T2, keyof Clone | keyof Equal>>) => copy(item, _copy),
    clone: (item: T, cloned: T) => clone(item, cloned)
  }
  function validatei(item: T) {
    return {
      get collect() {
        return validate.collect(item)
      },
      get as() {
        return validate.as(item)
      }
    }
  }
  return {
    ...validate,
    $item: validatei
  }
}
export type GetCollectedType<T> = T extends { collect: Collect<any, infer U> } ? U : never
