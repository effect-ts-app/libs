import type { EmailData } from "@sendgrid/helpers/classes/email-address.js"
import sgMail from "@sendgrid/mail"
import { inspect } from "util"
import { Emailer } from "./service.js"
import type { EmailMsg, EmailMsgOptionalFrom, SendgridConfig } from "./service.js"

const makeLiveSendgrid = ({ ENV, FAKE_MAIL, FROM, SENDGRID_API_KEY }: SendgridConfig) =>
  Effect.sync(() => {
    sgMail.setApiKey(SENDGRID_API_KEY)

    return {
      sendMail(msg_: EmailMsgOptionalFrom) {
        return Effect.gen(function*($) {
          const msg = { ...msg_, from: msg_.from ?? FROM }
          const render = renderMessage(FAKE_MAIL)

          const renderedMsg_ = render(msg)
          const renderedMsg = { ...renderedMsg_, subject: `[scan] [${ENV}] ${renderedMsg_.subject}` }
          yield* $(Effect.logDebug("Sending email: " + inspect(renderedMsg, false, 5)))

          const ret = yield* $(
            Effect.async<
              never,
              Error | sgMail.ResponseError,
              [sgMail.ClientResponse, Record<string, unknown>]
            >(
              cb =>
                void sgMail.send(renderedMsg, false, (err, result) => err ? cb(Effect.fail(err)) : cb(Effect(result)))
            )
          )

          // const event = {
          //   name: "EmailSent",
          //   properties: {
          //     templateId: msg.templateId
          //   }
          // }
          // yield* $(Effect.logDebug("Tracking email event " + event.$$.pretty, ))
          // const { trackEvent } = yield* $(AiContextService)
          // trackEvent(event)
          return ret
        })
      }
    }
  })

/**
 * @tsplus static Emailer.Ops LiveSendgrid
 */
export function LiveSendgrid(config: SendgridConfig) {
  return Layer.fromEffect(Emailer)(makeLiveSendgrid(config))
}

/**
 * @hidden
 */
export function renderMessage(forceFake: boolean) {
  let i = 0
  const makeId = () => i++
  return forceFake
    ? (msg: EmailMsg) => ({
      ...msg,
      to: msg.to && renderFake(msg.to, makeId),
      cc: msg.cc && renderFake(msg.cc, makeId),
      bcc: msg.bcc && renderFake(msg.bcc, makeId)
    })
    : (msg: EmailMsg) => ({
      ...msg,
      to: msg.to && renderFakeIfTest(msg.to, makeId),
      cc: msg.cc && renderFakeIfTest(msg.cc, makeId),
      bcc: msg.bcc && renderFakeIfTest(msg.bcc, makeId)
    })
}

/**
 * @hidden
 */
export function isTestAddress(to: EmailData) {
  return (
    (typeof to === "string" && to.toLowerCase().endsWith(".test")) ||
    (typeof to === "object" &&
      "email" in to &&
      to.email.toLowerCase().endsWith(".test"))
  )
}

function renderFake(addr: EmailData | EmailData[], makeId: () => number) {
  return {
    name: renderMailData(addr),
    email: `test+${makeId()}@nomizz.com`
  }
}
const eq = Equivalence.$.contramap((to: { name?: string; email: string } | string) =>
  typeof to === "string" ? to.toLowerCase() : to.email.toLowerCase()
)(Equivalence.string)

// TODO: should just not add any already added email address
// https://stackoverflow.com/a/53603076/11595834
function renderFakeIfTest(addr: EmailData | EmailData[], makeId: () => number) {
  return ROArray.isArray(addr)
    ? addr
      .map(x => (isTestAddress(x) ? renderFake(x, makeId) : x))
      .uniq(eq)
      .mutable
    : isTestAddress(addr)
    ? renderFake(addr, makeId)
    : addr
}

function renderMailData(md: NonNullable<EmailMsg["to"]>): string {
  if (ROArray.isArray(md)) {
    return md.map(renderMailData).join(", ")
  }
  if (typeof md === "string") {
    return md
  }
  return md.email
}
