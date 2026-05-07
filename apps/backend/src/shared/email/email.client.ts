import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string | undefined;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!resend) {
    logger.warn({ to: opts.to, subject: opts.subject }, "Email skipped — RESEND_API_KEY not configured");
    return;
  }

  const { error } = await resend.emails.send({
    from: opts.from ?? env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    logger.error({ error, to: opts.to }, "Failed to send email");
  } else {
    logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
  }
}
