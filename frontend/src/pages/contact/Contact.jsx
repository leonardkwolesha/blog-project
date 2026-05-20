import { useState } from "react";
import axios from "axios";
import "./Contact.css";
import { API_BASE } from "../../config/api";

const MAX_MSG = 500;

const CONTACT_INFO = [
  {
    icon: "fa-solid fa-envelope",
    label: "Email",
    value: "leonardsengoma07@gmail.com",
    href: "mailto:leonardsengoma07@gmail.com",
  },
  {
    icon: "fa-brands fa-github",
    label: "GitHub",
    value: "github.com/leonardkwolesha",
    href: "https://github.com/leonardkwolesha",
  },
  {
    icon: "fa-brands fa-x-twitter",
    label: "Twitter / X",
    value: "@bloggerlk",
    href: "https://twitter.com",
  },
  {
    icon: "fa-solid fa-location-dot",
    label: "Location",
    value: "Dar es Salaam, Tanzania",
    href: null,
  },
];

const FAQS = [
  {
    q: "Can I publish articles without signing up?",
    a: "Reading is open to everyone. To create, edit, or delete posts you need a free account — sign in with Google or email via Clerk.",
  },
  {
    q: "Is my content stored safely?",
    a: "All posts are stored in MongoDB Atlas with encrypted connections. Images are hosted on Cloudinary. Your data is never sold or shared.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes. Head to your Dashboard, and you can delete all your posts at any time. For full account removal, drop us a message via this form.",
  },
  {
    q: "Can I contribute to the platform itself?",
    a: "Absolutely — the project is open to contributions. Reach out via the form with the subject 'Contribute' and we'll loop you in.",
  },
];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email.";
  if (!form.message.trim()) errors.message = "Message cannot be empty.";
  else if (form.message.trim().length < 10) errors.message = "Message must be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_MSG) return;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors((p) => ({ ...p, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const errs = validate(form);
    setErrors((p) => ({ ...p, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/contact/sent`, form);
      showToast("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
      setTouched({});
      setErrors({});
    } catch {
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const msgLeft = MAX_MSG - form.message.length;

  return (
    <div className="ct-page">
      {toast && (
        <div className={`ct-toast ct-toast-${toast.type}`}>
          <i className={toast.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} />
          {toast.msg}
        </div>
      )}

      {/* ── HERO ── */}
      <section className="ct-hero">
        <div className="ct-hero-overlay" />
        <div className="ct-hero-content">
          <span className="ct-hero-chip">
            <i className="fa-solid fa-headset" /> Get In Touch
          </span>
          <h1>We'd love to hear from you</h1>
          <p>Questions, feedback, collaboration ideas — send us a message and we'll reply within 24 hours.</p>
        </div>
      </section>

      {/* ── MAIN BODY ── */}
      <div className="ct-body">

        {/* LEFT — contact info + socials */}
        <aside className="ct-sidebar">
          <h2 className="ct-sidebar-title">Contact Details</h2>
          <p className="ct-sidebar-sub">Pick your preferred channel or fill in the form.</p>

          <div className="ct-info-list">
            {CONTACT_INFO.map(({ icon, label, value, href }) => (
              <div className="ct-info-card" key={label}>
                <div className="ct-info-icon">
                  <i className={icon} />
                </div>
                <div className="ct-info-text">
                  <span className="ct-info-label">{label}</span>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="ct-info-value">
                      {value}
                    </a>
                  ) : (
                    <span className="ct-info-value">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="ct-response-badge">
            <i className="fa-solid fa-clock" />
            <span>Typical response time: <strong>under 24 hours</strong></span>
          </div>
        </aside>

        {/* RIGHT — form */}
        <div className="ct-form-wrap">
          <h2 className="ct-form-title">Send a Message</h2>

          <form className="ct-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className={`ct-field ${errors.name && touched.name ? "error" : ""} ${form.name ? "filled" : ""}`}>
              <label htmlFor="ct-name">
                <i className="fa-solid fa-user" /> Full Name
              </label>
              <input
                id="ct-name"
                name="name"
                type="text"
                placeholder="Leonard Kwolesha"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
              />
              {errors.name && touched.name && (
                <span className="ct-error-msg">
                  <i className="fa-solid fa-triangle-exclamation" /> {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className={`ct-field ${errors.email && touched.email ? "error" : ""} ${form.email ? "filled" : ""}`}>
              <label htmlFor="ct-email">
                <i className="fa-solid fa-envelope" /> Email Address
              </label>
              <input
                id="ct-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {errors.email && touched.email && (
                <span className="ct-error-msg">
                  <i className="fa-solid fa-triangle-exclamation" /> {errors.email}
                </span>
              )}
            </div>

            {/* Message */}
            <div className={`ct-field ct-field-msg ${errors.message && touched.message ? "error" : ""}`}>
              <label htmlFor="ct-message">
                <i className="fa-solid fa-comment-dots" /> Message
              </label>
              <textarea
                id="ct-message"
                name="message"
                rows="6"
                placeholder="Tell us what's on your mind…"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="ct-char-row">
                {errors.message && touched.message && (
                  <span className="ct-error-msg">
                    <i className="fa-solid fa-triangle-exclamation" /> {errors.message}
                  </span>
                )}
                <span className={`ct-char-count ${msgLeft < 50 ? "low" : ""}`}>
                  {msgLeft} left
                </span>
              </div>
            </div>

            <button className="ct-submit" type="submit" disabled={loading}>
              {loading ? (
                <><span className="ct-spinner" /> Sending…</>
              ) : (
                <><i className="fa-solid fa-paper-plane" /> Send Message</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="ct-faq">
        <div className="ct-faq-header">
          <span className="ct-section-chip">
            <i className="fa-solid fa-circle-question" /> FAQ
          </span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="ct-faq-list">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className={`ct-faq-item ${openFaq === i ? "open" : ""}`}
            >
              <button
                className="ct-faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{q}</span>
                <i className={`fa-solid ${openFaq === i ? "fa-minus" : "fa-plus"} ct-faq-icon`} />
              </button>
              <div className="ct-faq-a">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
