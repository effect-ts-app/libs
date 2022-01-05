// TODO: Add exceptions. like `map_` -> "mapRA"
// for each property starting with lowerCase
// if the property does not end with _,
//   if there is no same name property ending with _
//   use it (check exceptions)
// else
//   use it (check exceptions)
// TODO: drop constructors, via exceptions (`null` is drop?)
export function makeAutoFuncs(
  mod: Record<string, unknown>,
  exceptions: Record<string, string>
) {
  return Object.entries(mod).reduce((prev, [key, fnc]) => {
    // We only want functions, they usuaully start with lowercase
    // We only want non-curried functions, they usually end with _
    if (key[0] !== key[0].toLowerCase() || (!key.endsWith("_") && `${key}_` in mod)) {
      return prev
    }

    const ex = exceptions[key]
    const alias = ex ?? (key.endsWith("_") ? key.substring(0, key.length - 1) : key)
    prev[alias] = fnc

    return prev
  }, {})
}
