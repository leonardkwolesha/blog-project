import "./sidebar.css";

const CATEGORIES = ["Technology", "Science", "Life", "Career", "Design", "Other"];

export default function Sidebar({ onCategoryClick }) {
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
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                className="sidebar-cat-btn"
                onClick={() => onCategoryClick && onCategoryClick(cat)}
              >
                {cat}
                <span className="sidebar-arrow">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-card sidebar-social">
        <h3 className="sidebar-heading">Follow</h3>
        <div className="sidebar-social-links">
          <a href="#" className="social-link" aria-label="Twitter / X">
            <i className="fa-brands fa-x-twitter" />
          </a>
          <a href="#" className="social-link" aria-label="GitHub">
            <i className="fa-brands fa-github" />
          </a>
          <a href="#" className="social-link" aria-label="LinkedIn">
            <i className="fa-brands fa-linkedin-in" />
          </a>
        </div>
      </div>
    </div>
  );
}
