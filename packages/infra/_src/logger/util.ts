// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prettyJson = (obj: any): string => {
  return JSON.stringify(obj, undefined, 2)
}
