import { useState } from "react";
import { Link } from "react-router-dom";
import "./legal.css";

const SECTIONS = [
  {
    id: "acceptance",
    icon: "fa-solid fa-handshake",
    title: "Acceptance of Terms",
    content: `By accessing or using bloggerLK ("the Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please stop using the Platform immediately. These terms apply to all visitors, registered users, and contributors.`,
  },
  {
    id: "eligibility",
    icon: "fa-solid fa-user-check",
    title: "Eligibility",
    content: `You must be at least 13 years old to use bloggerLK. By creating an account you represent that you meet this requirement. If you are under 18, you confirm that a parent or guardian has reviewed and agreed to these terms on your behalf.`,
  },
  {
    id: "accounts",
    icon: "fa-solid fa-id-card",
    title: "User Accounts",
    bullets: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You are solely responsible for all activity that occurs under your account.",
      "You must notify us immediately of any unauthorised use of your account.",
      "We reserve the right to suspend or terminate accounts that violate these terms.",
      "One person may not maintain more than one active account.",
    ],
  },
  {
    id: "content",
    icon: "fa-solid fa-pen-to-square",
    title: "User-Generated Content",
    content: `When you publish a post, upload an image, or submit any content ("User Content") on bloggerLK, you retain full ownership of that content. By submitting it, you grant bloggerLK a non-exclusive, worldwide, royalty-free licence to display, distribute, and promote your content within the Platform.`,
    bullets: [
      "Content must not violate any applicable law or regulation.",
      "Content must not infringe third-party intellectual property rights.",
      "Content must not contain hate speech, harassment, or explicit material.",
      "Content must not include malware, spam, or deceptive information.",
      "We may remove any content that violates these guidelines without prior notice.",
    ],
  },
  {
    id: "ip",
    icon: "fa-solid fa-copyright",
    title: "Intellectual Property",
    content: `The bloggerLK name, logo, design, and all Platform-level code are the intellectual property of bloggerLK and its developers. You may not copy, reproduce, or distribute any part of the Platform without express written permission. User Content remains the intellectual property of the respective authors.`,
  },
  {
    id: "conduct",
    icon: "fa-solid fa-shield-halved",
    title: "Prohibited Conduct",
    bullets: [
      "Attempting to hack, scrape, or disrupt the Platform's infrastructure.",
      "Impersonating another person or entity.",
      "Using automated bots to create accounts or post content.",
      "Selling, transferring, or sub-licensing your account access.",
      "Posting content that promotes illegal activities.",
      "Engaging in any form of harassment toward other users.",
    ],
  },
  {
    id: "disclaimer",
    icon: "fa-solid fa-triangle-exclamation",
    title: "Disclaimer of Warranties",
    content: `bloggerLK is provided on an "as-is" and "as-available" basis without warranties of any kind, express or implied. We do not guarantee uninterrupted access, error-free operation, or the accuracy of any user-submitted content. Use the Platform at your own risk.`,
  },
  {
    id: "liability",
    icon: "fa-solid fa-scale-balanced",
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, bloggerLK and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, even if we have been advised of the possibility of such damages.`,
  },
  {
    id: "changes",
    icon: "fa-solid fa-rotate",
    title: "Changes to These Terms",
    content: `We may update these Terms of Service at any time. Significant changes will be announced via a notice on the Platform or by email. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms. The "Last updated" date at the top of this page reflects the most recent revision.`,
  },
  {
    id: "contact",
    icon: "fa-solid fa-envelope",
    title: "Contact Us",
    content: `Questions about these Terms? Reach out at leonardsengoma07@gmail.com or use the Contact page. We aim to respond within 3 business days.`,
  },
];

export default function TermsOfService() {
  const [active, setActive] = useState(null);

  return (
    <div className="legal-page">

      {/* Hero */}
      <section className="legal-hero">
        <div className="legal-hero-overlay" />
        <div className="legal-hero-content">
          <span className="legal-chip">
            <i className="fa-solid fa-file-contract" /> Legal
          </span>
          <h1 className="legal-hero-title">Terms of Service</h1>
          <p className="legal-hero-sub">
            Please read these terms carefully before using bloggerLK. They govern your use of the Platform.
          </p>
          <p className="legal-updated">
            <i className="fa-regular fa-calendar" /> Last updated: May 2025
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="legal-body">

        {/* Sidebar TOC */}
        <aside className="legal-toc">
          <p className="legal-toc-title">On this page</p>
          <ul>
            {SECTIONS.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`legal-toc-link ${active === id ? "active" : ""}`}
                  onClick={() => setActive(id)}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Sections */}
        <article className="legal-content">
          <div className="legal-intro-box">
            <i className="fa-solid fa-circle-info" />
            <p>
              These Terms of Service ("Terms") form a legally binding agreement between you and bloggerLK.
              By creating an account or browsing the site you agree to these terms in full.
            </p>
          </div>

          {SECTIONS.map(({ id, icon, title, content, bullets }) => (
            <section key={id} id={id} className="legal-section">
              <div className="legal-section-header">
                <div className="legal-section-icon">
                  <i className={icon} />
                </div>
                <h2 className="legal-section-title">{title}</h2>
              </div>
              {content && <p className="legal-section-text">{content}</p>}
              {bullets && (
                <ul className="legal-bullets">
                  {bullets.map((b) => (
                    <li key={b}>
                      <i className="fa-solid fa-circle-dot" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Bottom nav */}
          <div className="legal-bottom-nav">
            <Link to="/privacy" className="legal-nav-btn">
              <i className="fa-solid fa-arrow-left" /> Privacy Policy
            </Link>
            <Link to="/contact" className="legal-nav-btn legal-nav-btn-primary">
              Contact Us <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
