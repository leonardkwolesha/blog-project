import { useState } from "react";
import axios from "axios";
import "./DashboardSearch.css";
import { API_BASE } from "../../config/api";

const DashboardSearch = ({ setBlogs }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/dashboard/blogs/search?q=${encodeURIComponent(query)}`
      );
      setBlogs(res.data);
    } catch (err) {
      console.error("Dashboard search error", err);
    }
  };

  return (
    <form onSubmit={handleSearch} className="dashboard-search">
      <input
        type="text"
        placeholder="Search dashboard blogs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default DashboardSearch;
