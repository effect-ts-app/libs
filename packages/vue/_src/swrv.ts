import { Done } from "@effect-app/prelude/client/QueryResult"
import * as swrv from "swrv"
import type { fetcherFn, IKey, IResponse } from "swrv/dist/types.js"

type useSWRVType = {
  <Data, Error>(key: IKey): IResponse<Data, Error>
  <Data, Error>(
    key: IKey,
    fn?: fetcherFn<Data>,
    config?: swrv.IConfig<Data, fetcherFn<Data>>
  ): IResponse<Data, Error>
}
type MutateType = {
  <Data>(
    key: string,
    res: Data | Promise<Data>,
    cache?: swrv.SWRVCache<Omit<IResponse<any, any>, "mutate">>,
    ttl?: number
  ): Promise<{
    data: any
    error: any
    isValidating: any
  }>
}
// madness - workaround different import behavior on server and client
export const useSWRV = (swrv.default.default ? swrv.default.default : swrv.default) as unknown as useSWRVType
export const mutate = (swrv.default.mutate ? swrv.default.mutate : swrv.mutate) as unknown as MutateType

export function swrToQuery<E, A>(
  r: { error: E | undefined; data: A | undefined; isValidating: boolean }
): QueryResult<E, A> {
  if (r.error) {
    return r.isValidating
      ? Refreshing.fail<E, A>(r.error, r.data)
      : Done.fail<E, A>(r.error, r.data)
  }
  if (r.data !== undefined) {
    return r.isValidating
      ? Refreshing.succeed<A, E>(r.data)
      : Done.succeed<A, E>(r.data)
  }

  return r.isValidating ? new Loading() : new Initial()
}
