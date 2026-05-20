import { useState } from "react";
import Header from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Posts from "../../components/posts/Posts";
import "./homepage.css";

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("");

  return (
    <>
      <Header onCategoryChange={setActiveCategory} activeCategory={activeCategory} />
      <div className="home-layout">
        <main className="home-main">
          {activeCategory && (
            <div className="home-filter-bar">
              <span>Showing: <strong>{activeCategory}</strong></span>
              <button className="clear-filter" onClick={() => setActiveCategory("")}>Clear</button>
            </div>
          )}
          <Posts category={activeCategory} />
        </main>
        <aside className="home-sidebar">
          <Sidebar onCategoryClick={setActiveCategory} />
        </aside>
      </div>
    </>
  );
}
