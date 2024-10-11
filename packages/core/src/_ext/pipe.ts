/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { type Pipeable, pipeArguments } from "effect/Pipeable"

declare global {
  interface Object extends Pipeable {}
}

Object.defineProperty(Object.prototype, "pipe", {
  enumerable: false,
  configurable: true,
  value(...args: any[]) {
    return pipeArguments(this, ...args as [any])
  }
})
