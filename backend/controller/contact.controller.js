import Contact from "../models/contact.model.js";
import { canSendEmail, sendContactOwnerEmail, sendContactConfirmEmail } from "../config/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ success: false, message: "A valid email is required." });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters." });
    }
    if (message.trim().length > 500) {
      return res.status(400).json({ success: false, message: "Message must be 500 characters or less." });
    }

    const contact = await Contact.create({
      name:    name.trim().slice(0, 100),
      email:   email.trim().toLowerCase().slice(0, 200),
      message: message.trim().slice(0, 500),
    });

    // Respond immediately — email sending is non-blocking so it never delays the user
    res.status(201).json({ success: true, message: "Message sent successfully", data: contact });

    // Fire-and-forget: notify owner + send confirmation to sender
    if (canSendEmail()) {
      const payload = { name: contact.name, email: contact.email, message: contact.message };
      Promise.all([
        sendContactOwnerEmail(payload),
        sendContactConfirmEmail(payload),
      ]).catch((err) => {
        console.error("Contact email dispatch error:", err.message);
      });
    }
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: "Failed to save message" });
  }
};
