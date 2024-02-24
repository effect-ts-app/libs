import { pretty } from "effect-app/utils"
import { Emailer } from "./service.js"
import { Effect } from "effect-app"

const makeFake = Effect
  .logDebug("FAKE Emailer Service enabled")
  .map(() =>
    new Emailer({
      sendMail(msg) {
        return Effect.logDebug(`Fake send mail`).annotateLogs("msg", pretty(msg))
      }
    })
  )

/**
 * @tsplus static Emailer.Ops Fake
 */
export const FakeSendgrid = makeFake.toLayer(Emailer)
