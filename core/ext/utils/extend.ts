export const extend = <T, X>(a: T, ext: X) => {
  Object.assign(a, ext)
  return a as T & X
}

export const extendM = <T, X>(a: T, ext: (a: T) => X) => {
  Object.assign(a, ext(a))
  return a as typeof a & X
}
