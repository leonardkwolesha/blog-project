import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "./About.css";

const STACK = [
  { icon: "fa-brands fa-react",    name: "React 19",      color: "#61dafb", desc: "Frontend UI"          },
  { icon: "fa-brands fa-node-js",  name: "Node.js",       color: "#83cd29", desc: "Server runtime"       },
  { icon: "fa-solid fa-database",  name: "MongoDB",       color: "#47a248", desc: "Database"             },
  { icon: "fa-solid fa-bolt",      name: "Express.js",    color: "#fff",    desc: "REST API"             },
  { icon: "fa-solid fa-cloud",     name: "Cloudinary",    color: "#3448c5", desc: "Image storage"        },
  { icon: "fa-solid fa-lock",      name: "JWT Auth",      color: "#f0b429", desc: "Authentication"       },
  { icon: "fa-brands fa-github",   name: "GitHub",        color: "#fff",    desc: "Version control"      },
];

const VALUES = [
  {
    icon: "fa-solid fa-feather-pointed",
    title: "Write Freely",
    desc: "No paywalls. No algorithms deciding what gets seen. Every post is published and readable by anyone.",
  },
  {
    icon: "fa-solid fa-bolt-lightning",
    title: "Built Fast",
    desc: "Optimised for speed with lazy loading, pagination, and a lean React + Vite build pipeline.",
  },
  {
    icon: "fa-solid fa-user-shield",
    title: "Secure by Design",
    desc: "JWT handles auth. Tokens are signed with HS256 and expire after 7 days. Only the author can edit or delete their own posts.",
  },
];

/* ── Counter — uses rAF easing so even small targets (6, 34) animate visibly ── */
function Counter({ target, duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref      = useRef(null);
  const started  = useRef(false);
  const rafId    = useRef(null);

  useEffect(() => {
    // Reset when target changes (live data arrives after static fallback)
    started.current = false;
    setCount(0);
    if (rafId.current) cancelAnimationFrame(rafId.current);

    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic — makes the tail slow down so small numbers feel weighty
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) {
            rafId.current = requestAnimationFrame(tick);
          } else {
            setCount(target);
          }
        };
        rafId.current = requestAnimationFrame(tick);
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  // inline-block gives the span a proper bounding-box for IntersectionObserver
  return <span ref={ref} style={{ display: "inline-block" }}>{count.toLocaleString()}</span>;
}

export default function About() {
  const [activeStack, setActiveStack] = useState(null);
  const [liveStats, setLiveStats]     = useState({ totalPosts: null, categoryCount: null });

  /* Fetch real post / category counts */
  useEffect(() => {
    axios.get(`${API_BASE}/api/posts/stats`)
      .then((r) => setLiveStats({ totalPosts: r.data.totalPosts, categoryCount: r.data.categoryCount }))
      .catch(() => {}); // silently fall back to static values below
  }, []);

  const STATS = [
    { icon: "fa-solid fa-pen-nib",      label: "Articles Published", value: liveStats.totalPosts   ?? 120  },
    { icon: "fa-solid fa-users",         label: "Active Readers",     value: 4800                          },
    { icon: "fa-solid fa-tags",          label: "Categories",         value: liveStats.categoryCount ?? 6  },
    { icon: "fa-solid fa-earth-africa",  label: "Countries Reached",  value: 34                            },
  ];

  return (
    <div className="ab-page">

      {/* ── HERO ── */}
      <section className="ab-hero">
        <div className="ab-hero-overlay" />
        <div className="ab-hero-content">
          <span className="ab-hero-chip">
            <i className="fa-solid fa-circle-info" /> About bloggerLK
          </span>
          <h1 className="ab-hero-title">Built for Developers,<br />by a Developer</h1>
          <p className="ab-hero-sub">
            A clean, open platform to write, share, and discover tech articles — no noise, no clickbait.
          </p>
          <div className="ab-hero-actions">
            <Link to="/" className="ab-btn-primary">
              <i className="fa-solid fa-newspaper" /> Browse Posts
            </Link>
            <Link to="/contact" className="ab-btn-outline">
              <i className="fa-solid fa-envelope" /> Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="ab-stats">
        {STATS.map(({ icon, label, value }) => (
          <div className="ab-stat-card" key={label}>
            <div className="ab-stat-icon">
              <i className={icon} />
            </div>
            <div className="ab-stat-num">
              <Counter target={value} />
              +
            </div>
            <div className="ab-stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ── MISSION ── */}
      <section className="ab-mission">
        <div className="ab-mission-text">
          <span className="ab-section-chip">
            <i className="fa-solid fa-bullseye" /> Our Mission
          </span>
          <h2>Knowledge should be free and accessible</h2>
          <p>
            bloggerLK started as a personal project to document learning in public. Today it's a
            platform where any developer can publish tutorials, project write-ups, opinions, and
            deep dives — without ads, trackers, or subscription gates.
          </p>
          <p>
            Every post is written in plain text, stored securely in MongoDB, and served fast. The
            stack is intentionally minimal so the focus stays on the writing.
          </p>
          <ul className="ab-mission-list">
            {[
              "Open to all skill levels — junior to senior",
              "Full CRUD — own your content completely",
              "Image uploads via Cloudinary — no local storage limits",
              "JWT authentication — sign in with email and password",
            ].map((item) => (
              <li key={item}>
                <i className="fa-solid fa-circle-check" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="ab-mission-img">
          <img
            src="https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Developer coding"
          />
          <div className="ab-mission-img-badge">
            <i className="fa-brands fa-github" />
            <span>Open Source Spirit</span>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="ab-stack-section">
        <div className="ab-section-header">
          <span className="ab-section-chip">
            <i className="fa-solid fa-layer-group" /> Tech Stack
          </span>
          <h2>What powers this platform</h2>
          <p>Every tool chosen for a reason — fast, free, and developer-friendly.</p>
        </div>
        <div className="ab-stack-grid">
          {STACK.map(({ icon, name, color, desc }) => (
            <div
              key={name}
              className={`ab-stack-card ${activeStack === name ? "active" : ""}`}
              onMouseEnter={() => setActiveStack(name)}
              onMouseLeave={() => setActiveStack(null)}
            >
              <i className={`${icon} ab-stack-icon`} style={{ color }} />
              <span className="ab-stack-name">{name}</span>
              <span className="ab-stack-desc">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="ab-values">
        <div className="ab-section-header">
          <span className="ab-section-chip">
            <i className="fa-solid fa-heart" /> Our Values
          </span>
          <h2>Principles behind every decision</h2>
        </div>
        <div className="ab-values-grid">
          {VALUES.map(({ icon, title, desc }) => (
            <div className="ab-value-card" key={title}>
              <div className="ab-value-icon">
                <i className={icon} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ab-cta">
        <i className="fa-solid fa-pen-to-square ab-cta-icon" />
        <h2>Ready to share your knowledge?</h2>
        <p>Create an account, write your first post, and publish it to the world in minutes.</p>
        <Link to="/dashboard" className="ab-btn-primary ab-btn-lg">
          <i className="fa-solid fa-rocket" /> Start Writing
        </Link>
      </section>

    </div>
  );
}
