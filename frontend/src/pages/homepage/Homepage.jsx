import { useEffect, useRef, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Posts from "../../components/posts/Posts";
import "./homepage.css";

const NAV_HEIGHT = 82; // 58px sticky nav + 24px breathing room

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("");
  const postsRef     = useRef(null); // home-main container (layout anchor)
  const cardsAnchor  = useRef(null); // zero-height div placed just before the cards grid

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  // After a category is chosen, scroll so the first blog card lands just below the
  // sticky nav.  The anchor sits between the filter-bar and the cards grid, so the
  // first card is the element the user sees at the top of the viewport after the
  // scroll completes.
  //
  // Double-rAF: outer frame lets React finish its layout pass; inner frame runs
  // after the browser has resolved any CSS transforms/animations triggered by
  // the filter-bar entrance, so getBoundingClientRect is fully stable.
  useEffect(() => {
    if (!activeCategory) return;

    let inner;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const target = cardsAnchor.current ?? postsRef.current;
        if (!target) return;
        const top =
          target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
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
