import { Emailer } from "./service.js"

const makeFake = Effect.logDebug("FAKE Emailer Service enabled")
  .map((): Emailer => ({
    sendMail(msg) {
      return Effect.logDebug(`Fake send mail ${JSON.stringify(msg, undefined, 2)}`)
    }
  }))

/**
 * @tsplus static Emailer.Ops Fake
 */
export const FakeSendgrid = Layer.fromEffect(Emailer)(makeFake)
