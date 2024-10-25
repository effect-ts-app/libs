import { Effect } from "effect-app"
import { pretty } from "effect-app/utils"
import { InfraLogger } from "../logger.js"
import { Emailer } from "./service.js"

const makeFake = InfraLogger
  .logInfo("FAKE Emailer Service enabled")
  .pipe(Effect.map(() =>
    Emailer.of({
      sendMail(msg) {
        return InfraLogger
          .logDebug(`Fake send mail`)
          .pipe(Effect.annotateLogs("msg", pretty(msg)))
      }
    })
  ))

/**
 * @tsplus static Emailer.Ops Fake
 */
export const FakeSendgrid = Emailer.toLayer(makeFake)
