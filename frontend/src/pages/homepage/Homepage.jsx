import { useRef, useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Posts from "../../components/posts/Posts";
import "./homepage.css";

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("");
  const postsRef = useRef(null);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    // scroll to posts section when a category filter is applied
    if (cat) {
      setTimeout(() => {
        postsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <Sidebar onCategoryClick={handleCategoryChange} />
        </aside>
      </div>
    </>
  );
}
