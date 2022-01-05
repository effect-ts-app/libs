// TODO: Add exceptions. like `map_` -> "mapRA"
// for each property starting with lowerCase
// if the property does not end with _,
//   if there is no same name property ending with _
//   use it (check exceptions)
// else
//   use it (check exceptions)
// TODO: drop constructors, via exceptions
export function makeAutoFuncs(
  mod: Record<string, unknown>,
  exceptions: Record<string, string | null>
) {
  return Object.entries(mod).reduce((prev, [key, fnc]) => {
    // We only want functions, they usuaully start with lowercase
    // We only want non-curried functions, they usually end with _
    if (key[0] !== key[0].toLowerCase() || (!key.endsWith("_") && `${key}_` in mod)) {
      return prev
    }

    const ex = exceptions[key]
    if (ex === null) {
      return prev
    }
    const alias = ex ?? (key.endsWith("_") ? key.substring(0, key.length - 1) : key)
    prev[alias] = fnc

    return prev
  }, {})
}

export function applyFunctions(
  functions: Record<string, unknown>,
  mod: Record<string, unknown>,
  modName: string
) {
  Object.entries(functions).forEach(([k, v]) => {
    // don't overwrite...
    if (mod[k]) {
      console.log(`$$$ polyfill; skipping already existing ${k} on ${modName}`)
      return
    }
    const f = v as any
    Object.defineProperty(mod, k, {
      enumerable: false,
      configurable: true,
      value(...args: [any]) {
        return f(this, ...args)
      },
    })
    // mod[k] = function (...args: [any]) {
    //   return f(this, ...args)
    // }
  })
}
