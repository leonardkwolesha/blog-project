import { useEffect, useRef, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Posts from "../../components/posts/Posts";
import "./homepage.css";

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("");
  const postsRef    = useRef(null);
  const cardsAnchor = useRef(null);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  useEffect(() => {
    if (!activeCategory) return;
    const target = cardsAnchor.current ?? postsRef.current;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [activeCategory]);

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
          {/* Scroll anchor — zero-height, sits right above the cards grid */}
          <div ref={cardsAnchor} className="posts-cards-anchor" aria-hidden="true" />
          <Posts category={activeCategory} />
        </main>
        <aside className="home-sidebar">
          <Sidebar onCategoryClick={handleCategoryChange} activeCategory={activeCategory} />
        </aside>
      </div>
    </>
  );
}
