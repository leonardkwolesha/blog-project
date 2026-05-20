import { useState } from "react";
import { Link } from "react-router-dom";
import "./legal.css";

const SECTIONS = [
  {
    id: "overview",
    icon: "fa-solid fa-eye",
    title: "Overview",
    content: `bloggerLK ("we", "us", "our") respects your privacy. This Privacy Policy explains what personal data we collect, how we use it, and your rights regarding that data. This policy applies to all users of the bloggerLK web application.`,
  },
  {
    id: "data-collected",
    icon: "fa-solid fa-database",
    title: "Data We Collect",
    bullets: [
      "Account data — email address, username, and profile image provided at sign-up via Clerk.",
      "Content data — blog posts, titles, descriptions, categories, tags, and images you upload.",
      "Usage data — pages visited, search queries entered, and interaction timestamps (stored in server logs).",
      "Device data — browser type, operating system, and IP address collected automatically.",
      "Communication data — messages sent through the Contact page.",
    ],
  },
  {
    id: "how-we-use",
    icon: "fa-solid fa-gears",
    title: "How We Use Your Data",
    bullets: [
      "To create and manage your account.",
      "To display your published blog posts to other users.",
      "To store and serve uploaded images via Cloudinary.",
      "To respond to contact form messages.",
      "To detect and prevent abusive or fraudulent activity.",
      "To improve Platform performance and user experience.",
    ],
  },
  {
    id: "third-parties",
    icon: "fa-solid fa-share-nodes",
    title: "Third-Party Services",
    content: `We use a small number of trusted third-party services to operate the Platform. Each processes data under their own privacy policies:`,
    bullets: [
      "Clerk (clerk.com) — handles authentication, session tokens, and identity management.",
      "Cloudinary (cloudinary.com) — stores and delivers images you upload.",
      "MongoDB Atlas (mongodb.com) — stores your account and content data in a secure cloud database.",
    ],
  },
  {
    id: "cookies",
    icon: "fa-solid fa-cookie-bite",
    title: "Cookies & Local Storage",
    content: `bloggerLK uses minimal browser storage. Clerk sets a session cookie to keep you signed in. We do not use advertising cookies, tracking pixels, or third-party analytics trackers. You may disable cookies in your browser settings, though this will prevent you from staying signed in.`,
  },
  {
    id: "retention",
    icon: "fa-solid fa-clock-rotate-left",
    title: "Data Retention",
    content: `We retain your account and content data for as long as your account is active. If you delete a post, it is soft-deleted and fully removed from our database within 30 days. If you request account deletion, all associated personal data is permanently deleted within 14 days.`,
  },
  {
    id: "security",
    icon: "fa-solid fa-lock",
    title: "Security",
    content: `We take reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS), short-lived JWT tokens, and role-based access controls. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "rights",
    icon: "fa-solid fa-user-shield",
    title: "Your Rights",
    bullets: [
      "Access — request a copy of the personal data we hold about you.",
      "Correction — request that we correct inaccurate or incomplete data.",
      "Deletion — request that we delete your account and associated data.",
      "Portability — receive your content data in a machine-readable format.",
      "Objection — object to certain processing activities.",
    ],
    content: `To exercise any of these rights, email us at leonardsengoma07@gmail.com. We will respond within 14 days.`,
  },
  {
    id: "children",
    icon: "fa-solid fa-child",
    title: "Children's Privacy",
    content: `bloggerLK is not directed at children under 13. We do not knowingly collect personal data from children under 13. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly.`,
  },
  {
    id: "changes",
    icon: "fa-solid fa-rotate",
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect the most recent revision. Continued use of bloggerLK after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    id: "contact",
    icon: "fa-solid fa-envelope",
    title: "Contact",
    content: `Questions or concerns about this policy? Contact us at leonardsengoma07@gmail.com or via the Contact page. We aim to respond within 3 business days.`,
  },
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);

  return (
    <div className="legal-page">

      {/* Hero */}
      <section className="legal-hero">
        <div className="legal-hero-overlay" />
        <div className="legal-hero-content">
          <span className="legal-chip">
            <i className="fa-solid fa-shield-halved" /> Legal
          </span>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-sub">
            We take your privacy seriously. Here is exactly what data we collect, why, and how you can control it.
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
              Your privacy matters. We only collect what is necessary to operate the Platform and
              never sell your personal data to third parties.
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
            <Link to="/terms" className="legal-nav-btn">
              <i className="fa-solid fa-arrow-left" /> Terms of Service
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
