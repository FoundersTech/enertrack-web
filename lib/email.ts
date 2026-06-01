import { Resend } from 'resend'

type SendEmailParams = {
  to: string
  subject: string
  html: string
  text?: string
}

type ResendEnv = {
  RESEND_API_KEY?: string
}

export async function sendEmail(env: unknown, params: SendEmailParams) {
  const { RESEND_API_KEY } = env as ResendEnv

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada.')
  }

  const resend = new Resend(RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'EnerTrack <no-reply@enertrack.site>',
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  })

  if (error) {
    throw new Error(error.message)
  }
}