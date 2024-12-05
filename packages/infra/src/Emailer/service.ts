import type { MailContent, MailData } from "@sendgrid/helpers/classes/mail.js"
import type { ResponseError } from "@sendgrid/mail"
import type { Effect, NonEmptyReadonlyArray, Redacted } from "effect-app"
import { Context } from "effect-app"
import type { Email } from "effect-app/Schema"

/**
 * @tsplus type Emailer
 * @tsplus companion Emailer.Ops
 */
export class Emailer extends Context.TagId("effect-app/Emailer")<Emailer, {
  sendMail: (msg: EmailMsgOptionalFrom) => Effect<void, Error | ResponseError>
}>() {}

export type EmailData = Email | {
  name?: string
  email: Email
}

export interface SendgridConfig {
  defaultReplyTo?: EmailData
  subjectPrefix: string
  realMail: boolean
  defaultFrom: EmailData
  apiKey: Redacted.Redacted<string>
}
export type EmailTemplateMsg = MailData & { templateId: string }

export type EmailRecipients = EmailData | NonEmptyReadonlyArray<EmailData>

export type EmailMsgBase =
  & Omit<MailData, "from" | "to" | "bcc" | "cc" | "content">
  & {
    to: EmailData | NonEmptyReadonlyArray<EmailData>
    cc?: EmailData | NonEmptyReadonlyArray<EmailData>
    bcc?: EmailData | NonEmptyReadonlyArray<EmailData>
    from: EmailData
    /**
     * should multiple `to` addresess be considered multiple emails?
     * defaults to `true`, not to leak email addresses
     */
    isMultiple?: boolean
  }

export type EmailContent = { text: string } | { html: string } | { templateId: string } | {
  content: NonEmptyReadonlyArray<MailContent>
}

export type EmailMsg =
  & EmailMsgBase
  & EmailContent

export type EmailMsgOptionalFrom = Omit<EmailMsgBase, "from"> & Partial<Pick<EmailMsg, "from">> & EmailContent
