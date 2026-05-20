import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (toEmail, resetUrl) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#ff6b00,#e63946);padding:28px 32px;">
        <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;">bloggerLK</span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 10px;font-size:22px;color:#1a1a2e;">Reset your password</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Someone requested a password reset for your bloggerLK account.<br>
          Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:13px 28px;background:#ff6b00;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0;">
          If you didn't request this, you can safely ignore this email.<br>
          Your password won't change until you click the link above.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your bloggerLK password",
    html,
  });
};

export default transporter;
