interface BaseEmailTemplateOptions {
  title: string;
  preheader?: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
}

export const baseEmailTemplate = ({
  title,
  preheader,
  body,
  buttonText,
  buttonUrl,
}: BaseEmailTemplateOptions): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#eef1f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    ${
      preheader
        ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>`
        : ''
    }

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
      <tr>
        <td align="center">

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;">

            <!-- Logo / brand -->
            <tr>
              <td style="padding-bottom:24px; text-align:center;">
                <span style="font-size:18px; font-weight:700; color:#111827; letter-spacing:-0.02em;">
                  AI Vidsum
                </span>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background-color:#ffffff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(17,24,39,0.06); overflow:hidden;">

                <!-- Gradient header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); padding:40px 32px 32px;">
                      <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.01em;">
                        ${title}
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Body -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:32px;">
                      <div style="color:#4b5563; font-size:15px; line-height:1.65;">
                        ${body}
                      </div>

                      ${
                        buttonUrl && buttonText
                          ? `
                      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                        <tr>
                          <td style="border-radius:10px; background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); box-shadow:0 4px 12px rgba(79,70,229,0.35);">
                            
                              href="${buttonUrl}"
                              target="_blank"
                              style="display:inline-block; padding:13px 28px; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px; border-radius:10px;"
                            >
                              ${buttonText}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:20px 0 0; color:#9ca3af; font-size:12px; line-height:1.5;">
                        Or copy and paste this link into your browser:<br />
                        <a href="${buttonUrl}" style="color:#4f46e5; word-break:break-all;">${buttonUrl}</a>
                      </p>
                      `
                          : ''
                      }
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 8px; text-align:center;">
                <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                  If you didn't request this email, you can safely ignore it.<br />
                  &copy; ${new Date().getFullYear()} AI Vidsum. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
