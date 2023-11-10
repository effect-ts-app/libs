import type { MailContent, MailData } from "@sendgrid/helpers/classes/mail.js"
import type { ResponseError } from "@sendgrid/mail"
import type sgMail from "@sendgrid/mail"

/**
 * @tsplus type Emailer
 * @tsplus companion Emailer.Ops
 */
export abstract class Emailer extends TagClass<Emailer>() {
  abstract sendMail: (msg: EmailMsgOptionalFrom) => Effect<never, Error | ResponseError, void>
}

export interface SendgridConfig {
  defaultReplyTo?: Email | { name?: ReasonableString; email: Email }
  subjectPrefix: string
  realMail: boolean
  defaultFrom: Email | { name?: ReasonableString; email: Email }
  apiKey: ConfigSecret
}
export type EmailMsg = sgMail.MailDataRequired
export type EmailTemplateMsg = MailData & { templateId: string }

export type EmailMsgOptionalFrom =
  & Omit<MailData, "from">
  & (
    { text: string } | { html: string } | { templateId: string } | { content: NonEmptyReadonlyArray<MailContent> }
  )
  & Partial<Pick<EmailMsg, "from">>
