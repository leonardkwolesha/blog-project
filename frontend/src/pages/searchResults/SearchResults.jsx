import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import "./SearchResults.css";

export default function SearchResults() {
  const searchParams = new URLSearchParams(useLocation().search);
  const query    = searchParams.get("q") || "";
  const category = searchParams.get("cat") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    setLoading(true);
    setSearched(false);

    const params = { q: query, limit: 20 };
    if (category) params.cat = category;

    axios
      .get(`${API_BASE}/api/blogs/search`, {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        setResults(Array.isArray(res.data.blogs) ? res.data.blogs : []);
        setSearched(true);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setResults([]);
          setSearched(true);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  return (
    <div className="sr-page">
      <div className="sr-header">
        <h2 className="sr-title">
          {query ? (
            <>Search results for <span className="sr-query">"{query}"</span>{category && <> in <span className="sr-query">{category}</span></>}</>
          ) : (
            "Search"
          )}
        </h2>
        {searched && !loading && (
          <p className="sr-count">
            {results.length === 0 ? "No results found" : `${results.length} result${results.length > 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {loading && (
        <div className="sr-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sr-skeleton" />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="sr-empty">
          <i className="fa-solid fa-magnifying-glass sr-empty-icon" />
          <p>No posts match "<strong>{query}</strong>".</p>
          <Link to="/" className="sr-home-link">← Back to Home</Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="sr-list">
          {results.map((blog) => {
            const date = blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "";
            return (
              <Link key={blog._id} to={`/post/${blog._id}`} className="sr-card">
                {blog.image && (
                  <img src={blog.image} alt={blog.title} className="sr-card-img" />
                )}
                <div className="sr-card-body">
                  {blog.category && blog.category !== "Uncategorized" && (
                    <span className="sr-category">{blog.category}</span>
                  )}
                  <h3 className="sr-card-title">{blog.title}</h3>
                  {blog.description && <p className="sr-card-desc">{blog.description.slice(0, 140)}…</p>}
                  <span className="sr-card-meta">
                    {blog.author?.username || "Anonymous"} · {date}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
