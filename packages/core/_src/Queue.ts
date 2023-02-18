import type { Dequeue } from "@effect/io/Queue"
import * as Q from "@effect/io/Queue"

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will take until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue takeWithEffect
 * @tsplus static effect/io/Queue/Dequeue.Ops takeWithEffect
 */
export function takeWithEffect<R, E, A, B>(
  f: (a: A) => Effect<R, E, B>
): (q: Dequeue<A>) => Effect<R, E, B> {
  return q => q.take().flatMap(f)
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will take until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue takeWith
 * @tsplus static effect/io/Queue/Dequeue.Ops takeWith
 */
export function takeWith<A, B>(f: (a: A) => B): (q: Dequeue<A>) => Effect<never, never, B> {
  return q => q.take().map(f)
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will take until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue filter
 * @tsplus static effect/io/Queue/Dequeue.Ops filter
 */
export function filter<A>(
  pred: Predicate<A>
): (q: Dequeue<A>) => Effect<never, never, A> {
  return q => q.take().flatMap(a => pred(a) ? Effect(a) : q["|>"](filter(pred)))
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will take until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue filterWithEffect
 * @tsplus static effect/io/Queue/Dequeue.Ops filterWithEffect
 */
export function filterWithEffect<R, E, A, B>(
  pred: Predicate<A>,
  f: (a: A) => Effect<R, E, B>
): (q: Dequeue<A>) => Effect<R, E, B> {
  return q => q.filter(pred).flatMap(f)
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will filter until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue filterWith
 * @tsplus static effect/io/Queue/Dequeue.Ops filterWith
 */
export function filterWith<A, B>(pred: Predicate<A>, f: (a: A) => B): (q: Dequeue<A>) => Effect<never, never, B> {
  return q => q.filter(pred).map(f)
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * Will take until filter map matches.
 * @tsplus pipeable effect/io/Queue/Dequeue filterMap
 * @tsplus static effect/io/Queue/Dequeue.Ops filterMap
 */
export function filterMap<A, B>(
  filter: (a: A) => Option<B>
): (q: Dequeue<A>) => Effect<never, never, B> {
  return q => Q.take(q).flatMap(a => filter(a).match(() => q["|>"](filterMap(filter)), b => Effect(b)))
}

/**
 * Takes the oldest value in the queue. If the queue is empty, this will return a computation that resumes when an item has been added to the queue.
 * If a filter is provided, will take until filter predicate matches.
 * @tsplus pipeable effect/io/Queue/Dequeue filterMapWithEffect
 * @tsplus static effect/io/Queue/Dequeue.Ops filterMapWithEffect
 */
export function filterMapWithEffect<R, E, A, B>(
  f: (a: A) => Effect<R, E, Option<B>>
): (q: Dequeue<A>) => Effect<R, E, B> {
  return q =>
    Q.take(q)
      .flatMap(a =>
        f(a).flatMap(_ =>
          _.match(
            () => q["|>"](filterMapWithEffect(f)),
            b => Effect(b)
          )
        )
      )
}

export * from "@effect/io/Queue"
