import { InvalidStateError } from "../client.js"

/**
 * @tsplus getter function asCollectable
 */
export function asCollectable<T, T2 extends T>(refinement: Refinement<T, T2>) {
  return (item: T) => Maybe.fromPredicate(item, refinement)
}

/**
 * @tsplus fluent function as
 */
export function as<T, T2 extends T>(refinement: Refinement<T, T2>, name: string) {
  return flow(
    asCollectable(refinement),
    _ => _.encaseInEither(() => new InvalidStateError({ message: `Cannot be ${name}` }))
  )
}

/**
 * @tsplus fluent function refinements
 */
export function makeAwesome<T, T2 extends T>(refinement: Refinement<T, T2>, name: string) {
  const as = refinement.as(name)
  const validate = {
    is: refinement,
    collect: refinement.asCollectable,
    as,
    asEffect: flow(as, Effect.fromEither)
  }
  function validatei(item: T) {
    return {
      get collect() {
        return validate.collect(item)
      },
      get as() {
        return validate.as(item)
      },
      get asEffect() {
        return validate.asEffect(item)
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
  (a: A): Maybe<B>
}

/**
 * @tsplus fluent function as
 */
export function asMaybe<T, T2 extends T>(collect: Collect<T, T2>, name: string) {
  return flow(collect, _ => _.encaseInEither(() => new InvalidStateError({ message: `Cannot be ${name}` })))
}

/**
 * @tsplus fluent function refinements
 */
export function makeAwesomeCollect<T, T2 extends T>(collect: Collect<T, T2>, name: string) {
  const as = collect.as(name)
  function is(item: T): item is T2 {
    return collect(item).isSome()
  }
  const validate = {
    collect,
    is,
    as,
    asEffect: flow(as, Effect.fromEither)
  }
  function validatei(item: T) {
    return {
      get collect() {
        return validate.collect(item)
      },
      get as() {
        return validate.as(item)
      },
      get asEffect() {
        return validate.asEffect(item)
      }
    }
  }
  return {
    ...validate,
    $item: validatei
  }
}
export type GetCollectedType<T> = T extends { collect: Collect<any, infer U> } ? U : never
