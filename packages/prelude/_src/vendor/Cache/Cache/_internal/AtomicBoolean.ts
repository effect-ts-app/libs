import { AtomicReference } from "./AtomicReference.js"

export class AtomicBoolean extends AtomicReference<boolean> {
  constructor(b: boolean) {
    super(b)
  }
}
