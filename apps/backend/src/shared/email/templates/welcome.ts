export function welcomeEmail(displayName: string, webUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Rudiment</title>
</head>
<body style="margin:0;padding:0;background:#0d0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background:#1a1a22;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 32px;border-bottom:1px solid #2a2a35;">
              <div style="display:inline-block;background:#7c3aed;border-radius:12px;padding:8px 16px;">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">🥁 Rudiment</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#f1f1f5;line-height:1.2;">
                Welcome, ${displayName}! 🎉
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                You've joined the #1 platform for serious drummers. Whether you're a beginner
                finding your first groove or an advanced player refining your technique — we've got
                courses built for you.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Head to the library and start your first course today.
              </p>
              <a href="${webUrl}/library"
                style="display:inline-block;background:#7c3aed;color:#fff;font-size:15px;font-weight:600;
                  text-decoration:none;padding:14px 32px;border-radius:10px;">
                Browse Courses →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a35;">
              <p style="margin:0;font-size:12px;color:#555570;line-height:1.5;">
                You received this email because you created an account on Rudiment.<br />
                <a href="${webUrl}" style="color:#7c3aed;text-decoration:none;">rudiment.pro</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
