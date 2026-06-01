type PasswordResetEmailParams = {
  userName?: string | null
  otpCode: string
  expiresInMinutes?: number
}

const APP_URL = 'https://app.enertrack.site'

export function buildPasswordResetEmail({
  userName,
  otpCode,
  expiresInMinutes = 10,
}: PasswordResetEmailParams) {
  const displayName = userName?.trim() || 'usuário'
  const logoUrl = `${APP_URL}/favicon.ico`

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#f4f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0d1117;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#0b0f14;border:1px solid #243040;border-radius:22px;">
            <tr>
              <td align="center" style="padding:34px 32px 24px;">
                <img src="${logoUrl}" alt="EnerTrack" width="56" height="56" style="display:block;border-radius:14px;margin:0 auto 14px;" />

                <div style="font-size:28px;font-weight:800;color:#f4f7fb;line-height:1;">
                  EnerTrack
                </div>

                <div style="margin-top:10px;font-size:14px;color:#8b98a8;">
                  Monitoramento inteligente de energia
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 34px 34px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#111821;border:1px solid #26313f;border-radius:18px;">
                  <tr>
                    <td style="padding:30px 28px;">
                      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#9aa7b7;">
                        Olá, ${displayName}.
                      </p>

                      <h1 style="margin:0 0 14px;font-size:25px;line-height:1.25;color:#f4f7fb;">
                        Código para redefinir sua senha
                      </h1>

                      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#b7c2d0;">
                        Use o código abaixo para confirmar sua identidade e continuar com a troca da senha da sua conta EnerTrack.
                      </p>

                      <div style="background:#0d1117;border:1px solid #26313f;border-radius:16px;padding:26px 18px;text-align:center;margin-bottom:24px;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9aa7b7;margin-bottom:12px;">
                          Código temporário
                        </div>

                        <div style="font-size:42px;letter-spacing:10px;font-weight:800;color:#00e5a0;line-height:1;">
                          ${otpCode}
                        </div>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;">
                        <tr>
                          <td style="font-size:14px;line-height:1.6;color:#b7c2d0;">
                            Este código expira em <strong style="color:#f4f7fb;">${expiresInMinutes} minutos</strong>.
                            Se você não solicitou essa alteração, ignore este email.
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:22px;background:rgba(255,184,77,0.10);border:1px solid rgba(255,184,77,0.35);border-radius:14px;">
                        <tr>
                          <td style="padding:14px 16px;font-size:13px;line-height:1.5;color:#ffcf7a;">
                            Por segurança, nunca compartilhe este código com terceiros.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `
}