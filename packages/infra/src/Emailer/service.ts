import type { MailContent, MailData } from "@sendgrid/helpers/classes/mail.js"
import type { ResponseError } from "@sendgrid/mail"
import type sgMail from "@sendgrid/mail"
import type { Effect, NonEmptyReadonlyArray, Redacted } from "effect-app"
import { Context } from "effect-app"
import type { Email, NonEmptyString255 } from "effect-app/Schema"

/**
 * @tsplus type Emailer
 * @tsplus companion Emailer.Ops
 */
export class Emailer extends Context.TagId("effect-app/Emailer")<Emailer, {
  sendMail: (msg: EmailMsgOptionalFrom) => Effect<void, Error | ResponseError>
}>() {}

export interface SendgridConfig {
  defaultReplyTo?: Email | { name?: NonEmptyString255; email: Email }
  subjectPrefix: string
  realMail: boolean
  defaultFrom: Email | { name?: NonEmptyString255; email: Email }
  apiKey: Redacted.Redacted<string>
}
export type EmailMsg = sgMail.MailDataRequired
export type EmailTemplateMsg = MailData & { templateId: string }

export type EmailMsgOptionalFrom =
  & Omit<MailData, "from">
  & (
    { text: string } | { html: string } | { templateId: string } | { content: NonEmptyReadonlyArray<MailContent> }
  )
  & Partial<Pick<EmailMsg, "from">>
