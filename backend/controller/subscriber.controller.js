import Subscriber from "../models/subscriber.model.js";
import { canSendEmail, sendWelcomeEmail } from "../config/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const frontendBase = () =>
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")[0].trim()
    : "http://localhost:5173";

export const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }

  const normalized = email.trim().toLowerCase();

  try {
    const existing = await Subscriber.findOne({ email: normalized });

    if (existing) {
      if (existing.active) {
        // Return token so the frontend can mark this browser as subscribed
        return res.status(409).json({
          success: false,
          message: "This email is already subscribed.",
          token: existing.token,
          email: existing.email,
        });
      }
      // Reactivate a previously unsubscribed address
      existing.active = true;
      await existing.save();
      res.status(200).json({
        success: true,
        message: "Welcome back! You've been resubscribed.",
        token: existing.token,
        email: existing.email,
      });
      if (canSendEmail()) {
        sendWelcomeEmail({ email: existing.email }).catch((err) =>
          console.error("Welcome email error:", err.message)
        );
      }
      return;
    }

    const subscriber = await Subscriber.create({ email: normalized });
    res.status(201).json({
      success: true,
      message: "Subscribed! Check your inbox for a welcome email.",
      token: subscriber.token,
      email: subscriber.email,
    });

    if (canSendEmail()) {
      sendWelcomeEmail({ email: subscriber.email }).catch((err) =>
        console.error("Welcome email error:", err.message)
      );
    }
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ success: false, message: "Subscription failed. Please try again." });
  }
};

// DELETE /api/subscribers  — in-page unsubscribe (returns JSON, not HTML)
export const unsubscribeInline = async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ success: false, message: "Invalid unsubscribe token." });
  }

  try {
    const subscriber = await Subscriber.findOne({ token });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }
    if (!subscriber.active) {
      return res.status(200).json({ success: true, message: "Already unsubscribed." });
    }

    subscriber.active = false;
    await subscriber.save();

    return res.status(200).json({ success: true, message: "You've been unsubscribed successfully." });
  } catch (err) {
    console.error("unsubscribeInline error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to unsubscribe. Please try again." });
  }
};

export const unsubscribe = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(htmlPage("Invalid link", "This unsubscribe link is invalid or missing."));
  }

  try {
    const subscriber = await Subscriber.findOne({ token });
    if (!subscriber) {
      return res.status(404).send(htmlPage("Link not found", "This unsubscribe link is not recognised. You may have already unsubscribed."));
    }

    subscriber.active = false;
    await subscriber.save();

    res.send(htmlPage(
      "You've been unsubscribed",
      "You won't receive newsletter emails from bloggerLK anymore.<br>You can re-subscribe at any time from the footer.",
      frontendBase()
    ));
  } catch (err) {
    console.error("Unsubscribe error:", err.message);
    res.status(500).send(htmlPage("Something went wrong", "Please try again later."));
  }
};

function htmlPage(heading, body, backUrl = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading} — bloggerLK</title>
  <style>
    body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f8f8;}
    .card{background:#fff;border-radius:16px;padding:40px 36px;max-width:440px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .logo{font-size:20px;font-weight:900;background:linear-gradient(135deg,#ff6b00,#e63946);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;display:block;}
    h2{color:#1a1a2e;margin:0 0 12px;font-size:22px;}
    p{color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;}
    a{display:inline-block;padding:12px 28px;background:#ff6b00;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;}
  </style>
</head>
<body>
  <div class="card">
    <span class="logo">bloggerLK</span>
    <h2>${heading}</h2>
    <p>${body}</p>
    ${backUrl ? `<a href="${backUrl}">Back to bloggerLK</a>` : ""}
  </div>
</body>
</html>`;
}
