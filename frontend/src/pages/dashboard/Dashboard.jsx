import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CreateBlog from "../createBlog/CreateBlog";
import ViewBlogs from "../viewBlog/ViewBlogs";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const { user } = useAuth();

  return (
    <div className="db-page">
      <div className="db-topbar">
        <div className="db-welcome">
          <h1>Dashboard</h1>
          {user && <p>Welcome back, <strong>{user.username || user.email?.split("@")[0] || "Writer"}</strong></p>}
        </div>
      </div>

      <div className="db-tabs">
        <button
          className={`db-tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          My Posts
        </button>
        <button
          className={`db-tab ${activeTab === "write" ? "active" : ""}`}
          onClick={() => setActiveTab("write")}
        >
          + Write New Post
        </button>
      </div>

      <div className="db-content">
        {activeTab === "posts" && <ViewBlogs />}
        {activeTab === "write" && <CreateBlog />}
      </div>
    </div>
  );
}
