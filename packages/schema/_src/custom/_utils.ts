// tracing: off
import * as Equal from "@effect/data/Equal"
import * as Hash from "@effect/data/Hash"

export function augmentRecord(value: {}) {
  Object.defineProperty(value, Hash.symbol, {
    value: (): number => {
      const ka = Object.keys(value).sort()
      if (ka.length === 0) {
        return 0
      }
      let hash = Hash.combine(Hash.hash(value[ka[0]!]))(Hash.string(ka[0]!))
      let i = 1
      while (hash && i < ka.length) {
        hash = Hash.combine(
          Hash.combine(Hash.hash(value[ka[i]!]))(Hash.string(ka[i]!))
        )(hash)
        i++
      }
      return hash
    },
    enumerable: false
  })

  Object.defineProperty(value, Equal.symbol, {
    value: (that: unknown): boolean => {
      if (typeof that !== "object" || that == null) {
        return false
      }
      const ka = Object.keys(value)
      const kb = Object.keys(that)
      if (ka.length !== kb.length) {
        return false
      }
      let eq = true
      let i = 0
      const ka_ = ka.sort()
      const kb_ = kb.sort()
      while (eq && i < ka.length) {
        eq = ka_[i] === kb_[i] && Equal.equals(value[ka_[i]!], that[kb_[i]!])
        i++
      }
      return eq
    },
    enumerable: false
  })
}
