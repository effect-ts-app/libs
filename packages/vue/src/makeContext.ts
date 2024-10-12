import { inject, type InjectionKey, provide } from "vue"

export const makeContext = <T>(def: T) => {
  const key = Symbol() as InjectionKey<T>
  return {
    use: () => inject(key, def),
    provide: (locale: T) => provide(key, locale)
  }
}
