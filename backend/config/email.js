import nodemailer from "nodemailer";

// Check whether email credentials are actually configured
export const canSendEmail = () =>
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Build the transporter on every call so it reads credentials from process.env
// at call time — not at import time. ESM hoists all imports before any module
// body runs, so a module-level transporter would capture undefined credentials
// even when dotenv.config() is called at the top of index.js.
const makeTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Required when a local proxy (antivirus / corporate firewall) performs
      // SSL inspection and re-signs the Gmail cert with its own CA.
      rejectUnauthorized: false,
    },
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     15_000,
  });

export const sendContactOwnerEmail = async ({ name, email, message }) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#ff6b00,#e63946);padding:24px 32px;">
        <span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.3px;">bloggerLK — New Message</span>
      </div>
      <div style="padding:28px 32px;">
        <p style="margin:0 0 6px;font-size:13px;color:#aaa;text-transform:uppercase;letter-spacing:1px;font-weight:700;">From</p>
        <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;font-weight:600;">${name} &lt;${email}&gt;</p>
        <p style="margin:0 0 6px;font-size:13px;color:#aaa;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message</p>
        <div style="background:#f8f8f8;border-left:4px solid #ff6b00;border-radius:0 10px 10px 0;padding:16px 20px;">
          <p style="margin:0;font-size:15px;color:#333;line-height:1.7;white-space:pre-line;">${message}</p>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#bbb;">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    </div>
  `;

  await makeTransporter().sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New contact message from ${name}`,
    html,
  });
};

export const sendContactConfirmEmail = async ({ name, email }) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#ff6b00,#e63946);padding:28px 32px;">
        <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;">bloggerLK</span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 10px;font-size:22px;color:#1a1a2e;">Thanks for reaching out, ${name}!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
          We've received your message and will get back to you within <strong>24 hours</strong>.
        </p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
          In the meantime, feel free to browse articles on the platform.
        </p>
        <a href="${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0].trim() : "http://localhost:5173"}"
           style="display:inline-block;padding:13px 28px;background:#ff6b00;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          Browse Articles
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0;">
          If you didn't submit this form, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  await makeTransporter().sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "We received your message — bloggerLK",
    html,
  });
};

export const sendWelcomeEmail = async ({ email }) => {
  const frontendUrl = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")[0].trim()
    : "http://localhost:5173";

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#ff6b00,#e63946);padding:28px 32px;">
        <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;">bloggerLK</span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 10px;font-size:22px;color:#1a1a2e;">You're subscribed!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Welcome to the bloggerLK newsletter. You'll be the first to know whenever a new article drops.
        </p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
          In the meantime, browse what's already published.
        </p>
        <a href="${frontendUrl}"
           style="display:inline-block;padding:13px 28px;background:#ff6b00;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          Browse Articles
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0;">
          Didn't subscribe? You can safely ignore this email — nothing will be sent without your action.
        </p>
      </div>
    </div>
  `;

  await makeTransporter().sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "You're subscribed to bloggerLK",
    html,
  });
};

export const sendNewPostEmail = async ({ email, post, unsubscribeToken }) => {
  const frontendUrl = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")[0].trim()
    : "http://localhost:5173";

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 2030}`;
  const postUrl = `${frontendUrl}/post/${post.id}`;
  const unsubUrl = `${backendUrl}/api/subscribers/unsubscribe?token=${unsubscribeToken}`;

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#ff6b00,#e63946);padding:28px 32px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;">bloggerLK</span>
        <span style="background:rgba(255,255,255,0.18);color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-left:auto;">New Article</span>
      </div>
      <div style="padding:32px;">
        ${post.category ? `<span style="display:inline-block;background:#fff4ec;color:#ff6b00;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:16px;">${post.category}</span>` : ""}
        <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;line-height:1.3;">${post.title}</h2>
        ${post.description ? `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">${post.description}</p>` : ""}
        <a href="${postUrl}"
           style="display:inline-block;padding:13px 28px;background:#ff6b00;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          Read Article →
        </a>
        <p style="color:#aaa;font-size:12px;margin:28px 0 0;border-top:1px solid #f0f0f0;padding-top:20px;">
          You're receiving this because you subscribed to bloggerLK updates.<br>
          <a href="${unsubUrl}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  await makeTransporter().sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `New article: ${post.title}`,
    html,
  });
};

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

  await makeTransporter().sendMail({
    from: `"bloggerLK" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your bloggerLK password",
    html,
  });
};
