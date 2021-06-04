import { pipe } from "@effect-ts/core/Function"
import * as T from "@effect-ts-app/core/Effect"
import { datumEither } from "@nll/datum"
import { DatumEither } from "@nll/datum/DatumEither"
import { useCallback, useEffect, useRef, useState } from "react"

import { ProvidedEnv, useServiceContext } from "./context"

export type ResultTuple<Result> = readonly [result: Result, refresh: () => void]
export type QueryResultTuple<E, A> = ResultTuple<DatumEither<E, A>>

/**
 * Takes an Effect and turns it into a DatumEither and refresh function.
 *
 * NOTE:
 * Pass a stable Effect, otherwise will request at every render.
 * E.g memoize for a parameterised effect:
 * ```
 *  const findPO = useMemo(() => PurchaseOrders.find(id), [id])
 *  const [poResult] = useQuery(findPO)
 * ```
 */
export function useQuery<E, A>(
  self: T.Effect<ProvidedEnv, E, A>
): QueryResultTuple<E, A> {
  const { runWithErrorLog } = useServiceContext()
  const resultInternal = useRef(datumEither.constInitial())
  const [result, setResult] = useState<DatumEither<E, A>>(resultInternal.current)
  const [signal, setSignal] = useState(() => Symbol())
  const refresh = useCallback(() => setSignal(Symbol()), [])

  useEffect(() => {
    const loadingResult = datumEither.isInitial(resultInternal.current)
      ? datumEither.constPending()
      : datumEither.toRefresh(resultInternal.current)
    setResult((resultInternal.current = loadingResult))

    return runWithErrorLog(pipe(T.datumEitherResult(self), T.map(setResult)))
  }, [self, runWithErrorLog, signal])

  return [result, refresh] as const
}
