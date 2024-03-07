import { Effect } from "effect-app"
import { pretty } from "effect-app/utils"
import { Emailer } from "./service.js"

const makeFake = Effect
  .logDebug("FAKE Emailer Service enabled")
  .pipe(Effect.map(() =>
    Emailer.of({
      sendMail(msg) {
        return Effect
          .logDebug(`Fake send mail`)
          .pipe(Effect.annotateLogs("msg", pretty(msg)))
      }
    })
  ))

/**
 * @tsplus static Emailer.Ops Fake
 */
export const FakeSendgrid = Emailer.toLayer(makeFake)
