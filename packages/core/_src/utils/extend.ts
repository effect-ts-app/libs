export const extend = <T extends {}, X extends {}>(a: T, ext: X) => {
  Object.assign(a, ext)
  return a as T & X
}

export const extendM = <T extends {}, X extends {}>(a: T, ext: (a: T) => X) => {
  Object.assign(a, ext(a))
  return a as typeof a & X
}
