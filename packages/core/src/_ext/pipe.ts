/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { type Pipeable, pipeArguments } from "effect/Pipeable"

declare global {
  // Object makes trouble with Effect.Service etc
  // interface Object extends Pipeable {}
  interface Number extends Pipeable {}
  interface Boolean extends Pipeable {}
  interface String extends Pipeable {}
  interface Array<T> extends Pipeable {}
  interface ReadonlyArray<T> extends Pipeable {}
  interface Map<K, V> extends Pipeable {}
  interface ReadonlyMap<K, V> extends Pipeable {}
  interface Set<T> extends Pipeable {}
  interface ReadonlySet<T> extends Pipeable {}
  interface Date extends Pipeable {}
  interface Iterable<T, TReturn = any, TNext = any> extends Pipeable {}
  interface Iterator<T, TReturn = any, TNext = any> extends Pipeable {}
  interface Function extends Pipeable {}
}

Object.defineProperty(Object.prototype, "pipe", {
  enumerable: false,
  configurable: true,
  writable: true,
  value(...args: any[]) {
    return pipeArguments(this, ...args as [any])
  }
})
