import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendRegistrationEmail(name: string, email: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  const from = process.env.SMTP_FROM || "noreply@campus-clinic.edu";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px 24px; text-align: center; background: #1a1a2e; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Campus Clinic</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Welcome to the Campus Health System</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px;">Welcome, ${name}!</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Your account has been successfully created. You can now book appointments with campus doctors, 
                track your medical history, and communicate with the clinic staff.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Account</td>
                  <td style="font-size: 13px; color: #1a1a2e; font-weight: 600; text-align: right; padding: 4px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Status</td>
                  <td style="font-size: 13px; color: #059669; font-weight: 600; text-align: right; padding: 4px 0;">Active</td>
                </tr>
              </table>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                If you did not create this account, please contact the campus clinic immediately.
              </p>
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login"
                 style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none;
                        padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                Sign In to Your Account
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Campus Clinic &bull; Student Services Building &bull; Room 101<br>
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Campus Clinic" <${from}>`,
      to: email,
      subject: "Welcome to Campus Clinic - Registration Successful",
      html,
    });
  } catch (err) {
    console.error("Failed to send registration email:", err);
  }
}

export async function sendPasswordResetEmail(name: string, email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${token}`;

  const transporter = getTransporter();
  if (!transporter) {
    console.log("\n========================================");
    console.log(" PASSWORD RESET LINK (SMTP not configured)");
    console.log(` For: ${name} <${email}>`);
    console.log(` URL: ${resetUrl}`);
    console.log("========================================\n");
    return;
  }
  const from = process.env.SMTP_FROM || "noreply@campus-clinic.edu";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px 24px; text-align: center; background: #1a1a2e; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Campus Clinic</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px;">Hello, ${name}!</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                We received a request to reset your password. Click the button below to set a new password. 
                This link expires in 1 hour.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${resetUrl}"
                       style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none;
                              padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                If you did not request a password reset, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Campus Clinic &bull; Student Services Building &bull; Room 101<br>
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Campus Clinic" <${from}>`,
      to: email,
      subject: "Password Reset - Campus Clinic",
      html,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }
}
