export * from "@effect-ts-app/schema2"

/**
 * Allow anonymous access
 */
export function allowAnonymous(cls: any) {
  Object.assign(cls, { allowAnonymous: true })
  return cls
}
