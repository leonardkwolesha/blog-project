import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Post from "../post/Post";
import "./posts.css";
import { API_BASE as BASE_URL } from "../../config/api";

const API_BASE = `${BASE_URL}/api/blogs`;

export default function Posts({ category }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const catParam = new URLSearchParams(location.search).get("cat");
  const activeCategory = category || catParam || "";

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 6 };
        if (activeCategory) params.category = activeCategory;

        const res = await axios.get(API_BASE, { params, signal: controller.signal });
        const data = res.data;
        setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Posts fetch error:", err);
          setBlogs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, [page, activeCategory]);

  if (loading) {
    return (
      <div className="posts-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="post-skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="posts-empty">
        <i className="fa-solid fa-inbox posts-empty-icon" />
        <p>No posts found{activeCategory ? ` in "${activeCategory}"` : ""}.</p>
      </div>
    );
  }

  return (
    <div className="posts-wrapper">
      <div className="posts-grid">
        {blogs.map((blog) => (
          <Post key={blog._id} blog={blog} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="posts-pagination">
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="page-info">
            {page} / {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
