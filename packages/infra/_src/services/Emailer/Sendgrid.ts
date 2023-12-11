import type { EmailData } from "@sendgrid/helpers/classes/email-address.js"
import sgMail from "@sendgrid/mail"
import { inspect } from "util"
import { Emailer } from "./service.js"
import type { EmailMsg, EmailMsgOptionalFrom, SendgridConfig } from "./service.js"

const makeLiveSendgrid = ({ apiKey, defaultFrom, defaultReplyTo, realMail, subjectPrefix }: SendgridConfig) =>
  Effect.sync(() => {
    sgMail.setApiKey(apiKey.value)

    return {
      sendMail(msg_: EmailMsgOptionalFrom) {
        return Effect.gen(function*($) {
          const msg: EmailMsg = {
            ...msg_,
            from: msg_.from ?? defaultFrom,
            replyTo: msg_.replyTo ?? (msg_.from ? undefined : defaultReplyTo)
          }
          const render = renderMessage(!realMail)

          const renderedMsg_ = render(msg)
          const renderedMsg = { ...renderedMsg_, subject: `${subjectPrefix}${renderedMsg_.subject}` }
          yield* $(Effect.logDebug("Sending email").annotateLogs("msg", inspect(renderedMsg, false, 5)))

          const ret = yield* $(
            Effect.async<
              never,
              Error | sgMail.ResponseError,
              [sgMail.ClientResponse, Record<string, unknown>]
            >(
              (cb) =>
                void sgMail.send(renderedMsg, false, (err, result) =>
                  err
                    ? cb(Effect.fail(err))
                    : cb(Effect(result)))
            )
          )

          // const event = {
          //   name: "EmailSent",
          //   properties: {
          //     templateId: msg.templateId
          //   }
          // }
          // yield* $(Effect.logDebug("Tracking email event").annotateLogs("event", event.$$.pretty))
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
export function LiveSendgrid(config: Config<SendgridConfig>) {
  return config
    .flatMap(makeLiveSendgrid)
    .toLayer(Emailer)
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
    (typeof to === "string" && to.toLowerCase().endsWith(".test"))
    || (typeof to === "object"
      && "email" in to
      && to.email.toLowerCase().endsWith(".test"))
  )
}

function renderFake(addr: EmailData | EmailData[], makeId: () => number) {
  return {
    name: renderMailData(addr),
    email: `test+${makeId()}@nomizz.com`
  }
}
const eq = Equivalence.string.mapInput((to: { name?: string; email: string } | string) =>
  typeof to === "string" ? to.toLowerCase() : to.email.toLowerCase()
)

// TODO: should just not add any already added email address
// https://stackoverflow.com/a/53603076/11595834
function renderFakeIfTest(addr: EmailData | EmailData[], makeId: () => number) {
  return Array.isArray(addr)
    ? addr
      .map((x) => (isTestAddress(x) ? renderFake(x, makeId) : x))
      .uniq(eq)
      .toArray
    : isTestAddress(addr)
    ? renderFake(addr, makeId)
    : addr
}

function renderMailData(md: NonNullable<EmailMsg["to"]>): string {
  if (Array.isArray(md)) {
    return md.map(renderMailData).join(", ")
  }
  if (typeof md === "string") {
    return md
  }
  return md.email
}
