import { useRef, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Posts from "../../components/posts/Posts";
import "./homepage.css";

const NAV_HEIGHT = 70; // 58px sticky nav + 12px breathing room

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("");
  const postsRef = useRef(null);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat) {
      setTimeout(() => {
        if (!postsRef.current) return;
        // Offset by the sticky topbar height so the filter bar isn't hidden underneath it
        const top = postsRef.current.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 80);
    }
  };

  return (
    <>
      <Header onCategoryChange={handleCategoryChange} activeCategory={activeCategory} />
      <div className="home-layout">
        <main className="home-main" ref={postsRef}>
          {activeCategory && (
            <div className="home-filter-bar">
              <i className="fa-solid fa-filter home-filter-icon" />
              <span>Showing: <strong>{activeCategory}</strong></span>
              <button className="clear-filter" onClick={() => setActiveCategory("")}>
                <i className="fa-solid fa-xmark" /> Clear
              </button>
            </div>
          )}
          <Posts category={activeCategory} />
        </main>
        <aside className="home-sidebar">
          <Sidebar onCategoryClick={handleCategoryChange} activeCategory={activeCategory} />
        </aside>
      </div>
    </>
  );
}
