import "./sidebar.css";

const CATEGORIES = [
  { name: "Technology", icon: "fa-solid fa-microchip" },
  { name: "Science",    icon: "fa-solid fa-flask"     },
  { name: "Life",       icon: "fa-solid fa-heart"     },
  { name: "Career",     icon: "fa-solid fa-briefcase" },
  { name: "Design",     icon: "fa-solid fa-palette"   },
  { name: "Other",      icon: "fa-solid fa-ellipsis"  },
];

export default function Sidebar({ onCategoryClick, activeCategory }) {
  return (
    <div className="sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-heading">About This Blog</h3>
        <p className="sidebar-about">
          A space for developers and tech enthusiasts to share insights, tutorials, and ideas.
          Read what others are building, thinking, and learning.
        </p>
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-heading">Browse by Category</h3>
        <ul className="sidebar-cats">
          {CATEGORIES.map(({ name, icon }) => {
            const isActive = activeCategory === name;
            return (
              <li key={name}>
                <button
                  className={`sidebar-cat-btn${isActive ? " active" : ""}`}
                  onClick={() => onCategoryClick && onCategoryClick(isActive ? "" : name)}
                  aria-pressed={isActive}
                >
                  <span className="sidebar-cat-inner">
                    <i className={icon} />
                    {name}
                  </span>
                  <i className={`fa-solid ${isActive ? "fa-circle-xmark" : "fa-chevron-right"} sidebar-cat-arrow`} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-card sidebar-social">
        <h3 className="sidebar-heading">Follow</h3>
        <div className="sidebar-social-links">
          <a href="https://github.com/leonardkwolesha/" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
            <i className="fa-brands fa-github" />
          </a>
          <a href="https://www.linkedin.com/in/leonard-sengoma-39a337351/" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
            <i className="fa-brands fa-linkedin-in" />
          </a>
        </div>
      </div>
    </div>
  );
}
