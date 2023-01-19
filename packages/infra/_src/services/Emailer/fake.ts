import { pretty } from "@effect-app/prelude/utils"
import { Emailer } from "./service.js"

const makeFake = Effect.logDebug("FAKE Emailer Service enabled")
  .map((): Emailer => ({
    sendMail(msg) {
      return Effect.logDebug(`Fake send mail`).logAnnotate("msg", pretty(msg))
    }
  }))

/**
 * @tsplus static Emailer.Ops Fake
 */
export const FakeSendgrid = makeFake.toLayer(Emailer)
