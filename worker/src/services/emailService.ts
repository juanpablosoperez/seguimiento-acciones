import type { AppSettings } from '../types/domain'
import type { Env } from '../types/env'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export async function sendAlertEmail(env: Env, settings: AppSettings, input: SendEmailInput): Promise<void> {
  if (settings.emailProvider === 'mock' || !env.RESEND_API_KEY) {
    console.log('Mock email sent', JSON.stringify(input))
    return
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: settings.emailFrom || env.EMAIL_FROM || 'scanner@cedear-ar.app',
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  })
}
