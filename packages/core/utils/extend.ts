export const extend = <T extends Record<string, any>, X extends Record<string, any>>(
  a: T,
  ext: X
) => {
  Object.assign(a, ext)
  return a as T & X
}

export const extendM = <T extends Record<string, any>, X extends Record<string, any>>(
  a: T,
  ext: (a: T) => X
) => {
  Object.assign(a, ext(a))
  return a as typeof a & X
}
