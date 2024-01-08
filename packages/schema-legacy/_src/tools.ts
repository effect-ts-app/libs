export type _OptionalKeys<O> = {
  [K in keyof O]-?: {} extends Pick<O, K> ? K
    : never
}[keyof O]
export type FilterOptionalKeys<A> = Omit<A, _OptionalKeys<A>>
export type OptionalConstructor<A> = A extends Record<PropertyKey, never> ? void
  : FilterOptionalKeys<A> extends Record<PropertyKey, never> ? void | A
  : A
