import { useEffect, useRef, useState } from "react";
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
  };

  // Scroll to the posts section after a category filter is applied.
  // useEffect runs after React commits the DOM (ref position is stable by then);
  // rAF defers until the browser finishes its layout pass so getBoundingClientRect
  // returns the correct value — avoids the stale-position bug of a raw setTimeout.
  useEffect(() => {
    if (!activeCategory || !postsRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (!postsRef.current) return;
      const top =
        postsRef.current.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
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
          <Posts category={activeCategory} />
        </main>
        <aside className="home-sidebar">
          <Sidebar onCategoryClick={handleCategoryChange} activeCategory={activeCategory} />
        </aside>
      </div>
    </>
  );
}
