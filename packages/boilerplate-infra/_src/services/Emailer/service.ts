import type { MailContent, MailData } from "@sendgrid/helpers/classes/mail.js"
import type { ResponseError } from "@sendgrid/mail"
import type sgMail from "@sendgrid/mail"

import type { RequestContext } from "../../lib/RequestContext.js"

export interface Emailer {
  sendMail: (msg: EmailMsgOptionalFrom) => Effect<RequestContext, Error | ResponseError, void>
}

/**
 * @tsplus type Emailer.Ops
 */
export interface EmailerOps extends Tag<Emailer> {}

export interface SendgridConfig {
  ENV: string
  FAKE_MAIL: boolean
  FROM: { name: ReasonableString; email: Email }
  SENDGRID_API_KEY: ReasonableString
}

export const Emailer: EmailerOps = Tag<Emailer>()

export type EmailMsg = sgMail.MailDataRequired
export type EmailTemplateMsg = MailData & { templateId: string }

export type EmailMsgOptionalFrom =
  & Omit<MailData, "from">
  & (
    { text: string } | { html: string } | { templateId: string } | { content: NonEmptyArray<MailContent> }
  )
  & Partial<Pick<EmailMsg, "from">>
